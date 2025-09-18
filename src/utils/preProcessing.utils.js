

// Chunk long text into manageable pieces (by characters)
export function chunkText(text, maxChars = 2500) {
const chunks = [];
let start = 0;
while (start < text.length) {
chunks.push(text.slice(start, start + maxChars));
start += maxChars;
}
return chunks;
}


// Cosine similarity for embeddings
export function dot(a, b) {
let s = 0;
for (let i = 0; i < a.length; i++) s += a[i] * b[i];
return s;
}

export function norm(a) {
return Math.sqrt(dot(a, a));
}

export function cosineSimilarity(a, b) {
return dot(a, b) / (norm(a) * norm(b));
}


