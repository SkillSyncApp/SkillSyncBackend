import CommentModel, { IComment } from "../models/comment";
import PostModel, { IPost } from "../models/post";

import { Request, Response } from "express";

const addComment = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId
        const { userId, content } = req.body;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment: IComment = new CommentModel({
            postId,
            userId,
            content,
            createdAt: new Date(),
        });

        const savedComment = await comment.save();

        post.comments.push(savedComment.id);
        post.commentsCount += 1;
        await post.save();

        res.status(200).send(savedComment);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

const deleteComment = async (req: Request, res: Response) => {
    try {
        const {postId, commentId} = req.params;

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // TODO - WHAT IF THE FIRST REQUEST SUCCESS, BUT THE SECOND FAILED.
        await PostModel.findByIdAndUpdate(postId, { $pull: { comments: commentId }, $inc: { commentsCount: -1 } }, { new: true });
        await CommentModel.findByIdAndDelete(commentId);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default {
    addComment,
    deleteComment,
}