import mongoose from "mongoose";

const evaluatedSheetSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  evaluation: {
    accuracy: { type: Number, required: true },
    completeness: { type: Number, required: true },
    creativity: { type: Number, required: true },
    grammar: { type: Number, required: true },
    plagiarism_score: { type: String, required: true },
    feedback: { type: String, required: true }
  },
  assignments: {
    generatedQuestions: [{ type: String }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ["user", "owner", "admin"], default: "user" },
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now },

  // New field: evaluatedSheets
  evaluatedSheets: [evaluatedSheetSchema]
});

export default mongoose.model("User", userSchema);
