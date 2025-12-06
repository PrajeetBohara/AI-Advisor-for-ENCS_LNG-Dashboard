import { Chunk } from "./types";

let chunks: Chunk[] = [];

export function loadChunks(newChunks: Chunk[]) {
  chunks = newChunks;
}

export function search(queryEmbedding: number[], k = 6) {
  return chunks
    .map((c) => ({ ...c, score: cosine(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function cosine(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

