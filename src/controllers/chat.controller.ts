import { Request, Response } from "express";
import ChatModel from "../models/chat";
import MessageModel from "../models/message";
import UserModel from "../models/user";

const getConversations = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.user;

    const emptyChatsDisplayMinutesThreshold = 5;
    const oldLimit = new Date();
    oldLimit.setMinutes(
      oldLimit.getMinutes() - emptyChatsDisplayMinutesThreshold
    );

    const conversations = await ChatModel.find({
      users: { $in: [userId] },
      $or: [
        {
          messages: { $not: { $size: 0 } },
        },
        {
          openedAt: { $gte: oldLimit },
        },
      ],
    }).populate("users", ["name", "image"]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversationWith = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.user;
    const { userId: anotherUserId } = req.params;

    const conversation = await ChatModel.findOneAndUpdate(
      {
        users: { $all: [userId, anotherUserId] },
      },
      { openedAt: new Date() }
    );

    res.status(200).json(conversation || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;

    const conversation = await ChatModel.findByIdAndUpdate(conversationId, {
      openedAt: new Date(),
    }).populate({
      path: "messages",
      model: MessageModel,
      populate: {
        path: "sender",
        model: UserModel,
        select: ["name", "image", "_id"],
      },
    });

    if (conversation) {
      res.status(200).json(conversation.messages);
    } else {
      throw new Error("Failed to find conversation");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addConversation = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.user;
    const { userId: otherUserId } = req.params;

    const otherUser = await UserModel.findById(otherUserId).select("_id");

    if (!otherUser) {
      return res
        .status(404)
        .json({ error: "Failed to start conversation with unknown user" });
    }

    const users = [userId, otherUserId].sort();

    const existingConversation = await ChatModel.findOne({
      users: { $all: users },
    });

    if (existingConversation) {
      return res.status(400).json({ error: "Conversation already exists" });
    }

    const newConversation = await ChatModel.create({
      users: users,
      messages: [],
    });

    res.status(200).json(newConversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getConversations,
  getConversationWith,
  getMessages,
  addConversation,
};
