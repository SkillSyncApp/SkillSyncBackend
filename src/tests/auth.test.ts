import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

jest.mock("google-auth-library");
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
  app = await initApp();
  await User.deleteMany({ email: userData.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Authentication tests", () => {
  describe("Registration API", () => {
    it("should return 500 given error during user registration", async () => {
      // Mocking the User.create method to throw an error
      jest.spyOn(User, "create").mockImplementationOnce(() => {
        throw new Error("Mocked user creation error");
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(500);

      expect(response.text).toContain("Mocked user creation error");
    });

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
  });

  describe("Login API", () => {
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

    // Test for successful login
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
        image: {},
        email: "john.doe@example.com",
        bio: "Sample bio",
      });
    });
  });

  describe("Logout API", () => {
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
  });

  describe("Refresh Token API", () => {
    it("should refresh access token with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Authorization", `Bearer ${refreshToken}`)
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it("should handle expired refresh token after timeout", async () => {
      const expiredRefreshToken = jwt.sign(
        { _id: "userId" },
        "expiredSecret",
        { expiresIn: "-1s" } // Expired 1 second ago
      );

      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Authorization", `Bearer ${expiredRefreshToken}`)
        .expect(401);

      expect(response.text).toContain("Unauthorized");
    });

    it("should handle missing authorization token during token refresh", async () => {
      const response = await request(app).post("/api/auth/refresh").expect(401);

      expect(response.text).toContain("Unauthorized");
    });

    it("should handle invalid authorization token during token refresh", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Authorization", "Bearer InvalidToken")
        .expect(401);

      expect(response.text).toContain("Unauthorized");
    });
  });

  // Update profile tests
  describe("Update Profile API", () => {
    // Test for successfully updating user profile
    it("should update user profile with valid data", async () => {
      const updatedData = {
        name: "Jane Doe",
        bio: "Updated bio",
      };

      const response = await request(app)
        .put("/api/auth/update-profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toEqual(updatedData.name);
      expect(response.body.user.bio).toEqual(updatedData.bio);
    });

    // Test for handling missing authorization token during profile update
    it("should handle missing authorization token during profile update", async () => {
      const response = await request(app)
        .put("/api/auth/update-profile")
        .send({})
        .expect(401);

      expect(response.text).toContain("Unauthorized");
    });
  });

  // Update additional info tests
  describe("Update Additional Info API", () => {
    // Test for successfully updating user additional info
    it("should update user additional info with valid data", async () => {
      const updatedData = {
        type: "teacher",
        bio: "Updated additional info",
      };

      const response = await request(app)
        .put("/api/auth/update-additional-info")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.type).toEqual(updatedData.type);
      expect(response.body.user.bio).toEqual(updatedData.bio);
    });

    // Test for handling missing authorization token during additional info update
    it("should handle missing authorization token during additional info update", async () => {
      const response = await request(app)
        .put("/api/auth/update-additional-info")
        .send({})
        .expect(401);

      expect(response.text).toContain("Unauthorized");
    });

    it("should return 400 if bio field is missing", async () => {
      const requestData = {
        // Missing bio field
        type: "student",
      };

      const response = await request(app)
        .put("/api/auth/update-additional-info")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestData)
        .expect(400);

      expect(response.text).toBe(
        "Can't update the user additional info - missing info"
      );
    });

    // Test for missing type field
    it("should return 400 if type field is missing", async () => {
      const requestData = {
        bio: "Updated additional info",
        // Missing type field
      };

      const response = await request(app)
        .put("/api/auth/update-additional-info")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestData)
        .expect(400);

      expect(response.text).toBe(
        "Can't update the user additional info - missing info"
      );
    });

    // Test for missing both bio and type fields
    it("should return 400 if both bio and type fields are missing", async () => {
      const requestData = {
        // Missing both bio and type fields
      };

      const response = await request(app)
        .put("/api/auth/update-additional-info")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(requestData)
        .expect(400);

      expect(response.text).toBe(
        "Can't update the user additional info - missing info"
      );
    });

    it("should return 404 if user is not found", async () => {
      // Mocking the User.findByIdAndUpdate method to return null
      jest.spyOn(User, "findByIdAndUpdate").mockResolvedValueOnce(null);

      const updatedData = {
        type: "student",
        bio: "Updated additional info",
      };

      const response = await request(app)
        .put("/api/auth/update-additional-info")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updatedData)
        .expect(404);

      expect(response.text).toBe("User not found");
    });

    it("should return 500 given errors during update", async () => {
      // Mocking the User.findByIdAndUpdate method to throw an error
      jest.spyOn(User, "findByIdAndUpdate").mockImplementationOnce(() => {
        throw new Error("Mocked update error");
      });

      const updatedData = {
        type: "student",
        bio: "Updated additional info",
      };

      const response = await request(app)
        .put("/api/auth/update-additional-info")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updatedData)
        .expect(500);

      expect(response.text).toBe("Mocked update error");
    });
  });

  describe("Google Login API", () => {
    it("should return 200 with access and refresh tokens for Google login", async () => {
      const mockRes = {
        status: jest.fn(() => mockRes),
        send: jest.fn(),
      };

      const mockGoogleUser = {
        name: "Hadar Zaguri",
        email: "hadargoogle@gmail.com",
        picture: "http://hadargoogle.png",
      };

      // Mock verifyIdToken function of OAuth2Client
      (OAuth2Client.prototype.verifyIdToken as any).mockResolvedValue({
        getPayload: () => mockGoogleUser,
      });

      // Send a request to the Google login endpoint
      const response = await request(app)
        .post("/api/auth/google")
        .send({ credentialResponse: { credential: "mockedGoogleCredential" } });

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe(mockGoogleUser.name);
      expect(response.body.user.email).toBe(mockGoogleUser.email);
      expect(response.body.user.image.originalName).toBe(
        "google " + mockGoogleUser.name + ".png"
      );
      expect(response.body.user.image.serverFilename).toBe(
        mockGoogleUser.picture
      );

      (OAuth2Client.prototype.verifyIdToken as any).mockRestore();

      // delete user
      await User.deleteMany({ email: mockGoogleUser.email });
    });

    it("should return 500 for invalid Google credential", async () => {
      const mockRes = {
        status: jest.fn(() => mockRes),
        send: jest.fn(),
      };

      // Mock verifyIdToken function of OAuth2Client to throw an error
      (OAuth2Client.prototype.verifyIdToken as any).mockRejectedValue(
        new Error("Invalid token")
      );

      // Send a request to the Google login endpoint
      const response = await request(app)
        .post("/api/auth/google")
        .send({ credentialResponse: { credential: "mockedGoogleCredential" } });

      // Assert response status code and error message
      expect(response.status).toBe(500);
      expect(response.text).toBe("Invalid Google credential");
    });
  });
});
