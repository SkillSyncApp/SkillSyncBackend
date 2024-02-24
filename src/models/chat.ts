import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IChat extends Document {
  _id: String;
  users: Types.ObjectId[];
  messages: Types.ObjectId[];
}

const chatSchema = new Schema<IChat>(
  {
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message'}]    
  }
);

const ChatModel = model<IChat>("Chat", chatSchema);

export default ChatModel;
