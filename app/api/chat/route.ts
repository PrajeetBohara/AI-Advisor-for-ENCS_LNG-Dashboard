import { NextRequest } from "next/server";
import { openai, SYSTEM_PROMPT } from "../../../lib/model";
import { ensureIngested } from "../../../lib/ingest";
import { search } from "../../../lib/vectorStore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  const body = await req.json();
  const question: string = body?.question ?? "";
  const sessionId: string = body?.sessionId ?? "demo";
  const studentContext = body?.studentContext ?? {};

  if (!question.trim()) {
    return new Response("Missing question", { status: 400 });
  }

  await ensureIngested();

  const qEmbedding = (
    await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question
    })
  ).data[0].embedding;

  const hits = search(qEmbedding, 6);
  const context = hits.map((h) => `Source: ${h.source}\n${h.text}`).join("\n\n");

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Context:\n${context}\n\nStudent data: ${JSON.stringify(studentContext)}\n\nQuestion: ${question}`
    }
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true
  });

  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      for await (const part of completion) {
        const delta = part.choices[0]?.delta?.content ?? "";
        if (delta) {
          fullText += delta;
          controller.enqueue(encoder.encode(delta));
        }
      }
      controller.close();
      // Note: The React page will POST Q&A to the local API after receiving the answer
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}

