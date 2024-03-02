import { Router } from "express";
import authRoute from "./auth";
import postRouter from "./post";
import userRoute from "./user";
import commentRoute from "./comment"
import chatRoute from "./chat"
import fileRoute from "./file_upload"

// Export the base-router
const baseRouter = Router();

baseRouter.use('/auth', authRoute);
baseRouter.use('/posts', postRouter);
baseRouter.use('/comments', commentRoute);
baseRouter.use('/users', userRoute);
baseRouter.use('/chat', chatRoute)
baseRouter.use("/file", fileRoute);

export default baseRouter;