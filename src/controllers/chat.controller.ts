import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Message, { IMessage } from '../models/message';
import User from '../models/user';
import Chat from '../models/chat';

const sendMessageToUser = async (req: Request, res: Response) => {
    try {
      const { receiverId } = req.params;
      const { message } = req.body;
      const senderId = req.user._id

      // Ensure the sender is not the same as the recipient
      if (receiverId === senderId) {
        return res.status(400).json({ message: 'Cannot send a message to yourself' });
      }

      const recipientUser = await User.findById(receiverId);
      if (!recipientUser) {
        return res.status(404).json({ message: 'Recipient user not found' });
      }

      // Check if a chat between these users already exists
      let chat = await Chat.findOne({ users: { $all: [senderId, receiverId] } });

     // If no chat exists, create a new chat
     if (!chat) {
      chat = new Chat({ users: [senderId, receiverId], messages: [], lastMessage: null });
      await chat.save();
    }

      // Create a new message
      const newMessage: IMessage = new Message({
        sender: senderId,
        content: message,
        createdAt: new Date()
      });

      await newMessage.save();

      chat.messages.push(newMessage._id as Types.ObjectId);
      await chat.save();

      res.status(200).json({ newMessage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
}

const getAllMessagesBetweenUsers = async (req: Request, res: Response) => {
    try {
      const { receiverId } = req.params;
      const senderId = req.user._id

      if (!Types.ObjectId.isValid(senderId) || !Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: 'Invalid senderId or receiverId' });
      }
      
      // Check if the users exist
      const user1 = await User.findById(receiverId);
      const user2 = await User.findById(senderId);

      if (!user1 || !user2) {
        return res.status(404).json({ message: 'One or more users not found' });
      }

      // Check if a chat between these users exists
      const chat = await Chat.findOne({
        users: { $all: [senderId, receiverId] },
      }).populate('messages');

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found between users' });
      }

      // Fetch details for each message
      const messages = await Promise.all(
        (chat.messages as Types.ObjectId[]).map(async (messageId) => {
          const message = await Message.findById(messageId).populate({
            path: 'sender',
            model: 'User',
            select: ['name', 'image']
          });
          if (!message) {
            throw new Error(`Message not found with ID: ${messageId}`);
          }

          return {
            _id: message._id,
            sender: message.sender,
            content: message.content,
            createdAt: message.createdAt,
          };
        })
      );


      res.status(200).json({ messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

export default {
    sendMessageToUser,
    getAllMessagesBetweenUsers
}
