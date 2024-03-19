import { Request, Response, NextFunction } from 'express';
import conversationGuardMiddleware, { isUserPartOfConversation } from '../../src/middlewares/conversation_guard_middleware';
import ChatModel from '../models/chat';

jest.mock('../models/chat', () => ({
    find: jest.fn(),
}));

describe('conversationGuardMiddleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let fakeUserId: string;

    beforeEach(() => {
        req = {
            params: {
                id: 'conversationId',
            },
            user: {
                _id: 'userId',
            },
        } as Partial<Request>;
        res = {
            status: jest.fn(() => res),
            send: jest.fn(),
        } as Partial<Response>;
        next = jest.fn();
        fakeUserId = 'userId';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call next() if user is part of conversation', async () => {
        const fakeConversationId = 'conversationId';
        (ChatModel.find as jest.Mock).mockResolvedValue([{ _id: fakeConversationId, users: [fakeUserId] }]);

        await conversationGuardMiddleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not part of conversation', async () => {
        (ChatModel.find as jest.Mock).mockResolvedValue([]);

        await conversationGuardMiddleware(req as Request, res as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('User is not part of conversation');
    });
});

describe('isUserPartOfConversation', () => {
    it('should return true if user is part of conversation', async () => {
        const fakeUserId = 'userId';
        const fakeConversationId = 'conversationId';
        (ChatModel.find as jest.Mock).mockResolvedValue([{ _id: fakeConversationId, users: [fakeUserId] }]);

        const result = await isUserPartOfConversation(fakeConversationId, fakeUserId);

        expect(result).toBe(true);
    });

    it('should return false if user is not part of conversation', async () => {
        const fakeUserId = 'userId';
        const fakeConversationId = 'conversationId';
        (ChatModel.find as jest.Mock).mockResolvedValue([]);

        const result = await isUserPartOfConversation(fakeConversationId, fakeUserId);

        expect(result).toBe(false);
    });
});
