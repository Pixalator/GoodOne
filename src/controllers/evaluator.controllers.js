
import { extractTextFromBuffer } from "../utils/ocr.utils";
import { chunkText, cosineSimilarity } from "../utils/preProcessing.utils";







export async function handleEvaluation(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const reference =
      req.body.reference || req.body.ref || req.body.referenceAnswer;
    if (!reference)
      return res
        .status(400)
        .json({
          error: "Reference answer is required in form field 'reference'",
        });

    const rubric = req.body.rubric ? JSON.parse(req.body.rubric) : null;

    // 1) extract text via OCR or pdf-parse
    const text = await extractTextFromBuffer(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    // 2) optionally do light preprocessing
    const cleaned = text.replace(/\n{2,}/g, "\n").trim();

    // 3) compute embedding similarity (quick plagiarism hint)
    const embeddingRespStudent = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: cleaned,
    });
    const embStudent = embeddingRespStudent.data[0].embedding;

    const embeddingRespRef = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: reference,
    });
    const embRef = embeddingRespRef.data[0].embedding;

    const plagiarismScore = cosineSimilarity(embStudent, embRef);

    // 4) build prompt and chunk if necessary
    const promptHeader = buildEvaluationPrompt(reference, rubric);
    const chunks = chunkText(cleaned, 2500);

    // We'll send the student's answer concatenated (or only the first N chunks). If too large, consider summarization first.
    const studentForModel = chunks.join("\n\n[---chunk-break---]\n\n");

    // 5) call the chat model (Gemini via OpenAI SDK compatibility)
    const systemMessage = {
      role: "system",
      content:
        "You are an impartial exam grader. Follow the rubric exactly and return JSON.",
    };
    const userMessage = {
      role: "user",
      content: promptHeader + "\nSTUDENT_ANSWER:\n" + studentForModel,
    };

    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "gemini-1.5-pro-latest",
      messages: [systemMessage, userMessage],
      max_tokens: 800,
      temperature: 0.0,
    });

    const raw = completion.choices?.[0]?.message?.content;
    const parsed = extractJSON(raw || "");

    // If the model didn't return valid JSON, ask it again to just return JSON (few-shot fallback)
    let finalResult = parsed;
    if (!finalResult) {
      const followUp = await client.chat.completions.create({
        model: process.env.LLM_MODEL || "gemini-1.5-pro-latest",
        messages: [
          {
            role: "system",
            content:
              "You are a JSON-only conversion assistant. Extract the JSON from the user's earlier text.",
          },
          {
            role: "user",
            content:
              "Extract JSON from this text and return only JSON:\n\n" +
              (raw || ""),
          },
        ],
        max_tokens: 300,
        temperature: 0.0,
      });
      finalResult = extractJSON(followUp.choices?.[0]?.message?.content || "");
    }

    // Ensure there is a structure; if not, create a minimal one
    if (!finalResult) {
      finalResult = {
        score: null,
        breakdown: {
          accuracy: null,
          completeness: null,
          creativity: null,
          grammar: null,
        },
        plagiarism_score: plagiarismScore,
        feedback:
          raw?.slice(0, 800) || "No JSON returned by model; see raw output",
        raw_output: raw,
      };
    } else {
      // attach computed plagiarism score if model didn't provide one or override
      finalResult.plagiarism_score =
        finalResult.plagiarism_score === undefined
          ? plagiarismScore
          : finalResult.plagiarism_score;
      finalResult.raw_output = raw;
    }

    // Validate JSON shape quickly with Ajv (optional)
    const ajv = new Ajv();
    const schema = {
      type: "object",
      properties: {
        score: { type: ["number", "null"] },
        breakdown: { type: "object" },
        plagiarism_score: { type: ["number", "null"] },
        feedback: { type: "string" },
      },
      required: ["score", "feedback"],
      additionalProperties: true,
    };
    const validate = ajv.compile(schema);
    const ok = validate(finalResult);
    if (!ok) {
      console.warn("Validation failed:", validate.errors);
    }

    // 6) Return result
    return res.json({
      success: true,
      evaluation: finalResult,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
