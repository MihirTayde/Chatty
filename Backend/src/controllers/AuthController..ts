import { NextFunction, Request, Response } from "express";
import { userModel } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const SignUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, fullName, gender } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      res.status(409).json({ message: "Username or email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Await the promise

    const newUser = new userModel({
      username,
      email,
      gender,
      password: hashedPassword, // Store the hashed password
      fullName,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const LogIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await userModel.findOne({ username });

    if (!existingUser) {
      res.status(404).json({ message: "User  not found" });
      return;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // If successful, send a response (with JWT)
    const tokenData = {
      userId: existingUser._id, // Correctly using 'userId'
      userName: existingUser.username,
      loggedIn_UserEmail: existingUser.email,
    };

    const token = await jwt.sign(
      tokenData,
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "1d", // Set token expiration
      }
    );

    res
      .status(200)
      .cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000 })
      .json({
        message: "Login successful",
        user: {
          _id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
          fullName: existingUser.fullName,
        },
        token: token,
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const LogOut = async (req: Request, res: Response): Promise<void> => {
  try {
    res
      .status(200)
      .clearCookie("token") // Clears the token from cookies
      .json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);

    // Ensure error is properly typed
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage });
  }
};

export const getOtherUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract the token from the request headers or cookies
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: string;
    };
    const LoggedInUserId = decoded.userId;

    // Find other users excluding the logged-in user
    const otherUsers = await userModel
      .find({ _id: { $ne: LoggedInUserId } })
      .select("-password");

    res.status(200).json({ success: true, users: otherUsers });
  } catch (error) {
    console.error("Error getting other users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
