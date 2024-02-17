import express from "express";
import authMiddleware from "../middlewares/auth_middleware";
import chatController from "../controllers/chat.controller"

const router = express.Router();

router.get("/messages/:receiverId", authMiddleware, chatController.getConversation);
router.get("/conversationOverView", authMiddleware, chatController.getConversationsOverView)
router.get("/getAllConversations", authMiddleware, chatController.getAllConversations)

router.post("/sendMessage/:receiverId", authMiddleware, chatController.sendMessageToUser);
router.post('/addConversation/:receiverId', authMiddleware, chatController.addConversation)

router.delete('/', authMiddleware, chatController.deleteAllConversations)
export default router;
