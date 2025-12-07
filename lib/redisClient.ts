import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis() {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("Missing REDIS_URL for transcript storage.");
  }

  const useTls = url.startsWith("rediss://") || process.env.REDIS_TLS === "true";

  client = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    lazyConnect: true,
    tls: useTls
      ? {
          rejectUnauthorized: false
        }
      : undefined
  });

  return client;
}

