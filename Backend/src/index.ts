// index.ts
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/DBconfig";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  getOtherUsers,
  LogIn,
  LogOut,
  SignUp,
} from "./controllers/AuthController.";
import isAuthenticated from "./middleware/isAuthenticated";
import { getMessages, sendMessage } from "./controllers/messageController";

const app = express();
const port = process.env.PORT || 4000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ========== API Routes ==========
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});

app.post("/SignUp", SignUp);
app.post("/LogIn", LogIn);
app.post("/LogOut", LogOut);
app.get("/getOtherUsers", isAuthenticated, getOtherUsers);
app.post("/sendMessage/:id", isAuthenticated, sendMessage(io)); 
app.get("/getMessages/:id", isAuthenticated, getMessages(io));

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId); // each user joins their own room
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

connectDB();

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
