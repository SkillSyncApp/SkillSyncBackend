import express from "express";
import userController, {
  getUserOverview,
} from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: APIs for managing users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         image:
 *           type: object
 *           properties:
 *             originalName:
 *               type: string
 *               description: The original name of the updated image file
 *             serverFilename:
 *               type: string
 *               description: The URL of the updated post image on the server
 *           description: The updated image object of the post
 *         bio:
 *           type: string
 *           description: The biography of the user
 *         type:
 *           type: string
 *           enum: [admin, regular]
 *           description: The type of user (admin or regular)
 *
 *     UserUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The updated name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The updated email address of the user
 *         image:
 *           type: object
 *           properties:
 *             originalName:
 *               type: string
 *               description: The original name of the updated image file
 *             serverFilename:
 *               type: string
 *               description: The URL of the updated post image on the server
 *           description: The updated image object of the post
 *         bio:
 *           type: string
 *           description: The updated biography of the user
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         description: ID of the user to fetch. If not provided, retrieves details of the logged-in user.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
router.get("/:id?", authMiddleware, getUserOverview);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *           example:
 *             name: "John Doe"
 *             email: "john.doe@example.com"
 *             image: {
 *               "originalName": "Screenshot 2024-02-22 at 23.50.34.png",
 *               "serverFilename": "http://localhost:3002/public/1710631124924.50.34.png"
 *             }
 *             bio: "Sample bio"
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authMiddleware, userController.putById.bind(userController));

export default router;
