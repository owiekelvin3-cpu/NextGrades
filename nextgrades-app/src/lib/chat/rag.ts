const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;

export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  if (cleaned.length <= chunkSize) return [cleaned];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    chunks.push(cleaned.slice(start, end));
    if (end >= cleaned.length) break;
    start = end - overlap;
  }
  return chunks;
}

function scoreChunk(chunk: string, query: string): number {
  const qTerms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);
  if (!qTerms.length) return 0;

  const lower = chunk.toLowerCase();
  let score = 0;
  for (const term of qTerms) {
    const matches = lower.split(term).length - 1;
    score += matches * (term.length > 5 ? 2 : 1);
  }
  return score;
}

export function searchRelevantChunks(text: string, query: string, topK = 4): string[] {
  const chunks = chunkText(text);
  if (!chunks.length) return [];

  return chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.chunk);
}

export function buildMaterialContext(excerpts: string[], title?: string): string {
  if (!excerpts.length) return "";
  const header = title ? `Material: ${title}\n\n` : "";
  return `${header}${excerpts.map((e, i) => `[Section ${i + 1}]\n${e}`).join("\n\n")}`;
}
