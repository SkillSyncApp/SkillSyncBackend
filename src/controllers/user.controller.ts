import UserModel, { IUser } from "../models/user";
import {createController} from "./base.controller";

const userController = createController<IUser>(UserModel);

export default userController