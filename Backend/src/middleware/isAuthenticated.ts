import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string; //global declaration to access userId from the Request body
    }
  }
}

// Middleware to check if the user is authenticated
const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Extract the token from cookies or the Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    console.log("Token received:", token);

    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: "No user found" });
    }

    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string };

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.log("Decoded token:", decoded);

    // Attach the userId to the request object for later use
    req.userId = decoded.userId; // Ensure you have extended the Request interface

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default isAuthenticated;