/**
 * rate-limiter.ts — In-process sliding window rate limiter
 *
 * Protects the audit endpoint from bot-driven scraping of the
 * calculation engine and runaway Vercel function costs.
 *
 * Strategy: sliding window counter per IP, stored in a server-side Map.
 * Limits: 10 requests / 60 seconds per IP address.
 *
 * Note: This is a single-process limiter suitable for Vercel serverless
 * (each function instance has its own counter). For multi-region
 * enforcement, replace with Upstash Redis + @upstash/ratelimit.
 */
import 'server-only';

interface WindowEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS  = 60_000;  // 1 minute
const MAX_REQUESTS = 10;    // per window per IP

// Map persists across requests within the same function instance
const store = new Map<string, WindowEntry>();

// Prune stale entries every ~5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > WINDOW_MS * 5) {
      store.delete(key);
    }
  }
}, 300_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Check whether the given identifier (IP address) is within the rate limit.
 * Call this at the top of any server-side handler you want to protect.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    store.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetInMs: WINDOW_MS };
  }

  entry.count += 1;
  const resetInMs = WINDOW_MS - (now - entry.windowStart);
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);

  return {
    allowed: entry.count <= MAX_REQUESTS,
    remaining,
    resetInMs,
  };
}
