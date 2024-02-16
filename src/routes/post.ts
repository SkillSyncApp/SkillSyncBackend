import express from "express";
import postController from "../controllers/post.controller";
import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

router.get("/", authMiddleware, postController.get.bind(postController));
router.post("/", authMiddleware, postController.create.bind(postController));
router.get("/:ownerId", authMiddleware, postController.getPostsByUserId.bind(postController));
router.put("/:id", authMiddleware, postController.putById.bind(postController));
router.delete("/:id", authMiddleware, postController.deleteById.bind(postController));
router.get("/comments/:id", authMiddleware, postController.getCommentsByPostId);

export default router;
