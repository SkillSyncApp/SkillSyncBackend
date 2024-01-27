import CommentModel from "../models/comment";
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

    getOwners(posts: IPost[]) {
        return PostModel.populate(posts, { path: "ownerId", select: ['name', 'image', 'type'] });
    }

    async create(req: Request, res: Response) {
        try {
            const { user } = req;
            req.body = { ...req.body, ownerId: user._id };

            const newPost = await super.create(req, res);
            res.status(200).send(newPost);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async get(_: Request, res: Response) {
        try {
            const posts = await this.getPosts({});
            const postsWithOwners = await this.getOwners(posts);

            res.status(200).send(postsWithOwners);
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
            const postsWithOwners = await this.getOwners(posts);

            res.status(200).send(postsWithOwners);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async getCommentsByPostId(req: Request, res: Response) {
        try {
            const postId = req.params.id;
            if (!postId) throw new Error("Invalid Post Id");

            const postWithComments = await PostModel.findById(postId).populate('comments');
            if (!postWithComments) return res.status(404).json({ error: 'Post not found' });

            const comments = postWithComments.comments || [];
            const commentsWithUsers = await CommentModel.populate(comments, { path: "userId", select: ['name', 'image'] });

            res.status(200).json(commentsWithUsers);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error retrieving comments' });
        }
    }
}
const postController = new PostController(PostModel);

export default postController