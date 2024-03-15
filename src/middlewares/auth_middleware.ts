import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  token: string,
  callback: (err: any, user: { _id: string }) => void
) => {
  jwt.verify(token, process.env.JWT_SECRET, callback);
};

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (token == null) return res.sendStatus(401);
  verifyToken(token, (err: any, user: { _id: string }) => {
    if (err) return res.sendStatus(401);

    req.user = user as { _id: string };
    next();
  });
};

export default authMiddleware;
