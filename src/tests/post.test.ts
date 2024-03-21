import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import Post from "../models/post";
import User from "../models/user";
import PostModel from "../models/post";

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
  comments: [],
};

let createdPostId: string;

beforeAll(async () => {
  app = await initApp();

  // Delete only the documents relevant to the current test
  await Post.deleteMany({ ownerId: postData.ownerId });
  await User.deleteMany({ email: userData.email });

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
  await User.deleteMany({
    email: { $in: [userData.email, secondUserData.email] },
  });

  // Close the MongoDB connection
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
    expect(createdPost.body.ownerId).toBe(ownerId);
    expect(createdPost.body.comments).toEqual([]);
    createdPostId = createdPost.body._id;
  });

  it("should get a specific post by ID", async () => {
    const response = await request(app)
      .get(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
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

  it("should return 500 when encountering an internal server error during post creation", async () => {
    jest.spyOn(Post, "create").mockImplementationOnce(async (req, res) => {
      throw new Error("Mocked post creation error");
    });

    const response = await request(app)
      .post("/api/posts/")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(postData);

    expect(response.status).toBe(500);
  });

  it("should get comments by post id", async () => {
    const response = await request(app)
      .get(`/api/posts/comments/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it("should return 400 for invalid ownerId", async () => {
    const response = await request(app)
      .get("/api/posts/invalidOwnerId")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "ownerId isn't valid" });
  });

  test("should return 400 for invalid postId", async () => {
    const response = await request(app)
      .get("/api/posts/comments/invalidPostId")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "postId isn't valid" });
  });

  it("should update a post by ID", async () => {
    const updatedData = {
      title: "Updated Test Post",
      content: "This post has been updated.",
    };

    const response = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", createdPostId);
    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.content).toBe(updatedData.content);
  });

  it("should return 404 when updating a non-existing post by ID", async () => {
    const nonExistingPostId = new mongoose.Types.ObjectId();
    const updatedData = {
      ownerId: userData._id,
      title: "Updated Test Post",
      content: "This post has been updated.",
      comments: [],
    };

    const response = await request(app)
      .put(`/api/posts/${nonExistingPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Model not found");
  });

  it("should return 401 when creating a post without authentication", async () => {
    const response = await request(app).post("/api/posts/").send(postData);

    expect(response.status).toBe(401);
  });

  it("should delete a post by ID", async () => {
    const response = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Model deleted successfully"
    );
  });

  it("should return 500 when encountering an internal server error during delete post", async () => {
    jest.spyOn(PostModel, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(postData);

    expect(response.status).toBe(500);
  });

  it("should return 404 when updating a post with missing fields", async () => {
    const updatedData = {
      // Omitting required fields: title and content
    };

    const response = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 404 when deleting a non-existing post by ID", async () => {
    const nonExistingPostId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/posts/${nonExistingPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Model not found");
  });

  it("should return 401 when updating a post without authentication", async () => {
    const updatedData = {
      title: "Updated Test Post",
      content: "This post has been updated.",
    };

    const response = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .send(updatedData);

    expect(response.status).toBe(401);
  });

  it("should return 404 if post is not found", async () => {
    const nonExistingPostId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/posts/comments/${nonExistingPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Post not found" });
  });

  it("should return internal server error (500) on update a post by ID", async () => {
    jest.spyOn(PostModel, "findByIdAndUpdate").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const updatedData = {
      title: "Updated Test Post",
      content: "This post has been updated.",
    };

    const response = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedData);

    expect(response.status).toBe(500);
  });
});
