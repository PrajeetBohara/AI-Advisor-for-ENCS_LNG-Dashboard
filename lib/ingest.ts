import { degreeCatalogLinks } from "./sources";
import { openai } from "./model";
import { chunkHtml } from "./utilsChunk";
import { loadChunks } from "./vectorStore";
import { Chunk } from "./types";

let ready = false;

export async function ensureIngested() {
  if (ready) return;
  const all: Chunk[] = [];
  for (const url of degreeCatalogLinks) {
    const html = await fetch(url).then((r) => r.text());
    const { chunks } = chunkHtml(html, url, 900, 150);
    const embeddings = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks.map((c) => c.text)
    });
    chunks.forEach((c, idx) => {
      c.embedding = embeddings.data[idx].embedding;
    });
    all.push(...chunks);
  }
  loadChunks(all);
  ready = true;
}

