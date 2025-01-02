import express from "express";
import authRoutes from "./routes/auth.route.js";
import { connectdb } from "./lib/db.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { messageRoutes } from "./routes/message.route.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Database connection and server start
(async () => {
  try {
    await connectdb(); // Initialize database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1); // Exit the process on failure
  }
})();
