import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Ensure participants are required
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message", // Capitalized "Message" to match model name
      },
    ],
  },
  { timestamps: true }
);

export const conversationModel = mongoose.model("Conversation", conversationSchema);