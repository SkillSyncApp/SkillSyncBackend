import { Request, Response } from 'express';
import ChatModel from '../models/chat';
import UserModel from '../models/user';
import MessageModel, { IMessage } from '../models/message';

const getConversations = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.user;

    const conversations = await ChatModel.find({
      users: { $in: [userId] }
    }).populate('users', ['name', 'image']);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;

    const conversation = await ChatModel.findById(conversationId)
      .populate({ path: "messages", model: MessageModel, populate: {
        path: "sender", model: UserModel, select: ["name", "image", "_id"]
      } });

    if (conversation) {
      res.status(200).json(conversation.messages);
    } else {
      throw new Error("Failed to find conversation");
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const { userId, content } = req.body;

    const conversation = await ChatModel.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const message: IMessage = new MessageModel({
      content,
      sender: userId
    })

    const savedMessage = await message.save();

    conversation.messages.push(savedMessage.id);
    await conversation.save();

    res.status(200).send(conversation.messages);
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

const addConversation = async (req: Request, res: Response) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;

    const sender = await UserModel.findById(senderId).select("_id");
    const receiver = await UserModel.findById(receiverId).select("_id");

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    // Ensure consistent order of users in the array
    const users = [sender._id, receiver._id].sort();

    // Check if a conversation between these users already exists
    const existingConversation = await ChatModel.findOne({
      $or: [
        { users: [sender._id, receiver._id] },
        { users: [receiver._id, sender._id] }
      ]
    });

    if (existingConversation) {
      // Conversation already exists
      return res.status(400).json({ error: 'Conversation already exists' });
    }

    const newConversation = await ChatModel.create({
      users: users,
      messages: [],
      lastMessage: ''
    });

    res.status(200).json({ newConversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
}

export default {
  getConversations,
  getMessages,
  sendMessage,
  addConversation,
}
