import express from "express";
import authMiddleware from "../middlewares/auth_middleware";
import chatController from "../controllers/chat.controller"

const router = express.Router();

router.post("/send-message/:receiverId", authMiddleware, chatController.sendMessageToUser);
router.get("/list-messages/:receiverId", authMiddleware, chatController.getAllMessagesBetweenUsers);
router.get("/conversations", authMiddleware, chatController.getConversationsOverView)

export default router;
