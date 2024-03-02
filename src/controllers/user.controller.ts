import UserModel, { IUser } from "../models/user";
import { Request, Response } from "express";
import {createController} from "./base.controller";

const userController = createController<IUser>(UserModel);

export const getUserOverview = async (req: Request, res: Response) => {
    return userController.getById(req, res, ['_id', 'name', 'email', 'image', 'bio', 'type'])
}

export default userController