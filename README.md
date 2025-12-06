# AI Advisor Web (Vercel-ready)

A minimal Next.js app that serves:
- `/api/chat`: RAG + OpenAI chat over the provided catalog links.
- `/api/transcript`: Returns recent transcript for mirroring in the MAUI app.
- `/` UI: simple chat page that streams responses.

## Setup
1) Install deps:
```
npm install
```
2) Env vars (do NOT commit):
```
OPENAI_API_KEY=your-key
```
Set in Vercel dashboard for deployment.

3) Dev:
```
npm run dev
```

4) Deploy:
```
vercel
```
Then set `ChatUrl` and `TranscriptEndpoint` in `Dashboard/Services/AiAdvisorConfig.cs` to your deployed URL.

## How it works
- `lib/sources.ts`: catalog URLs.
- `lib/ingest.ts`: fetch + chunk + embed once per cold start.
- `lib/vectorStore.ts`: in-memory cosine search (swap to persistent store later).
- `app/api/chat/route.ts`: streams ChatGPT answer and appends to transcript memory.
- `app/api/transcript/route.ts`: returns messages by `sessionId` (default `demo`).

## Notes
- Uses `gpt-4o-mini` for cost/latency; adjust in `app/api/chat/route.ts`.
- In-memory transcript/store reset on cold start; for production, back with a DB or cache.***

