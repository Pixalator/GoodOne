import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "owner", "admin"], // differentiate roles
    default: "user"
  },
  profileImage: {
    type: String // URL from Cloudinary or other storage
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);