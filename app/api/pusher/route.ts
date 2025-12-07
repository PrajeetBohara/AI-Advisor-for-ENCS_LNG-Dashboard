import { NextRequest, NextResponse } from "next/server";
import { pushMessage } from "../../../lib/realtime";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body?.sessionId || "demo";
    const role = body?.role || "user";
    const content = body?.content || "";
    if (!content.trim()) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }
    await pushMessage(sessionId, role, content);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Pusher route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

