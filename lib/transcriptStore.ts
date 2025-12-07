import { TranscriptMessage } from "./types";

// Simple in-memory store for transcripts
const memory: Record<string, TranscriptMessage[]> = {};

export async function appendTranscript(sessionId: string, messages: TranscriptMessage[]): Promise<void> {
  if (!memory[sessionId]) memory[sessionId] = [];
  memory[sessionId].push(...messages);
}

export async function getTranscript(sessionId: string): Promise<TranscriptMessage[]> {
  return memory[sessionId] ?? [];
}

export async function clearTranscript(sessionId: string): Promise<void> {
  delete memory[sessionId];
}

