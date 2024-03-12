import { Request, Response } from "express";
const base = "http://localhost:3002/"; //TODO change

const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
        return res.status(400).send("No image file provided.");
      }

      const originalName = req.file.originalname;
      const serverFilename = base + req.file.path;

      res.status(200).send({ originalName, serverFilename });
  } catch (err) {
    res.status(500).send(err);
  }
};

export default {
  uploadImage,
};
