import express from "express";
import imageController from "../controllers/image.controller";
import upload from "../middlewares/image_middleware";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadedImage:
 *       type: object
 *       properties:
 *         image:
 *           type: object
 *           properties:
 *             originalName:
 *               type: string
 *               description: The original name of the updated image file
 *             serverFilename:
 *               type: string
 *               description: The URL of the updated post image on the server
 *           description: The updated image object of the post
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
 *               $ref: '#/components/schemas/UploadedImage'
 *       500:
 *         description: Internal server error
 */

router.post("/image", upload.single("file"), imageController.uploadImage);

export default router;
