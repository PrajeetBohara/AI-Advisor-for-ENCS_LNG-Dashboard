import { NextRequest, NextResponse } from "next/server";
import { getTranscript } from "../../../lib/transcriptStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "demo";
  const transcript = getTranscript(sessionId);
  return NextResponse.json(transcript);
}

