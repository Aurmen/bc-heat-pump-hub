/**
 * /api/checkout — Create a Stripe Checkout Session for the Ghost Load Auditor PDF report.
 *
 * POST { auditData: { sqft, serviceAmps, rangeW, ... }, currency?: 'cad' | 'usd', promoCode?: string }
 *
 * Without promoCode (or invalid): Returns { url: string } — Stripe-hosted checkout URL.
 * With valid 100% promo code:     Returns { success: true, free: true, downloadToken: string }
 *   — caller should then POST /api/audit-pdf with the downloadToken to get the PDF.
 *
 * Audit inputs are stored in Stripe session metadata for PDF regeneration on paid success.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, type SupportedCurrency } from '@/lib/stripe';
import { validatePromoCode, usePromoCode, createPromoDownloadToken } from '@/lib/promo';

const VALID_CURRENCIES: SupportedCurrency[] = ['cad', 'usd'];

export async function POST(req: NextRequest) {
  let body: { auditData?: Record<string, unknown>; currency?: string; promoCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { auditData, promoCode } = body;
  if (!auditData || typeof auditData !== 'object') {
    return NextResponse.json(
      { error: 'Missing auditData in request body' },
      { status: 422 }
    );
  }

  // ── Promo code path ──────────────────────────────────────────────────────
  if (promoCode && promoCode.trim()) {
    const validation = await validatePromoCode(promoCode);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason ?? 'Invalid promo code' },
        { status: 400 }
      );
    }

    if (validation.discount !== 100) {
      // Partial discounts not yet implemented — fall through to Stripe
      // (future: apply coupon to Stripe session)
    } else {
      // 100% discount: skip Stripe entirely
      await usePromoCode(promoCode);
      const downloadToken = await createPromoDownloadToken(promoCode);
      return NextResponse.json({ success: true, free: true, downloadToken });
    }
  }

  // ── Normal Stripe path ───────────────────────────────────────────────────
  const currency = (body.currency?.toLowerCase() ?? 'cad') as SupportedCurrency;
  if (!VALID_CURRENCIES.includes(currency)) {
    return NextResponse.json(
      { error: `Invalid currency: ${body.currency}. Supported: ${VALID_CURRENCIES.join(', ')}` },
      { status: 422 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set — cannot create checkout session without a valid base URL');
  }

  try {
    const session = await createCheckoutSession({
      currency,
      auditData,
      successUrl: `${baseUrl}/auditor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/auditor`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message.includes('metadata size limit')) {
      return NextResponse.json(
        { error: 'Audit data exceeds metadata size limit' },
        { status: 422 }
      );
    }
    console.error('[Checkout] Stripe session creation failed:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
