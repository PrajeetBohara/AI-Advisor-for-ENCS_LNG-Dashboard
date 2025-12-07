import Pusher from "pusher";

const {
  PUSHER_APP_ID,
  PUSHER_KEY,
  PUSHER_SECRET,
  PUSHER_CLUSTER,
} = process.env;

let pusherServer: Pusher | null = null;

export function getPusherServer() {
  if (pusherServer) return pusherServer;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    throw new Error("Missing Pusher env vars. Set PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER.");
  }
  pusherServer = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
  return pusherServer;
}

export async function pushMessage(sessionId: string, role: string, content: string) {
  const pusher = getPusherServer();
  const channel = `ai-advisor-${sessionId}`;
  const payload = {
    role,
    content,
    timestamp: new Date().toISOString(),
  };
  await pusher.trigger(channel, "message", payload);
}

export async function pushClear(sessionId: string) {
  const pusher = getPusherServer();
  const channel = `ai-advisor-${sessionId}`;
  await pusher.trigger(channel, "clear", { sessionId });
}

