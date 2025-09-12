import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["user", "owner", "admin"], // differentiate roles
    default: "user",
  },
  password: { type: String, required: true }, // Hashed
  otp: { type: String, required: true }, // Hashed
  expiresAt: { type: Date, required: true },
});

tempUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("TempUser", tempUserSchema);
