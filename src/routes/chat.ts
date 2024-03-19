import express from "express";
import authMiddleware from "../middlewares/auth_middleware";
import chatController from "../controllers/chat.controller";
import conversationGuardMiddleware from "../middlewares/conversation_guard_middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: The Chat API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the message
 *         sender:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The unique identifier of the sender
 *             name:
 *               type: string
 *               description: The name of the sender
 *             image:
 *               type: object
 *               properties:
 *                 originalName:
 *                   type: string
 *                   description: The original name of the image file
 *                 serverFilename:
 *                   type: string
 *                   description: The URL of the sender's profile image on the server
 *               description: The image object of the sender
 *         content:
 *           type: string
 *           description: The content of the message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message was created
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the conversation
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *     MessageRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: The content of the message
 */

/**
 * @swagger
 * /api/chat/conversation:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Internal server error
 */
router.get("/conversation", authMiddleware, chatController.getConversations);

/**
 * @swagger
 * /api/chat/conversation/with/{userId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to get conversation with
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation with the specified user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/conversation/with/:userId",
  authMiddleware,
  chatController.getConversationWith
);

/**
 * @swagger
 * /api/chat/conversation/with/{userId}:
 *   post:
 *     summary: Start a conversation with a user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to start a conversation with
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Conversation already exists
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/conversation/with/:userId",
  authMiddleware,
  chatController.addConversation
);

/**
 * @swagger
 * /api/chat/conversation/{id}/messages:
 *   get:
 *     summary: Get messages of a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages of the conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/conversation/:id/messages",
  authMiddleware,
  conversationGuardMiddleware,
  chatController.getMessages
);

export default router;
