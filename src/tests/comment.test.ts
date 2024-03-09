import request from 'supertest';
import { Express } from "express";
import mongoose from 'mongoose';
import CommentModel from '../models/comment';
import PostModel from '../models/post';
import initApp from "../app";

const generateObjectId = () => new mongoose.Types.ObjectId();

let app: Express;
let accessToken: string;
let ownerId: string;
let postId: string;
let commentId: string;

const userData = {
  _id: new mongoose.Types.ObjectId(),
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  refreshTokens: [],
  type: 'student',
  image: 'image.png',
  bio: 'Sample bio',
};

beforeAll(async () => {
  app = await initApp();

  const response = await request(app).post("/api/auth/register").send(userData);
  ownerId = response.body._id;
  const response2 = await request(app)
    .post("/api/auth/login")
    .send({ email: "john.doe@example.com", password: "password123" });
  accessToken = response2.body.accessToken;

  const post = await PostModel.create({
    ownerId: generateObjectId(),
    title: 'Test Post',
    content: 'This is a test post.',
    image: 'test-image.jpg',
    comments: [],
  });

  postId = post._id.toString();
});

afterAll(async () => {
  await CommentModel.findByIdAndDelete(commentId);
  await PostModel.findByIdAndDelete(postId);
  await mongoose.connection.close();
});

describe('CommentController', () => {
  describe('addComment', () => {
    it('should add a new comment to a post', async () => {
      const userId = generateObjectId();
      const content = 'This is a test comment.';

      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .send({ userId, content })
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.content).toBe(content);
      expect(response.body.postId).toBe(postId);

      commentId = response.body._id;
    });

    it('should return 404 when adding comment to non-existing post', async () => {
      const nonExistingPostId = generateObjectId();
      const userId = generateObjectId();
      const content = 'This comment should not be added.';

      const response = await request(app)
        .post(`/api/comments/${nonExistingPostId}`)
        .send({ userId, content })
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Post not found');
    });
  });

  describe('deleteComment', () => {
    it('should delete an existing comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${postId}/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Comment deleted successfully');
    });

    it('should return 404 when deleting non-existing comment', async () => {
      const nonExistingCommentId = generateObjectId();

      const response = await request(app)
        .delete(`/api/comments/${postId}/${nonExistingCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Comment not found');
    });
  });
});
