import { NextFunction, Request, Response } from "express";
import { conversationModel } from "../models/conversationModel";
import { messageModel } from "../models/messageModel";
import { Server as SocketIOServer } from "socket.io";

// ========== SEND MESSAGE ==========
export const sendMessage =
  (io: SocketIOServer) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const senderId = req.userId; // Make sure this is injected by middleware
      const receiverId = req.params.id;
      const { message } = req.body;

      if (!receiverId || !message || typeof message !== "string") {
        res.status(400).json({
          success: false,
          message: "Receiver ID and message are required.",
        });
        return;
      }

      let gotConversation = await conversationModel.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!gotConversation) {
        gotConversation = await conversationModel.create({
          participants: [senderId, receiverId],
          messages: [],
        });
      }

      const newMessage = await messageModel.create({
        senderId,
        receiverId,
        message,
      });

      gotConversation.messages.push(newMessage._id);
      await gotConversation.save();

      io.to(receiverId).emit("receive_message", newMessage);

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        newMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

// ========== GET CHAT MESSAGE ==========

export const getMessages =
  (io: SocketIOServer) =>
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const senderId = req.userId;
      const receiverId = req.params.id;

      const conversation = await conversationModel
        .findOne({
          participants: { $all: [senderId, receiverId] },
        })
        .populate("messages");

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "No conversation found between the users.",
        });
      }

      res.status(200).json({
        success: true,
        messages: conversation.messages,
      });
    } catch (error) {
      console.error("Error retrieving messages:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
