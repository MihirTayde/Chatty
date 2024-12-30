import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      require: true,
      type: String,
      unique: true,
    },
    fullName: {
      require: true,
      type: String,
    },
    password: {
      require: true,
      type: String,
      minlength: 6,
    },
    ProfilePic: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
