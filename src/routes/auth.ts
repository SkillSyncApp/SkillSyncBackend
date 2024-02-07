import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/refresh", authController.refresh);
router.put("/update-profile", authMiddleware, authController.updateProfile);

export default router;
