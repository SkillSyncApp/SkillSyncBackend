import { Router } from 'express';
import authRoute from './auth'
import postRouter from './post';
import userRoute from './user';
import commentRoute from './comment'
import chatRoute from './chat'

// Export the base-router
const baseRouter = Router();

baseRouter.use('/auth', authRoute);
baseRouter.use('/posts', postRouter);
baseRouter.use('/comments', commentRoute);
baseRouter.use('/users', userRoute);
baseRouter.use('/chat', chatRoute)


export default baseRouter;