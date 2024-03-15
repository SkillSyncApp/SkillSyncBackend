import ChatModel from "../models/chat";
import MessageModel, { IMessage } from "../models/message";

const sendMessageToConversation = async (
  conversationId: string,
  senderId: string,
  content: string
) => {
  try {
    const conversation = await ChatModel.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const message: IMessage = new MessageModel({
      content,
      sender: senderId,
    });

    const savedMessage = await message.save();

    conversation.messages.push(savedMessage.id);
    await conversation.save();

    return savedMessage;
  } catch (error) {
    throw new Error(error);
  }
};

export { sendMessageToConversation };
