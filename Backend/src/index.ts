import express, { Request, Response } from "express";
import connectDB from "./config/DBconfig";
import {
  getOtherUser,
  LogIn,
  LogOut,
  SignUp,
} from "./controllers/AuthController.";
import cookieParser from "cookie-parser";
import isAuthenticated from "./middleware/isAuthenticated";
import { getMessage, sendMessage } from "./controllers/messageController";

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});

// Route for user signup
app.post("/SignUp", SignUp);
app.post("/LogIn", LogIn);
app.post("/LogOut", LogOut);
app.get("/getUser", isAuthenticated, getOtherUser);
app.post("/sendMessage/:id", isAuthenticated, sendMessage);
app.get("/getMessage/:id", isAuthenticated, getMessage);

connectDB(); // Connect to MongoDB

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
