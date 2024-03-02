import express from "express";
import userController, { getUserOverview } from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

router.get("/:id?", authMiddleware, getUserOverview);
router.post("/", authMiddleware, userController.create.bind(userController));
router.put("/:id", authMiddleware, userController.putById.bind(userController));
router.delete("/:id", authMiddleware, userController.deleteById.bind(userController));

export default router;