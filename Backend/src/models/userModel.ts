import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const userSchema = new mongoose.Schema(
  {
    fullName: { required: true, type: String },
    profilePhoto: { type: String, default: "" },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     try {
//       const salt = await bcrypt.genSalt(10);
//       this.password = await bcrypt.hash(this.password, salt);
//     } catch (error) {
//       return next(error as any);
//     }
//   }
//   next();
// });

export const userModel = mongoose.model("User", userSchema);
