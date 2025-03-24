import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User ",
      required: true,
    },
    receiverId: {  // Fixed typo (RecieverId → receiverId)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User ",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const messageModel = mongoose.model("Message", messageSchema); // Capitalized "Message" for consistency