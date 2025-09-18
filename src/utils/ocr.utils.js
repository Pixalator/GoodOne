
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";




// Simple worker initialization for Tesseract (we'll lazily initialize) //IMAGE OCR WORKER
let tesseractWorker = null;
async function getTesseractWorker() {
if (!tesseractWorker) {
tesseractWorker = createWorker();
await tesseractWorker.load();
await tesseractWorker.loadLanguage("eng");  
await tesseractWorker.initialize("eng");
}
return tesseractWorker;
}


// Helper: extract text from uploaded buffer depending on mime type
export async function extractTextFromBuffer(buffer, mimetype, filename) {
mime = (mimetype || "").toLowerCase();
const name = (filename || "").toLowerCase();


if (mime.includes("pdf") || name.endsWith(".pdf")) {
// PDF parsing (If PDF INPUT)
try {
const data = await pdfParse(buffer);
return data.text; // raw extracted text
} catch (err) {
console.error("pdf-parse failed:", err);
throw new Error("Failed to parse PDF");
}
}


if (mime.startsWith("image/") || name.match(/\.(png|jpg|jpeg|webp)$/)) {
// Image OCR via Tesseract.js (If Image INPUT)
try {
const worker = await getTesseractWorker();
const { data } = await worker.recognize(buffer);
return data.text;
} catch (err) {
console.error("tesseract failed:", err);
throw new Error("Failed to OCR image");
}
}


// Fallback: treat buffer as text (If TEXT INPUT )
return buffer.toString("utf8");
}