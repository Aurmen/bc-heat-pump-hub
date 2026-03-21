/**
 * rate-limiter.ts — Upstash Redis sliding window rate limiter
 *
 * Protects API endpoints from bot-driven scraping and runaway costs.
 *
 * Strategy: sliding window via @upstash/ratelimit backed by Upstash Redis.
 * Limits: 10 requests per IP per hour (sliding window).
 *
 * Graceful fallback: if Redis is unavailable, the request is ALLOWED
 * (fail open, not closed) to avoid blocking legitimate users during
 * infrastructure issues.
 *
 * Preserves the exact same exported function signature as the previous
 * in-memory implementation — zero callers need changes.
 */
import 'server-only';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

// ── Lazy-init to avoid build-time errors when env vars are absent ────────────
let _ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (_ratelimit) return _ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[rate-limiter] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled'
    );
    return null;
  }

  _ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'rl',
  });

  return _ratelimit;
}

/**
 * Check whether the given identifier (IP address) is within the rate limit.
 * Call this at the top of any server-side handler you want to protect.
 *
 * Signature preserved from the previous in-memory implementation.
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const rl = getRatelimit();

  if (!rl) {
    // Fail open — allow request if Redis is not configured
    return { allowed: true, remaining: 10, resetInMs: 0 };
  }

  try {
    const result = await rl.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetInMs: Math.max(0, result.reset - Date.now()),
    };
  } catch (err) {
    // Fail open — allow request if Redis call fails
    console.error('[rate-limiter] Redis error, failing open:', err);
    return { allowed: true, remaining: 10, resetInMs: 0 };
  }
}
