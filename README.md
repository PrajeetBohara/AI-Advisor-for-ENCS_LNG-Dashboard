## AI Advisor Web (Vercel-ready)

Minimal Next.js app that serves:
- `/api/chat`: RAG + OpenAI chat over the provided catalog links.
- `/api/transcript`: returns recent transcript for mirroring in MAUI.
- `/`: lightweight chat UI with streaming.

### Setup
1) Install: `npm install`
2) Env (local, do not commit): create `.env.local` with `OPENAI_API_KEY=your-key`
3) Dev: `npm run dev` then open http://localhost:3000

### Deploy (GitHub + Vercel)
- Root Directory: `ai-advisor-web`
- Framework: Next.js
- Install: `npm install`
- Build: `next build`
- Output: `.next`
- Env var: `OPENAI_API_KEY` in Vercel project settings (Production, and Preview if needed).
- Redeploy after setting env.

### How it works
- `lib/sources.ts`: catalog URLs
- `lib/ingest.ts`: fetch + chunk + embed (cached in-memory on cold start)
- `lib/vectorStore.ts`: in-memory cosine search
- `app/api/chat/route.ts`: streams ChatGPT answer, appends to transcript
- `app/api/transcript/route.ts`: returns messages by `sessionId` (default `demo`)

### Notes
- Uses `gpt-4o-mini` and `text-embedding-3-small`; adjust in `app/api/chat/route.ts` / `lib/ingest.ts`.
- In-memory stores reset on cold starts; back with a DB/cache for persistence.***
