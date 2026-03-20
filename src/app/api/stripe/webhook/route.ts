/**
 * /api/stripe/webhook — Stripe event webhook handler.
 *
 * Verifies webhook signature, logs checkout.session.completed events.
 * Infrastructure route — no business logic beyond logging for now.
 *
 * Register in Stripe Dashboard:
 *   Developers → Webhooks → Add endpoint
 *   URL: https://aelrictechnologies.com/api/stripe/webhook
 *   Events: checkout.session.completed
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('[Stripe Webhook] checkout.session.completed', {
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
    });
  }

  return NextResponse.json({ received: true });
}
