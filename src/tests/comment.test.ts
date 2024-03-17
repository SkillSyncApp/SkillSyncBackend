import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import CommentModel from "../models/comment";
import PostModel from "../models/post";
import initApp from "../app";
import Post from "../models/post";
import User from "../models/user";

const generateObjectId = () => new mongoose.Types.ObjectId();

let app: Express;
let accessToken: string;
let ownerId: string;
let postId: string;
let commentId: string;

const userData = {
  _id: new mongoose.Types.ObjectId(),
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password123",
  refreshTokens: [],
  type: "student",
  bio: "Sample bio",
};

const postData = {
  _id: new mongoose.Types.ObjectId(),
  ownerId: userData._id,
  title: "Test Post",
  content: "This is a test post.",
  comments: [],
};

beforeAll(async () => {
  app = await initApp();

  await Post.deleteMany({ ownerId: postData.ownerId });
  await User.deleteMany({ email: userData.email });

  const response = await request(app).post("/api/auth/register").send(userData);
  ownerId = response.body._id;

  const response2 = await request(app)
    .post("/api/auth/login")
    .send({ email: "john.doe@example.com", password: "password123" });

  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send(userData);
  ownerId = registerResponse.body._id;
  accessToken = response2.body.accessToken;

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "john.doe@example.com",
    password: "password123",
  });
  accessToken = loginResponse.body.accessToken;

  const postResponse = await request(app)
    .post(`/api/posts/`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send(postData);

  postId = postResponse.body._id;
});

afterAll(async () => {
  await PostModel.findByIdAndDelete(postId);
  await CommentModel.findByIdAndDelete(commentId);
  await mongoose.connection.close();
});

describe("CommentController", () => {
  describe("addComment", () => {
    it("should add a new comment to a post", async () => {
      const userId = generateObjectId();
      const content = "This is a test comment.";

      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .send({ userId, content })
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.content).toBe(content);
      expect(response.body.postId).toBe(postId);

      commentId = response.body._id;
    });

    it("should return 404 when adding comment to non-existing post", async () => {
      const nonExistingPostId = generateObjectId();
      const userId = generateObjectId();
      const content = "This comment should not be added.";

      const response = await request(app)
        .post(`/api/comments/${nonExistingPostId}`)
        .send({ userId, content })
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Post not found");
    });

    it("should return 401 when adding comment without authentication", async () => {
      const userId = generateObjectId();
      const content = "This comment should not be added.";

      await request(app)
        .post(`/api/comments/${postId}`)
        .send({ userId, content })
        .expect(401);
    });

    it("should return 500 when encountering internal server error while adding comment", async () => {
      // Mocking the CommentModel constructor to throw an error when called
      jest.spyOn(CommentModel.prototype, "save").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      const userId = generateObjectId();
      const content = "This is a test comment.";

      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .send({ userId, content })
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(500);

      expect(response.body).toHaveProperty("error", "Internal Server Error");
    });
  });

  describe("deleteComment", () => {
    it("should delete an existing comment", async () => {
      const response = await request(app)
        .delete(`/api/comments/${postId}/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Comment deleted successfully"
      );
    });

    it("should return 404 when deleting non-existing post", async () => {
      const nonExistingCommentId = generateObjectId();

      const response = await request(app)
        .delete(`/api/comments/${postId}/${nonExistingCommentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Comment not found");
    });

    it("should return 401 when deleting comment without authentication", async () => {
      await request(app)
        .delete(`/api/comments/${postId}/${commentId}`)
        .expect(401);
    });

    it("should return 401 when deleting comment without ownership", async () => {
      const otherUserResponse = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Other User",
          email: "other.user@example.com",
          password: "password456",
          type: "student",
        });

      await request(app)
        .delete(`/api/comments/${postId}/${commentId}`)
        .set("Authorization", `Bearer ${otherUserResponse.body.accessToken}`)
        .expect(401);
    });

    it("should return 500 when encountering internal server error while deleting comment", async () => {
      jest.spyOn(PostModel, "findByIdAndUpdate").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      const response = await request(app)
        .delete(`/api/comments/${postId}/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(500);

      expect(response.body).toHaveProperty("error", "Internal Server Error");
    });
  });
});
