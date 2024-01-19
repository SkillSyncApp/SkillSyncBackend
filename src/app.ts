import express, { Express } from "express";
import mongoose from "mongoose";
import BaseRouter from "./routes/index"
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const initApp = async (): Promise<Express> => {
  try {
    await mongoose.connect(process.env.DB_URL);
    const app = express();
    
/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Add APIs
    app.use("/api", BaseRouter)

    mongoose.connection.once("open", () => console.log("Connected to Database"));
    mongoose.connection.on("error", (error) => console.error(error));

    return app;
  } catch (error) {
    throw new Error(`Error initializing app: ${error.message}`);
  }
};

export default initApp;
