import PostModel, { IPost } from "../models/post";
import { BaseController } from "./base.controller";
import { Request, Response } from "express";
import mongoose, { Model } from "mongoose";

export class PostController extends BaseController<IPost> {

    constructor(model: Model<IPost>) {
        super(model);
    }

    getPosts(filter: mongoose.FilterQuery<IPost>) {
        return this.model.aggregate()
            .match(filter)
            .addFields({
                commentsCount: {
                    $size: "$comments"
                }
            })
    }

    async get(_: Request, res: Response) {
        try {
            const posts = await this.getPosts({});

            res.status(200).send(posts);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async getPostsByUserId(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId;
            if (!ownerId) throw new Error("Invalid User Id");

            const posts = await this.getPosts({ ownerId: new mongoose.mongo.ObjectId(ownerId) });

            res.status(200).send(posts);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async getCommentsByPostId(req: Request, res: Response) {
        try {
            const postId = req.params.id;
            if (!postId) throw new Error("Invalid Post Id");

            const post = await PostModel.findById(postId).populate('comments');
            if (!post) return res.status(404).json({ error: 'Post not found' });

            const comments = post.comments || [];

            res.status(200).json(comments);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error retrieving comments' });
        }
    }
}
const postController = new PostController(PostModel);

export default postController