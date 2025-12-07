import { TranscriptMessage } from "./types";

const memory: Record<string, TranscriptMessage[]> = {};
import { getRedis } from "./redisClient";

const useRedis = !!process.env.REDIS_URL;
const memory: Record<string, TranscriptMessage[]> = {};

export function appendTranscript(sessionId: string, messages: TranscriptMessage[]) {
  if (useRedis) {
    return appendTranscriptRedis(sessionId, messages);
  }
  if (!memory[sessionId]) memory[sessionId] = [];
  memory[sessionId].push(...messages);
}

export function getTranscript(sessionId: string) {
  if (useRedis) return getTranscriptRedis(sessionId);
  return memory[sessionId] ?? [];
}

export function clearTranscript(sessionId: string) {
  if (useRedis) return clearTranscriptRedis(sessionId);
  delete memory[sessionId];
}

async function appendTranscriptRedis(sessionId: string, messages: TranscriptMessage[]) {
  try {
    const redis = getRedis();
    const key = `transcript:${sessionId}`;
    const payload = messages.map((m) => JSON.stringify(m));
    await redis.rpush(key, ...payload);
  } catch (err) {
    console.error("Transcript append failed, falling back to memory:", err);
    if (!memory[sessionId]) memory[sessionId] = [];
    memory[sessionId].push(...messages);
  }
}

async function getTranscriptRedis(sessionId: string): Promise<TranscriptMessage[]> {
  try {
    const redis = getRedis();
    const key = `transcript:${sessionId}`;
    const raw = await redis.lrange(key, 0, -1);
    return raw.map((r) => JSON.parse(r) as TranscriptMessage);
  } catch (err) {
    console.error("Transcript fetch failed, falling back to memory:", err);
    return memory[sessionId] ?? [];
  }
}

async function clearTranscriptRedis(sessionId: string) {
  try {
    const redis = getRedis();
    const key = `transcript:${sessionId}`;
    await redis.del(key);
  } catch (err) {
    console.error("Transcript clear failed, falling back to memory:", err);
    delete memory[sessionId];
  }
}

