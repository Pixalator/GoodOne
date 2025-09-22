
import userModel from "../models/user.model.js";
import { extractText , evaluateSubmission } from "../utils/ocr.utils.js";
import { chunkText, cosineSimilarity } from "../utils/preProcessing.utils.js";
import Ajv from "ajv";





export async function handleEvaluation(req, res) {
  try {
    const { extractedQnA, studentName, rollNo } = req.body;
    const userId = req.userID; // assuming authenticated user

    if (!extractedQnA || !Array.isArray(extractedQnA) || extractedQnA.length === 0) {
      return res.status(400).json({ error: "No Q&A data provided for evaluation." });
    }

    // Evaluate using your existing evaluator
    const evaluationResult = await evaluateSubmission(extractedQnA);
    console.log(evaluationResult);

    // Store evaluation in MongoDB
    const user = await userModel.findById(userId);
    console.log(user)
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const newSheet = {
      studentName: studentName || user.fullname, // fallback to user's name
      rollNo: rollNo || "N/A",
      evaluation: evaluationResult.evaluation,
      assignments: evaluationResult.assignments
    };

    user.evaluatedSheets.push(newSheet);
    await user.save();

    console.log(user)

    res.json({ evaluation: evaluationResult, message: "Evaluation saved successfully." });
  } catch (err) {
    console.error("Error in evaluationController:", err);
    res.status(500).json({ error: "Failed to evaluate submission." });
  }
}



export async function handleOcr(req, res) {
    try {
    const text = await extractText(req.file.mimetype, req.file.buffer);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}