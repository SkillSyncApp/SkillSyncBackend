import PostModel, { IPost } from "../models/post";
import {BaseController} from "./base.controller";
import { Request, Response } from "express";
import { Model } from "mongoose";

export class PostController extends BaseController<IPost> {

    constructor(model: Model<IPost>) {
        super(model);
    }

    async getAllPostsByUserId(req: Request, res: Response) {
        try {
            const ownerId = req.params.ownerId;
            if (!ownerId) throw new Error("Invalid User Id");

            const posts = await this.model.find({ ownerId: ownerId })

            res.status(200).send(posts);
        } catch (err) {
            console.error(err);
            res.status(500).json("ERRR");
        }
    }
}
const postController = new PostController(PostModel);

export default postController