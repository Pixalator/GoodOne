
// Clean and prepare a prompt for evaluation. We ask model to return JSON.
export function buildEvaluationPrompt(referenceAnswer, rubric) {
// rubric: object describing weights or what to check
const rubricText = JSON.stringify(rubric || {
accuracy: 0.4,
completeness: 0.2,
creativity: 0.2,
grammar: 0.2
});


return `You are an objective exam grader. Grade student answer against the reference answer.


Rubric (weights): ${rubricText}


Return ONLY valid JSON object with these keys:
- score (0-100 number)
- breakdown: { accuracy: number(0-100), completeness: number, creativity: number, grammar: number }
- plagiarism_score: number (0-1, where 1 means identical)
- feedback: string with short actionable comments (1-4 sentences)


Strict JSON only. Use numbers for scores. Use concise feedback.


Reference answer:
${referenceAnswer}


Student answer: (provided separately)
`;
}


//OUTPUT  processing 
// Utility: robust JSON extraction from model output
export function extractJSON(text) {
// naive attempt: find first { ... } block and parse
const firstBrace = text.indexOf("{");
const lastBrace = text.lastIndexOf("}");
if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
const candidate = text.slice(firstBrace, lastBrace + 1);
try {
return JSON.parse(candidate);
} catch (e) {
// fallback - try to replace single quotes, trailing commas
const fixed = candidate
.replace(/,(\s*[}\]])/g, "$1")
.replace(/\'(.*?)\'/g, '"$1"');
try { return JSON.parse(fixed); } catch (e2) { return null; }
}
}
try { return JSON.parse(text); } catch (e) { return null; }
}
