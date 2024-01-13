import express, { Express } from "express";
import mongoose from "mongoose";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
import dotenv from 'dotenv';
dotenv.config();

const initApp = async (): Promise<Express> => {
  try {
    await mongoose.connect("mongodb://127.0.0.1/skillSync");
    const app = express();
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/user", userRoute);
    app.use("/auth", authRoute);

    mongoose.connection.once("open", () => console.log("Connected to Database"));
    mongoose.connection.on("error", (error) => console.error(error));

    return app;
  } catch (error) {
    throw new Error(`Error initializing app: ${error.message}`);
  }
};

export default initApp;
