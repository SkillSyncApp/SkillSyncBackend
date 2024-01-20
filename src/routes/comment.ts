import express from "express";
import commentController from "../controllers/comment.controller";
import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

router.post("/:postId", authMiddleware, commentController.addComment);
router.delete("/:postId/:commentId", authMiddleware, commentController.deleteComment);

export default router;