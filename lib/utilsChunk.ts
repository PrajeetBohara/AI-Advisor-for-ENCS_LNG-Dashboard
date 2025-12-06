import { Chunk } from "./types";

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
}

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function chunkHtml(html: string, source: string, size = 800, overlap = 120) {
  const clean = normalize(stripTags(html));
  const chunks: Chunk[] = [];
  for (let i = 0; i < clean.length; i += size - overlap) {
    const slice = clean.slice(i, i + size);
    if (!slice.trim()) continue;
    chunks.push({
      id: `${source}#${i}`,
      source,
      text: slice,
      embedding: []
    });
    if (i + size >= clean.length) break;
  }
  return { chunks };
}

