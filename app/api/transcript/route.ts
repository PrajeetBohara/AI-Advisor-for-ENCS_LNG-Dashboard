import { NextRequest, NextResponse } from "next/server";
import { getTranscript } from "../../../lib/transcriptStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "demo";
  try {
    const transcript = await getTranscript(sessionId);
    return NextResponse.json(transcript);
  } catch (err) {
    console.error("Transcript route error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

