import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<ModelType>{

    model: Model<ModelType>
    constructor(model: Model<ModelType>) {
        this.model = model;
    }

    async get(req: Request, res: Response) {
        try {
            if (req.query.name) {
                const model = await this.model.find({ name: req.query.name });
                res.send(model);
            } else {
                const model = await this.model.find();
                res.send(model);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const model = await this.model.findById(req.params.id);
            res.send(model);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async post(req: Request, res: Response) {
        try {
            const obj = await this.model.create(req.body);
            res.status(201).send(obj);
        } catch (err) {
            console.log(err);
            res.status(406).send("fail: " + err.message);
        }
    }

    // putById(req: Request, res: Response) {
    //     res.send("put student by id: " + req.params.id);
    // }

    // deleteById(req: Request, res: Response) {
    //     res.send("delete student by id: " + req.params.id);
    // }
}

const createController = <ModelType>(model: Model<ModelType>) => {
    return new BaseController<ModelType>(model);
}

export default createController;