import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import Post, { IPost } from "../models/post";
import User, { IUser } from "../models/user";
import PostModel from "../models/post";

let app: Express;
let accessToken: string;
let ownerId: string;

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

const postData = {
  _id: new mongoose.Types.ObjectId(),
  ownerId: userData._id,
  title: 'Test Post',
  content: 'This is a test post.',
  image: 'test-image.jpg',
  comments: [],
};

let createdPostId: string;

beforeAll(async () => {
  app = await initApp();
  await Post.deleteMany({ ownerId: postData._id });
  await User.deleteMany({ email: userData.email });
  const response = await request(app).post("/api/auth/register").send(userData);
  ownerId = response.body._id;
  const response2 = await request(app)
    .post("/api/auth/login")
    .send({ email: "john.doe@example.com", password: "password123" });
  accessToken = response2.body.accessToken;
});

afterAll(async () => {
  await Post.deleteMany({ ownerId: postData.ownerId });
  await Post.deleteMany({ ownerId: postData._id });
  await mongoose.connection.close();
});

describe("PostController", () => {
  it("should create a new post", async () => {

    const createdPost = await request(app)
      .post("/api/posts/")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(postData);

    expect(createdPost.status).toBe(201);
    expect(createdPost.body).toHaveProperty("_id");
    expect(createdPost.body.title).toBe(postData.title);
    expect(createdPost.body.content).toBe(postData.content);
    expect(createdPost.body.image).toBe(postData.image);
    expect(createdPost.body.ownerId).toBe(ownerId); 
    expect(createdPost.body.comments).toEqual([]);
    createdPostId = createdPost.body._id;
  });

  it("should get all posts with owners", async () => {
    const response = await request(app)
      .get("/api/posts")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should get posts by a specific user", async () => {
    const response = await request(app)
      .get(`/api/posts/${ownerId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should get comments by post id", async () => {
    const response = await request(app)
      .get(`/api/posts/comments/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it("should update a post by ID", async () => {
    const updatedData = {
      title: "Updated Test Post",
      content: "This post has been updated.",
      image: "updated-image.jpg",
    };

    const response = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", createdPostId);
    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.content).toBe(updatedData.content);
    expect(response.body.image).toBe(updatedData.image);
  });

  it("should delete a post by ID", async () => {
    const response = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Model deleted successfully");
  });

  it("should return 404 when deleting a non-existing post by ID", async () => {
    const nonExistingPostId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/posts/${nonExistingPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Model not found");
  });

  it("should return 401 when updating a non-existing post by ID", async () => {
    const nonExistingPostId = new mongoose.Types.ObjectId();
    const updatedData = {
      title: "Updated Test Post",
      content: "This post has been updated.",
      image: "updated-image.jpg",
    };

    const response = await request(app)
      .put(`/api/posts/${nonExistingPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Model not found");
  });
});
