/**
 * /api/checkout — Create a Stripe Checkout Session for the Ghost Load Auditor PDF report.
 *
 * POST { auditData: { sqft, serviceAmps, rangeW, ... } }
 *
 * Returns { url: string } — the Stripe-hosted checkout page URL.
 * Audit inputs are stored in session metadata for PDF regeneration on success.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  let body: { auditData?: Record<string, unknown> };
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

  // Compact audit inputs for Stripe metadata (must be < 500 chars per value)
  const auditJson = JSON.stringify(auditData);
  if (auditJson.length > 500) {
    return NextResponse.json(
      { error: 'Audit data exceeds metadata size limit' },
      { status: 422 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aelrictechnologies.com';

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'cad',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            unit_amount: 2499,
            product_data: {
              name: 'Ghost Load Auditor — Pre-Quote Panel Capacity Report',
            },
          },
          quantity: 1,
        },
      ],
      automatic_tax: { enabled: true },
      success_url: `${baseUrl}/auditor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/auditor`,
      metadata: {
        audit_inputs: auditJson,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Checkout] Stripe session creation failed:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
