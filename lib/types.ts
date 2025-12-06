export type Chunk = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
};

export type TranscriptMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

