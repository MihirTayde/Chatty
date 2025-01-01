import generateToken from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }
    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT and respond
    generateToken(newUser._id, res);
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      ProfilePic: newUser.ProfilePic,
    });
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Invalid Credentials" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      ProfilePic: user.ProfilePic,
    });
  } catch (error) {
    console.log("error in login container", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("error in logout ", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { ProfilePic } = req.body;
    const userId = req.user._id;
    if (!ProfilePic) {
      return res.status(400).json({ message: "Profile pic is needed" });
    }
    const uploadResponse = await cloudinary.uploader.upload(ProfilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ProfilePic: uploadResponse.secure_url },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update Profile", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user); 
  } catch (error) {
    console.log("error in check auth controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};