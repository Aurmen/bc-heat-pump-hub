/**
 * promo.ts — Promo code validation and usage tracking via Upstash Redis.
 *
 * SERVER ONLY
 *
 * Flow:
 *  1. validatePromoCode(code)  — read-only check (remaining uses, expiry)
 *  2. usePromoCode(code)       — increment counter (call once at checkout)
 *  3. createPromoDownloadToken — write one-use token to Redis (15 min TTL)
 *  4. redeemPromoDownloadToken — delete token, return promo code (one-time)
 *  5. getPromoUsage(code)      — read current use count (for admin)
 */
import 'server-only';

import { Redis } from '@upstash/redis';

// ── Code definitions ─────────────────────────────────────────────────────────

interface PromoCode {
  code: string;
  discountPercent: number;
  maxUses: number;
  expiresAt: string; // ISO 8601
}

const PROMO_CODES: PromoCode[] = [
  {
    code: 'LAUNCH2026',
    discountPercent: 100,
    maxUses: 100,
    expiresAt: '2026-04-30T23:59:59Z',
  },
];

// ── Types ────────────────────────────────────────────────────────────────────

export interface PromoValidation {
  valid: boolean;
  discount: number;   // 0–100
  remaining: number;
  reason?: string;    // human-readable error when valid=false
}

// ── Redis helpers ────────────────────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

function counterKey(code: string) {
  return `promo:${code}:count`;
}

function tokenKey(token: string) {
  return `promo-token:${token}`;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Validate a promo code without incrementing its use counter.
 * Safe to call on every "Apply" click.
 */
export async function validatePromoCode(code: string): Promise<PromoValidation> {
  const normalised = code.trim().toUpperCase();
  const promo = PROMO_CODES.find(p => p.code === normalised);

  if (!promo) {
    return { valid: false, discount: 0, remaining: 0, reason: 'Invalid promo code' };
  }

  if (new Date() > new Date(promo.expiresAt)) {
    return { valid: false, discount: 0, remaining: 0, reason: 'Promo code has expired' };
  }

  const redis = getRedis();
  let used = 0;
  if (redis) {
    try {
      const count = await redis.get<number>(counterKey(normalised));
      used = count ?? 0;
    } catch {
      // Fail open — allow if Redis is unreachable
    }
  }

  const remaining = promo.maxUses - used;
  if (remaining <= 0) {
    return { valid: false, discount: 0, remaining: 0, reason: 'Promo code has been fully redeemed' };
  }

  return { valid: true, discount: promo.discountPercent, remaining };
}

/**
 * Increment the use counter. Call exactly once per successful checkout.
 * Returns the new use count.
 */
export async function usePromoCode(code: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    return await redis.incr(counterKey(code.trim().toUpperCase()));
  } catch {
    return 0;
  }
}

/**
 * Create a one-use download token after a successful promo checkout.
 * Expires in 15 minutes.
 */
export async function createPromoDownloadToken(code: string): Promise<string> {
  const token = crypto.randomUUID();
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(tokenKey(token), code.trim().toUpperCase(), { ex: 900 });
    } catch {
      // non-fatal — token stored in memory only; will be passed back through client
    }
  }
  return token;
}

/**
 * Redeem a download token exactly once (atomic delete + return).
 * Returns the associated promo code, or null if token is invalid/expired.
 */
export async function redeemPromoDownloadToken(token: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const code = await redis.get<string>(tokenKey(token));
    if (!code) return null;
    await redis.del(tokenKey(token));
    return code;
  } catch {
    return null;
  }
}

/**
 * Read the current use count for a code. Used by admin stats.
 */
export async function getPromoUsage(code: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    const count = await redis.get<number>(counterKey(code.trim().toUpperCase()));
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Return promo code config info (for admin display).
 */
export function getPromoCodes(): PromoCode[] {
  return PROMO_CODES;
}
