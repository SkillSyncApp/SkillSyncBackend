import express from "express";
import authMiddleware from "../middlewares/auth_middleware";
import chatController from "../controllers/chat.controller"

const router = express.Router();

// TODO: middleware - check if user is part of the conversation he fetches/edit
router.get("/conversation", authMiddleware, chatController.getConversations);
router.get("/conversation/:id/messages", authMiddleware, chatController.getMessages);
router.post("/conversation/:id/messages", authMiddleware, chatController.sendMessage);

router.post("/conversation/:receiverId", authMiddleware, chatController.addConversation);
export default router;
