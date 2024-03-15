import mongoose, { Document, Types } from "mongoose";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, trim: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
