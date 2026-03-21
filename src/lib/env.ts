/**
 * env.ts — Server-side environment variable validation
 *
 * Validates all required env vars at startup using Zod.
 * Throws a descriptive error at build/boot time rather than silently
 * failing at runtime with a cryptic undefined reference.
 *
 * RULE: Sensitive keys (API keys, secrets) must NEVER use the
 * NEXT_PUBLIC_ prefix — that prefix exposes values to the browser bundle.
 */
import 'server-only';
import { z } from 'zod';

const serverEnvSchema = z.object({
  // ── Resend ──────────────────────────────────────────────────────────────
  RESEND_API_KEY: z
    .string()
    .min(1, 'RESEND_API_KEY is required')
    .refine(k => !k.startsWith('NEXT_PUBLIC_'), {
      message: 'RESEND_API_KEY must never be prefixed with NEXT_PUBLIC_',
    }),

  // ── Airtable ─────────────────────────────────────────────────────────────
  AIRTABLE_API_KEY: z
    .string()
    .min(1, 'AIRTABLE_API_KEY is required')
    .refine(k => !k.startsWith('NEXT_PUBLIC_'), {
      message: 'AIRTABLE_API_KEY must never be prefixed with NEXT_PUBLIC_',
    }),

  AIRTABLE_BASE_ID: z
    .string()
    .min(1, 'AIRTABLE_BASE_ID is required')
    .startsWith('app', 'AIRTABLE_BASE_ID must start with "app"'),

  // ── Lead routing ─────────────────────────────────────────────────────────
  LEAD_EMAIL: z
    .string()
    .email('LEAD_EMAIL must be a valid email address'),
});

// ── Runtime-only env (validated lazily by consuming modules, not at build time) ──
// These are optional at build time (SSG doesn't need them) but required at runtime.
// Each module that uses them handles its own graceful fallback.
const runtimeEnvSchema = z.object({
  STRIPE_WEBHOOK_SECRET: z.string().min(10).optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

// ── Public env (safe to expose to browser) ────────────────────────────────
const publicEnvSchema = z.object({
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .optional()
    .refine(v => !v || v.startsWith('G-'), {
      message: 'GA measurement ID must start with "G-"',
    }),
});

function validateEnv() {
  const serverResult = serverEnvSchema.safeParse(process.env);

  if (!serverResult.success) {
    const issues = serverResult.error.issues
      .map(i => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `\n\n❌ Environment variable validation failed:\n${issues}\n\n` +
      `Check your Vercel environment variables or local .env.local file.\n`
    );
  }

  const publicResult = publicEnvSchema.safeParse(process.env);
  if (!publicResult.success) {
    console.warn('[env] Public env warnings:', publicResult.error.issues);
  }

  // Warn about missing runtime env vars (non-fatal — modules handle gracefully)
  const runtimeResult = runtimeEnvSchema.safeParse(process.env);
  if (!runtimeResult.success) {
    const missing = runtimeResult.error.issues
      .map(i => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.warn(`[env] Runtime env vars not configured (features will be degraded):\n${missing}`);
  }

  return serverResult.data;
}

/**
 * Validated, typed server environment variables.
 * Import this instead of accessing process.env directly in server code.
 */
export const env = validateEnv();
