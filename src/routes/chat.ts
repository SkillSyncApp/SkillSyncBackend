import express from "express";
import authMiddleware from "../middlewares/auth_middleware";
import chatController from "../controllers/chat.controller"

const router = express.Router();

router.post("/send_message/:receiverId", authMiddleware, chatController.sendMessageToUser);
router.get("/list_messages/:receiverId", authMiddleware, chatController.getAllMessagesBetweenUsers);


export default router;
