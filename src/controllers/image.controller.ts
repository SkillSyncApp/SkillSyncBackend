import { Request, Response } from "express";

const base = "http://localhost:3002/"; //TODO change

const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
        return res.status(400).send("No image file provided.");
      }

      res.status(200).send({ url: base + req.file?.path });
  } catch (err) {
    res.status(500).send(err);
  }
};

export default {
  uploadImage,
};
