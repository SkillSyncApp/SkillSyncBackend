import express from "express";
const router = express.Router();
import userController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth_middleware";

router.get("/", authMiddleware, userController.get.bind(userController));
router.get("/:id", authMiddleware, userController.getById.bind(userController));
router.post("/", authMiddleware, userController.post.bind(userController));

// router.put("/:id", authMiddleware, userController.putById.bind(userController));
// router.delete("/:id", authMiddleware, userController.deleteById.bind(userController));

export default router;