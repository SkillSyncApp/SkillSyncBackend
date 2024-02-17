import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Message, { IMessage } from '../models/message';
import User from '../models/user';
import ChatModel, { IChat } from '../models/chat';
import UserModel from '../models/user'

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
      let chat = await ChatModel.findOne({ users: { $all: [senderId, receiverId] } });

     // If no chat exists, create a new chat
     if (!chat) {
      chat = new ChatModel({ users: [senderId, receiverId], messages: [], lastMessage: null });
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
    const chat = await ChatModel.findOne({
        $or: [
          { users: [senderId, receiverId] },
          { users: [receiverId, senderId] },
        ],
      }).populate({
        path: 'messages',
        populate: {
          path: 'sender',
          model: 'User',
          select: ['name', 'image'],
        },
      });  

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

  const getConversationsOverView = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id

        const conversations = await ChatModel.find({
            users: { $in: [userId] }}).populate('users', ['name', 'image']); 
  
        console.log(conversations)
        
        const conversationSender = await Promise.all(conversations.map(async (conversation) => {
            try {
                const otherUserId = conversation.users.find(id => id.toString() !== userId);
                const user = await UserModel.findById(otherUserId).select('name image');
                return {
                    id: conversation._id,
                    sender: {
                        name: user.name || 'Unknown',
                        image: user.image || ''
                    }
                };
            } catch (error) {
                console.error('Error fetching user:', error);
                throw error;
            }
        }));
      res.status(200).json(conversationSender);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: error.message });
    }
  };

  const addConversation = async (req: Request, res: Response) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.params;

        console.log(senderId);
        console.log(receiverId);

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

        res.status(200).json({newConversation});
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: error.message });
    }
}

const deleteAllConversations = async (req: Request, res: Response) => {
    try {
        await ChatModel.deleteMany({});

        res.status(200).json({ message: 'All conversations deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversations:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAllConversations = async (req: Request, res: Response) => {
    try {
        const allConversations = await ChatModel.find({})
            .populate('users', ['name', 'image'])
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    model: 'User',
                    select: ['name', 'image'],
                },
            });

        res.status(200).json(allConversations);
    } catch (error) {
        console.error('Error fetching all conversations:', error);
        res.status(500).json({ error: error.message });
    }
};


export default {
    sendMessageToUser,
    getAllMessagesBetweenUsers,
    getConversationsOverView,
    addConversation,
    deleteAllConversations,
    getAllConversations
}
