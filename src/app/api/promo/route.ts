/**
 * /api/promo — Validate a promo code without consuming it.
 *
 * GET /api/promo?code=LAUNCH2026
 *
 * Returns { valid, discount, remaining, reason? }
 */
import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/promo';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code');
  if (!code || !code.trim()) {
    return NextResponse.json(
      { valid: false, discount: 0, remaining: 0, reason: 'No code provided' },
      { status: 400 }
    );
  }

  const result = await validatePromoCode(code);
  return NextResponse.json(result);
}
