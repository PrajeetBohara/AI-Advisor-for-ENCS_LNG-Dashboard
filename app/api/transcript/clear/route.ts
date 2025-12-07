import { NextRequest, NextResponse } from "next/server";
import { clearTranscript } from "../../../../lib/transcriptStore";
import { pushClear } from "../../../../lib/realtime";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const urlSessionId = req.nextUrl.searchParams.get("sessionId");
  let bodySessionId: string | undefined;
  try {
    const body = await req.json().catch(() => null);
    bodySessionId = body?.sessionId;
  } catch {
    bodySessionId = undefined;
  }
  const sessionId = urlSessionId || bodySessionId || "demo";
  try {
    await clearTranscript(sessionId);
    await pushClear(sessionId);
  } catch (err) {
    console.error("Transcript clear error:", err);
  }
  return NextResponse.json({ ok: true, sessionId });
}

