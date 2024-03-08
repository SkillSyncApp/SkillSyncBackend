import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User, { IUser } from "../models/user";

let app: Express;

const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password123",
  type: "student",
  bio: "Sample bio",
};

let accessToken: string;
let refreshToken: string;
let newRefreshToken: string;

beforeAll(async () => {
  console.log("initApp");
  app = await initApp();
  await User.deleteMany({ email: userData.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth tests", () => {
  describe("Registration API", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);
      expect(response.statusCode).toBe(201);

      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.type).toBe(userData.type);
      expect(response.body.bio).toBe(userData.bio);
    });
  });

  it("should handle missing information", async () => {
    const incompleteData = {
      name: "John Doe",
      email: "john.doe@example.com",
      // Missing password, type, bio
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(incompleteData)
      .expect(400);

    expect(response.text).toBe("can't register the user - missing info");
  });

  it("should handle duplicate email registration", async () => {
    const duplicateResponse = await request(app)
      .post("/api/auth/register")
      .send(userData)
      .expect(406);

    expect(duplicateResponse.text).toBe("User already exists");
  });

  describe("Login  API", () => {
    it("should return 400 if email or password is missing", async () => {
      const response = await request(app).post("/api/auth/login").send({});

      expect(response.status).toBe(400);
      expect(response.text).toContain("missing email or password");
    });

    it("should return 401 if email or password is incorrect", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.text).toContain("email or password incorrect");
    });

    it("should return 200 with access and refresh tokens if credentials are correct", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "john.doe@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
      expect(response.body.user).toEqual({
        _id: expect.any(String),
        type: "student",
        name: "John Doe",
        email: "john.doe@example.com",
        bio: "Sample bio",
      });
    });
  });

  describe("LogOut API", () => {
    it("should handle missing authorization token during logout", async () => {
      const response = await request(app).post("/api/auth/logout").expect(401);

      expect(response.text).toContain("Unauthorized");
    });

    it("should handle invalid authorization token during logout", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", "Bearer InvalidToken")
        .expect(401);

      expect(response.text).toContain("Unauthorized");
    });
    // TODO check token
  });
});
