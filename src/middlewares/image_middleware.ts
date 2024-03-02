import multer from "multer";
import { Request, Response } from "express";

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req: Request, file, cb) {
      cb(null, 'public/');
    },
    filename: function (req: Request, file, cb) {
      const ext = file.originalname.split('.')
        .filter(Boolean)
        .slice(1)
        .join('.');
      cb(null, Date.now() + "." + ext);
    }
  }),
});

export default upload;
