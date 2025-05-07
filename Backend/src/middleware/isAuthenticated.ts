import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request type globally
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: string;
    };

    req.userId = decoded.userId;

    next();
  } catch (error: any) {
    console.error("Authentication error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export default isAuthenticated;
