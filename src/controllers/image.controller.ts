import { Request, Response } from "express";

const base = "http://localhost:3002/";

const uploadImage = async (req: Request, res: Response) => {
    res.status(200).send({ url: base + req.file?.path });
};

export default {
    uploadImage
};
