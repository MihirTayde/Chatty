import { NextFunction, Request, Response } from "express";
import { conversationModel } from "../models/conversationModel";
import { messageModel } from "../models/messageModel";


// SendMessage (POST)	
// Sends a message and saves it to messageModel and conversationModel.
// Stored in messageModel and linked to conversationModel.


export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const senderId = req.userId; // Get the sender's ID from the authenticated user
    const receiverId = req.params.id; // Get the receiver's ID from the route parameters
    const { message } = req.body; // Get the message content from the request body

    // Validate the message content
    if (!message || typeof message !== "string") {
      res.status(400).json({
        success: false,
        message: "Message content is required and must be a string.",
      });
      return; // Return here to prevent further execution
    }

    // Find an existing conversation between the sender and receiver.
    let gotConversation = await conversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If no conversation exists, create a new one.
    if (!gotConversation) {
      gotConversation = await conversationModel.create({
        participants: [senderId, receiverId],
      });
    }

    // Create a new message in the database.
    const newMessage = await messageModel.create({
      senderId,
      receiverId,
      message,
    });

    // If the message was created successfully, add its ID to the conversation's messages array.
    if (newMessage) {
      gotConversation.messages.push(newMessage._id); // Use _id instead of id
    }

    // Save the updated conversation to the database.
    await gotConversation.save();

    // Send a success response to the client.
    res.status(201).json({ success: true, message: "Message sent", newMessage });
  } catch (error) {
    // Assert that error is of type Error
    const errorMessage = (error instanceof Error) ? error.message : "Unknown error occurred";
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: errorMessage });
  }
};



// getMessage (GET)	Retrieves messages from conversationModel and logs them.	
// Needs fixing to return messages in res.json().

export const getMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.userId;
    const recieverId = req.params.id;
    const Conversation = await conversationModel.findOne({
      participants: { $all: [senderId, recieverId] },
    }).populate("messages")
    console.log(Conversation?.messages);

    res.json({ messages: Conversation?.messages })
  } catch (error) {
    console.log(error);
  }
};
