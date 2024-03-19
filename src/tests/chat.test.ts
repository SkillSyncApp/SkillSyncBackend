import supertest from "supertest"; // Changed import statement
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../models/user";
import ChatModel from "../models/chat";

let app: Express;
let ownerId: string;
let ownerId2: string;
let accessToken: string;
let accessToken2: string;
let conversationId: string;

const userData = {
  name: "Hadar Zaguri",
  email: "hadar.zaguri@gmail.com",
  password: "password123",
  type: "student",
  bio: "Sample bio",
};

const userData2 = {
  name: "John Doe",
  email: "John@gamil.com",
  password: "password123",
  type: "company",
  bio: "Sample bio",
};

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({ email: { $in: [userData.email, userData2.email] } });
  await ChatModel.deleteMany({ _id: conversationId });

  // Register two users
  const registerResponse = await supertest(app)
    .post("/api/auth/register")
    .send(userData);
  ownerId = registerResponse.body._id;

  const registerResponse2 = await supertest(app)
    .post("/api/auth/register")
    .send(userData2);
  ownerId2 = registerResponse2.body._id;

  // Log in the first user and get access token
  const loginResponse = await supertest(app).post("/api/auth/login").send({
    email: userData.email,
    password: userData.password,
  });
  accessToken = loginResponse.body.accessToken;

  // Log in the second user and get access token
  const loginResponse2 = await supertest(app).post("/api/auth/login").send({
    email: userData2.email,
    password: userData2.password,
  });
  accessToken2 = loginResponse2.body.accessToken;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: [userData.email, userData2.email] } });
  await ChatModel.deleteMany({ _id: conversationId });

  // Close the MongoDB connection
  await mongoose.connection.close();
});

describe("Chat Routes", () => {
  it("should get conversations for a user", async () => {
    // Test fetching conversations for the first user
    const res = await supertest(app)
      .get("/api/chat/conversation")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should add a conversation with another user", async () => {
    const res = await supertest(app)
      .post(`/api/chat/conversation/with/${ownerId2}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should get conversation with another user", async () => {
    const res = await supertest(app)
      .get(`/api/chat/conversation/with/${ownerId2}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should handle internal server error when fetching conversations", async () => {
    jest.spyOn(ChatModel, "find").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    // Test fetching conversations for the first user
    const res = await supertest(app)
      .get("/api/chat/conversation")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ message: "Internal Server Error" });
  });

  it("should handle internal server error when adding a conversation with another user", async () => {
    // Mocking the find method on the ChatModel prototype to throw an error
    jest.spyOn(ChatModel, "findById").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    // Test adding a conversation with another user for the first user
    const res = await supertest(app)
      .post(`/api/chat/conversation/with/${ownerId2}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ message: "Internal Server Error" });
  });

  //   it("should handle internal server error when getting conversation with another user", async () => {
  //     // Mocking the find method on the ChatModel prototype to throw an error
  //     jest.spyOn(ChatModel, "find").mockImplementation(() => {
  //       throw new Error("Internal Server Error");
  //     });

  // Test getting conversation with the second user for the first user
  //     const res = await supertest(app)
  //       .get(`/api/chat/conversation/with/${ownerId2}`)
  //       .set("Authorization", `Bearer ${accessToken}`);
  //     expect(res.statusCode).toEqual(500);
  //     expect(res.body).toEqual({ message: "Internal Server Error" });
  //   });
});
