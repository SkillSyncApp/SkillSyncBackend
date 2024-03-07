import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password
 *       example:
 *         email: 'bob@gmail.com'
 *         password: '123456'
 *     UserRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - type
 *         - bio
 *       properties:
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *         type:
 *           type: string
 *           description: The user's type
 *         bio:
 *           type: string
 *           description: Additional information about the user
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         type:
 *           type: string
 *           description: The user's type
 *         bio:
 *           type: string
 *           description: Additional information about the user
 *     Tokens:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The JWT access token
 *         refreshToken:
 *           type: string
 *           description: The JWT refresh token
 *       example:
 *         accessToken: '123cd123x1xx1'
 *         refreshToken: '134r2134cr1x3c'
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRequest'
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '400':
 *         description: Bad request - missing information
 *       '406':
 *         description: User already exists
 */

router.post("/register", authController.register);
router.post("/google", authController.logInGoogle);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: The access & refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       '400':
 *         description: Bad request - missing email or password
 *       '401':
 *         description: Unauthorized - email or password incorrect
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout a user
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the auth header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout completed successfully
 */
router.get("/auth/logout", authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     description: Endpoint to refresh the access token using a refresh token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New access & refresh tokens generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Unauthorized - Invalid or expired refresh token.
 */
router.get("/auth/refresh", authController.refresh);

/**
 * @swagger
 * /update-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     description: Update user's name, bio, and image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *               bio:
 *                 type: string
 *                 description: Additional information about the user
 *               image:
 *                 type: string
 *                 description: URL of the user's profile image
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Bad request - missing name or bio
 *       404:
 *         description: User not found
 */
router.put("/update-profile", authMiddleware, authController.updateProfile);

/**
 * @swagger
 * /update-additional-info:
 *   put:
 *     summary: Update user additional information
 *     tags: [Auth]
 *     description: Update user's type and bio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The user's type
 *               bio:
 *                 type: string
 *                 description: Additional information about the user
 *     responses:
 *       200:
 *         description: User additional information updated successfully
 *       400:
 *         description: Bad request - missing type or bio
 *       404:
 *         description: User not found
 */
router.put(
  "/update-additional-info",
  authMiddleware,
  authController.updateAdditionalInfo
);

export default router;
