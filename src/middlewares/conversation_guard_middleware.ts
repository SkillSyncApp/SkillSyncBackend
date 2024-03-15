import { Request, Response, NextFunction } from 'express';
import ChatModel from '../models/chat';

export const isUserPartOfConversation = async (conversationId: string, userId: string) => {
    return (await ChatModel.find({
        users: { $in: [userId] },
        _id: conversationId,
    })).length > 0;
}

const conversationGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { id: conversationId } = req.params;
    const userId = req.user._id;

    const canAccessConversation = await isUserPartOfConversation(conversationId, userId);

    if (!canAccessConversation) {
        return res.status(403).send('User is not part of conversation');
    }

    next();
}

export default conversationGuardMiddleware;