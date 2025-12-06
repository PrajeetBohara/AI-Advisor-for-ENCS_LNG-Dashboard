"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState("demo");
  const controllerRef = useRef<AbortController | null>(null);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    controllerRef.current = new AbortController();

    const resp = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ question, sessionId }),
      headers: { "Content-Type": "application/json" },
      signal: controllerRef.current.signal
    });

    if (!resp.body) {
      setLoading(false);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      setAnswer((prev) => prev + decoder.decode(value));
    }

    setLoading(false);
  }

  function stop() {
    controllerRef.current?.abort();
    setLoading(false);
  }

  return (
    <main style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px 0" }}>AI Advisor</h1>
      <p style={{ margin: "0 0 16px 0", color: "#cfd8ff" }}>
        Ask about degree plans. Answers cite the catalog. Verify with an official advisor.
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #335", background: "#0b214a", color: "white" }}
        placeholder="Example: I am in Applied CS, 45 credits done, want to graduate in 3 terms. What plan should I follow?"
      />

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#FFD204", color: "#003087", fontWeight: 700 }}
        >
          {loading ? "Working..." : "Ask"}
        </button>
        {loading && (
          <button
            onClick={stop}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #999", background: "#123", color: "#eee" }}
          >
            Stop
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 12,
          background: "#0c2a5c",
          minHeight: 160,
          whiteSpace: "pre-wrap"
        }}
      >
        {answer || (loading ? "Streaming answer..." : "Answer will appear here.")}
      </div>
    </main>
  );
}

