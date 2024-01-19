import CommentModel, { IComment } from "../models/comment";
import {createController} from "./base.controller";

const commentController = createController<IComment>(CommentModel);

export default commentController