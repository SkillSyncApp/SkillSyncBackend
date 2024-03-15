import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<ModelType> {
  model: Model<ModelType>;
  constructor(model: Model<ModelType>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response, selectFields?: string[]) {
    try {
      const models = await this.model.find().select(selectFields);
      
      if (!models) {
        return res.status(404).json({ message: "User not found" });
    }

      res.send(models);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getById(req: Request, res: Response, selectFields?: string[]) {
    try {
      const id = req.params.id;
      const query = id ? { _id: id } : {};

      const model = await this.model.find(query).select(selectFields);
      
      if (!model) {
        return res.status(404).json({ message: "User not found" });
    }

      res.send(model[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const obj = await this.model.create(req.body);
      res.status(201).send(obj);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }

  async deleteById(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const obj = await this.model.findByIdAndDelete(id);

      if (!obj) return res.status(404).json({ error: "Model not found" });

      res.status(200).send({ message: "Model deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async putById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updateFields = req.body;

      const updateModel = await this.model.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true } // Return the updated model
      );

      if (!updateModel) {
        return res.status(403).send({ error: "Forbidden" });
      }

      res.status(200).send(updateModel);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

const createController = <ModelType>(model: Model<ModelType>) => {
  return new BaseController<ModelType>(model);
};

export { createController };
