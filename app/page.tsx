"use client";

import { useRef, useState, useEffect } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState("demo");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const clearSession = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/api/transcript/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        keepalive: true
      }).catch(() => {});
    };

    const handleBeforeUnload = () => {
      clearSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearSession();
    };
  }, [sessionId]);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setStatus("Sending...");
    controllerRef.current = new AbortController();

    const userQuestion = question.trim();

    const resp = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ question: userQuestion, sessionId }),
      headers: { "Content-Type": "application/json" },
      signal: controllerRef.current.signal
    });

    if (!resp.body) {
      setLoading(false);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      answer += chunk;
    }

    // POST Q&A to simple API (replace with your API URL)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, question: userQuestion, answer })
      });
      if (!response.ok) {
        console.error("Failed to send to local API:", response.status, await response.text());
        setStatus(`Error: Could not send to local API (${response.status})`);
      } else {
        console.log("Successfully sent Q&A to local API");
      }
    } catch (err) {
      console.error("Error sending to local API:", err);
      setStatus(`Error: ${err instanceof Error ? err.message : "Network error"}`);
    }

    setLoading(false);
    setQuestion("");
    setStatus("Sent to advisor");
  }

  function stop() {
    controllerRef.current?.abort();
    setLoading(false);
  }

  return (
    <main style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px 0" }}>AI Advisor</h1>
      <p style={{ margin: "0 0 16px 0", color: "var(--muted)" }}>
        Ask about degree plans. Answers will show on the display (not here). Verify with an official advisor.
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #335",
          background: "#0b214a",
          color: "white"
        }}
        placeholder="Example: I am in Applied CS, 45 credits done, want to graduate in 3 terms. What plan should I follow?"
      />

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#003087",
            fontWeight: 700
          }}
        >
          {loading ? "Working..." : "Ask"}
        </button>
        {loading && (
          <button
            onClick={stop}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #999",
              background: "#123",
              color: "#eee"
            }}
          >
            Stop
          </button>
        )}
      </div>

      <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: "var(--panel)", minHeight: 80, color: "var(--muted)" }}>
        {loading ? "Sending..." : status || "Messages display on the TV app."}
      </div>
    </main>
  );
}
