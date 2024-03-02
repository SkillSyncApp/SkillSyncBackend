import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: The password for the user.
 *                 example: securepassword
 *               type:
 *                 type: string
 *                 description: The type of the user.
 *                 example: student
 *               bio:
 *                 type: string
 *                 description: The bio information for the user.
 *                 example: A passionate student seeking to explore the platform.
 *             required:
 *               - name
 *               - email
 *               - password
 *               - type
 *               - bio
 *     responses:
 *       201:
 *         description: Successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *         examples:
 *           success:
 *             value:
 *               _id: '60e1558ae2a7f266d8cfdbe1'
 *               name: John Doe
 *               email: john.doe@example.com
 *               type: student
 *               bio: A passionate student seeking to explore the platform.
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *         examples:
 *           badRequest:
 *             value:
 *               message: 'Invalid data provided'
 *       406:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *         examples:
 *           userExists:
 *             value:
 *               message: 'User with this email already exists'
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with existing credentials
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: User login data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Email or password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and invalidate refresh token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login with Google credentials
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: Google login data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credentialResponse:
 *                 type: object
 *               bio:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in with Google
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/google", authController.logInGoogle);

/**
 * @swagger
 * /api/auth/refresh:
 *   get:
 *     summary: Refresh access token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/refresh", authController.refresh);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Updated user profile data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/update-profile", authMiddleware, authController.updateProfile);

/**
 * @swagger
 * /api/auth/update-additional-info:
 *   put:
 *     summary: Update user additional information
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Updated user additional information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: User additional information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/update-additional-info", authMiddleware, authController.updateAdditionalInfo);

export default router;
