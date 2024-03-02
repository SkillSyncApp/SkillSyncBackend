import express from "express";
import imageController from "../controllers/image.controller";
import upload from "../middlewares/image_middleware";

const router = express.Router();

router.post('/image', upload.single('file'), imageController.uploadImage);

export default router;
