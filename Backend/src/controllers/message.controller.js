import cloudinary from "../lib/cloudinary";
import Message from "../models/message.model";
import User from "../models/user.model";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUserIds = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUserIds);
  } catch (error) {
    console.log("error in getting all user id", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { senderId } = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: senderId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: senderId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getting all the messages", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: recieverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (imageUrl) {
      const uploadResponse = cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      recieverId,

      text,
      image: imageUrl,
    });
    await newMessage.save();
    //realtime messaging will be done here using socket.io
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in send message controller", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};
