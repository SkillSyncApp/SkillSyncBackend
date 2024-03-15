import { Request, Response, NextFunction } from 'express';
import ChatModel from '../models/chat';

const conversationGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { id: conversationId } = req.params;
    const userId = req.user._id;

    const isUserPartOfConversation = (await ChatModel.find({
        users: { $in: [userId] },
        _id: conversationId,
    })).length > 0;

    if (!isUserPartOfConversation) {
        return res.status(403).send('User is not part of conversation');
    }
    
    next();
}

export default conversationGuardMiddleware;