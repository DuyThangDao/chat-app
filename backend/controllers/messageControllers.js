import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";

export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      console.log("Invalid data passed into request");
      return res.status(400).send("Invalid data passed into request");
    }
    const newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate({
      path: "chat",
      populate: { path: "users", select: "name pic email" },
    });

    await Chat.findByIdAndUpdate(
      req.body.chatId,
      { latestMessage: message },
      { new: true }
    );
    res.status(200).json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const allMessage = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
