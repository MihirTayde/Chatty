import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorised: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded; 

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      req.user = null; // Set req.user to null if user not found
      return res.status(404).json({ message: "User not found" }); 
    }

    req.user = user; 
    next(); 
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    return res.status(401).json({ message: "Unauthorised: Invalid token" }); 
  }
};

export default protectRoute;

