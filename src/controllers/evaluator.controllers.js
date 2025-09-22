
import userModel from "../models/user.model.js";
import { extractText , evaluateSubmission } from "../utils/ocr.utils.js";
import { chunkText, cosineSimilarity } from "../utils/preProcessing.utils.js";
import Ajv from "ajv";





export async function handleEvaluation(req, res) {
  try {
    const { modifiedQnA, studentName, rollNo } = req.body;
    console.log(modifiedQnA,studentName,rollNo)
    const userId = req.userID; // assuming authenticated user

    // if (!modifiedQnA || !Array.isArray(modifiedQnA) || modifiedQnA.length === 0) {
    //   return res.status(400).json({ error: "No Q&A data provided for evaluation." });
    // }

    // Evaluate using your existing evaluator
    const evaluationResult = await evaluateSubmission(modifiedQnA);
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
    const sheetId = user.evaluatedSheets[user.evaluatedSheets.length - 1]._id;
    await user.save();

    console.log(user)

    res.json({ evaluation: evaluationResult, message: "Evaluation saved successfully.",redirect:`/result/${sheetId}`});
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




export async function handleGetResultById(req, res) {
  try {
    const userId = req.userID; // assuming authentication middleware sets this
    const { sheetId } = req.params;

    if (!sheetId) {
      return res.status(400).json({ error: "Sheet ID is required." });
    }

    // Find the user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Find the sheet by its subdocument _id
    const sheet = user.evaluatedSheets.id(sheetId);
    if (!sheet) {
      return res.status(404).json({ error: "Evaluation sheet not found." });
    }

    // Respond with the sheet
    res.json(sheet);
  } catch (err) {
    console.error("Error in handleGetResultById:", err);
    res.status(500).json({ error: "Failed to fetch evaluation sheet." });
  }
}
