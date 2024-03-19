import express from "express";
import imageController from "../controllers/image.controller";
import upload from "../middlewares/image_middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Image
 *   description: APIs for image upload
 */

/**
 * @swagger
 * /api/file/image:
 *   post:
 *     summary: Upload an image
 *     tags: [Image]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: URL of the uploaded image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the uploaded image
 *       500:
 *         description: Internal server error
 */
router.post("/image", upload.single("file"), imageController.uploadImage);

export default router;
