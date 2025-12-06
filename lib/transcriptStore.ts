import { TranscriptMessage } from "./types";

const memory: Record<string, TranscriptMessage[]> = {};

export function appendTranscript(sessionId: string, messages: TranscriptMessage[]) {
  if (!memory[sessionId]) memory[sessionId] = [];
  memory[sessionId].push(...messages);
}

export function getTranscript(sessionId: string) {
  return memory[sessionId] ?? [];
}

