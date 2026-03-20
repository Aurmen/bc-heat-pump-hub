/**
 * /api/checkout/verify — Verify a Stripe Checkout Session payment status.
 *
 * GET ?session_id=cs_xxx
 *
 * Returns { paid: true, auditInputs: {...} } on confirmed payment,
 * or { paid: false } if not paid / invalid session.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { paid: false, error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ paid: false });
    }

    // Extract audit inputs from session metadata
    const raw = session.metadata?.audit_inputs;
    const auditInputs = raw ? JSON.parse(raw) : null;

    return NextResponse.json({ paid: true, auditInputs });
  } catch (err) {
    console.error('[Checkout Verify] Error retrieving session:', err);
    return NextResponse.json(
      { paid: false, error: 'Invalid or expired session' },
      { status: 400 }
    );
  }
}
