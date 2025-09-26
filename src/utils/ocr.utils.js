

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// OpenAI client
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const gemini = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


export async function extractText(filetype, fileBuffer) {
  try {
    const base64Data = fileBuffer.toString("base64");

    const result = await gemini.generateContent([
         {
        text: `You are an AI text extractor specialized in academic questions and answers.
               Extract all meaningful text from this document, and structure it ONLY as a list of Question-Answer pairs.
               Format like this (only if image/pdf is about acedemic stuff ):
                  "question": "First question", "answer": "Answer text" ,
                  "question": "Second question", "answer": "Answer text" 
               Important:
               - If the document does NOT contain any academic questions and answers, 
                 respond exactly with: "sorry i am only designed to handle academic ques and answers".
               - Do not return raw text, summaries, or anything other than structured Q&A.
               - Make sure each Q&A pair is complete and concise.`
      },
      {
        inlineData: {
          mimeType: filetype, // e.g., "application/pdf", "image/png"
          data: base64Data,
        },
      },
    ]);

    let extractedText = result.response.text();
    
    // --- CLEANING STAGE ---
    extractedText = extractedText.trim()
                                 .replace(/^```(?:json)?/, '') // remove starting ``` or ```json
                                 .replace(/```$/, '')          // remove ending ```
                                 .trim();

    // Remove wrapping quotes if present
    if ((extractedText.startsWith('"') && extractedText.endsWith('"')) ||
        (extractedText.startsWith("'") && extractedText.endsWith("'"))) {
      extractedText = extractedText.slice(1, -1).trim();
    }

    // Optional: replace multiple spaces/newlines with single space
    extractedText = extractedText.replace(/\r?\n+/g, '\n').replace(/[ \t]+/g, ' ');

    console.log("Cleaned extracted text:", extractedText);

    return extractedText;
  } catch (err) {
    console.error("Error extracting text:", err);
    throw new Error("Failed to extract text");
  }
}


export async function evaluateSubmission(modifiedQnA) {
  try {
    // if (!Array.isArray(modifiedQnA) || modifiedQnA.length === 0) {
    //   return {
    //     evaluation: null,
    //     assignments: null,
    //     message: "No Q&A data to evaluate."
    //   };
    // }

    const promptText = `
You are an academic evaluator AI. Your task is to evaluate the student's submission based on the following criteria:

1. Accuracy: How factually correct the answers are.
2. Completeness: How well all required points are covered.
3. Creativity: Originality and depth of ideas or examples.
4. Grammar: Language correctness, clarity, and fluency.
5. Plagiarism score: Estimate percentage of content that appears copied.

Input is a JSON array of Question-Answer objects:

${JSON.stringify(modifiedQnA)}

Please produce a JSON output exactly in this format:

{
  "evaluation": {
    "accuracy": <number 0-100>,
    "completeness": <number 0-100>,
    "creativity": <number 0-100>,
    "grammar": <number 0-100>,
    "plagiarism_score": "<number>%",
    "feedback": "<text feedback summarizing strengths, weaknesses, and suggestions>"
  },
  "assignments": {
    "generatedQuestions": [
      "<new question 1 based on the submission>",
      "<new question 2 based on the submission>"
    ]
  }
}

Important:
- Only return valid JSON.
- Numeric scores 0-100.
- Plagiarism score as percentage string (e.g., "8%").
- Feedback should be concise, constructive, actionable.
- Generated questions should relate to the submission.
`;

    const result = await gemini.generateContent([
      { text: promptText }
    ]);
    
    console.log("evauluator response",result.response.text())

    // Clean output before parsing
    let rawText = result.response.text();
    rawText = rawText.replace(/```(?:json)?/g, "").trim();

    const evaluationJson = JSON.parse(rawText);

    console.log("evaluationJson",evaluationJson)
    return evaluationJson;

  } catch (err) {
    console.error("Error during evaluation:", err);
    throw new Error("Failed to evaluate submission.");
  }
}
