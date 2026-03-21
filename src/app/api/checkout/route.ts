/**
 * /api/checkout — Create a Stripe Checkout Session for the Ghost Load Auditor PDF report.
 *
 * POST { auditData: { sqft, serviceAmps, rangeW, ... }, currency?: 'cad' | 'usd' }
 *
 * Returns { url: string } — the Stripe-hosted checkout page URL.
 * Audit inputs are stored in session metadata for PDF regeneration on success.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, type SupportedCurrency } from '@/lib/stripe';

const VALID_CURRENCIES: SupportedCurrency[] = ['cad', 'usd'];

export async function POST(req: NextRequest) {
  let body: { auditData?: Record<string, unknown>; currency?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { auditData } = body;
  if (!auditData || typeof auditData !== 'object') {
    return NextResponse.json(
      { error: 'Missing auditData in request body' },
      { status: 422 }
    );
  }

  // Currency defaults to CAD (preserves existing CA behaviour)
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
