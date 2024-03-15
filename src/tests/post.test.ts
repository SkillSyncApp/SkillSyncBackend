import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import Post from "../models/post";
import User from "../models/user";

let app: Express;
let accessToken: string;
let ownerId: string;

const userData = {
  _id: new mongoose.Types.ObjectId(),
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password123",
  refreshTokens: [],
  type: "student",
  image: null,
  bio: "Sample bio",
};

const secondUserData = {
  _id: new mongoose.Types.ObjectId(),
  name: "Hadar Zaguri",
  email: "hadarza@gmail.com",
  password: "hadarza",
  type: "student",
  bio: "I'm a backend developer",
};

const postData = {
  _id: new mongoose.Types.ObjectId(),
  ownerId: userData._id,
  title: "Test Post",
  content: "This is a test post.",
  image: null,
  comments: [],
};

let createdPostId: string;

beforeAll(async () => {
  app = await initApp();

  // Delete only the documents relevant to the current test
  await Post.deleteMany({ "ownerId": postData.ownerId });
  await User.deleteMany({ "email": userData.email });

  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send(userData);
  ownerId = registerResponse.body._id;

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "john.doe@example.com",
    password: "password123",
  });
  accessToken = loginResponse.body.accessToken;
});

afterAll(async () => {
  await Post.deleteMany({ ownerId: postData.ownerId });
  await User.deleteMany({ email: userData.email });

  await User.deleteMany({ email: secondUserData.email });

  // Close the MongoDB connection
  await mongoose.connection.close();
});

describe("PostController", () => {
  test("should create a new post", async () => {
    const createdPost = await request(app)
      .post("/api/posts/")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(postData);

    expect(createdPost.status).toBe(201);
    expect(createdPost.body).toHaveProperty("_id");
    expect(createdPost.body.title).toBe(postData.title);
    expect(createdPost.body.content).toBe(postData.content);
    expect(createdPost.body.ownerId).toBe(ownerId);
    expect(createdPost.body.comments).toEqual([]);
    createdPostId = createdPost.body._id;
  });

  test("should get a specific post by ID", async () => {
    const response = await request(app)
      .get(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
  });

  test("should get all posts with owners", async () => {
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

  test("should get comments by post id", async () => {
    const response = await request(app)
      .get(`/api/posts/comments/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("should update a post by ID", async () => {
    const updatedData = {
      title: "Updated Test Post",
      content: "This post has been updated.",
      image: null,
    };

    const response = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", createdPostId);
    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.content).toBe(updatedData.content);
    // expect(response.body.image).toBe(updatedData.image);
  });

  test("should return 401 when updating a non-existing post by ID", async () => {
    const nonExistingPostId = new mongoose.Types.ObjectId();
    const updatedData = {
      ownerId: userData._id,
      title: "Updated Test Post",
      content: "This post has been updated.",
      image: null,
      comments: [],
    };

    const response = await request(app)
      .put(`/api/posts/${nonExistingPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error", "Forbidden");
  });

  test("should return 401 when creating a post without authentication", async () => {
    const response = await request(app).post("/api/posts/").send(postData);

    expect(response.status).toBe(401);
  });

  test("should delete a post by ID", async () => {
    const response = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Model deleted successfully"
    );
  });

  test("should return 403 when updating a post with missing fields", async () => {
    const updatedData = {
      // Omitting required fields: title and content
    };

    const response = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
  });

  test("should return 404 when deleting a non-existing post by ID", async () => {
    const nonExistingPostId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/posts/${nonExistingPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Model not found");
  });

  test("should return 401 when updating a post without authentication", async () => {
    const updatedData = {
      title: "Updated Test Post",
      content: "This post has been updated.",
      image: null,
    };

    const response = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .send(updatedData);

    expect(response.status).toBe(401);
  });
});
