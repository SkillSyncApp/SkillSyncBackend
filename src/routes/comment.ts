import express from "express";
import commentController from "../controllers/comment.controller";
import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

router.post("/", authMiddleware, commentController.post.bind(commentController));
router.get("/", authMiddleware, commentController.get.bind(commentController));
router.get("/:ownerId", authMiddleware, commentController.getById.bind(commentController));
router.put("/:id", authMiddleware, commentController.putById.bind(commentController));
router.delete("/:id", authMiddleware, commentController.deleteById.bind(commentController));

export default router;