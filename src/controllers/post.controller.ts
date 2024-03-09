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
    return this.model
      .aggregate()
      .match(filter)
      .addFields({
        commentsCount: {
          $size: "$comments",
        },
      });
  }

  getOwners(posts: IPost[]) {
    return PostModel.populate(posts, {
      path: "ownerId",
      select: ["_id", "name", "image", "type"],
    });
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
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsByUserId(req: Request, res: Response) {
    try {
      const ownerId = req.params.ownerId;

      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(404).send({"error": "ownerId isn't valid"})
      }

      const posts = await this.getPosts({
        ownerId: new mongoose.mongo.ObjectId(ownerId),
      });
      const postsWithOwners = await this.getOwners(posts);

      if (!postsWithOwners) {
        return res.status(500).json({ message: "Failed to process posts" });
      }

      res.status(200).send(postsWithOwners);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getCommentsByPostId(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      if (!postId) throw new Error("Invalid Post Id");

      const postWithComments = await PostModel.findById(postId).populate(
        "comments"
      );
      if (!postWithComments)
        return res.status(404).json({ error: "Post not found" });

      const comments = postWithComments.comments || [];
      const commentsWithUsers = await CommentModel.populate(comments, {
        path: "userId",
        select: ["name", "image"],
      });

      res.status(200).json(commentsWithUsers);
    } catch (err) {
      res.status(500).json({ error: "Error retrieving comments" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const { title, content, image } = req.body;

      const updatedPost = await this.model.findByIdAndUpdate(
        postId,
        { title, content, image },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
const postController = new PostController(PostModel);

export default postController;
