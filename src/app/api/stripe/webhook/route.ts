/**
 * /api/stripe/webhook — Stripe event webhook handler.
 *
 * Verifies webhook signature, processes checkout completions and payment failures.
 *
 * On checkout.session.completed:
 *   1. Extract audit inputs from session metadata
 *   2. Re-run audit engine server-side (never trust client calculation)
 *   3. Store result in Vercel KV (72-hour TTL)
 *   4. Mark as ready for PDF generation
 *
 * Register in Stripe Dashboard:
 *   Developers → Webhooks → Add endpoint
 *   URL: https://canadianheatpumphub.ca/api/stripe/webhook
 *   Events: checkout.session.completed, payment_intent.payment_failed
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { kv } from '@vercel/kv';
import { runAudit, type AuditInputs } from '@/lib/audit-engine';
import type Stripe from 'stripe';

const TTL_SECONDS = 259200; // 72 hours

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

  // ── checkout.session.completed ───────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('[Stripe Webhook] checkout.session.completed', {
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
    });

    // Extract audit inputs from session metadata
    const auditJson = session.metadata?.audit_inputs;
    if (!auditJson) {
      console.error('[Stripe Webhook] No audit_inputs in session metadata', {
        sessionId: session.id,
      });
      // Still return 200 — we don't want Stripe to retry for missing metadata
      return NextResponse.json({ received: true });
    }

    let auditData: Record<string, unknown>;
    try {
      auditData = JSON.parse(auditJson);
    } catch {
      console.error('[Stripe Webhook] Failed to parse audit_inputs JSON', {
        sessionId: session.id,
      });
      return NextResponse.json({ received: true });
    }

    // Re-run audit engine server-side — never trust client calculation
    const inputs: AuditInputs = {
      sqft:           Number(auditData.sqft ?? 0),
      serviceAmps:    Number(auditData.serviceAmps ?? auditData.panelAmps ?? 200),
      rangeW:         Number(auditData.rangeW ?? 0),
      dryerW:         Number(auditData.dryerW ?? 0),
      waterHeaterW:   Number(auditData.waterHeaterW ?? 0),
      muaW:           Number(auditData.muaW ?? 0),
      heatingW:       Number(auditData.heatingW ?? 0),
      coolingW:       Number(auditData.coolingW ?? 0),
      evW:            Number(auditData.evW ?? 0),
      loadManagement: Boolean(auditData.loadManagement),
      elevation:      Number(auditData.elevation ?? 0),
      isDualFuel:     Boolean(auditData.isDualFuel),
      balancePoint:   Number(auditData.balancePoint ?? 2),
      gasNameplateBtu: Number(auditData.gasNameplateBtu ?? 0),
      gasRatePerGj:   Number(auditData.gasRatePerGj ?? 12.50),
      elecRatePerKwh: Number(auditData.elecRatePerKwh ?? 0.14),
      furnaceAfue:    Number(auditData.furnaceAfue ?? 0.96),
    };

    const result = runAudit(inputs);
    const uuid = crypto.randomUUID().toUpperCase().replace(/-/g, '').slice(0, 12);

    // Store in Vercel KV with 72-hour TTL
    const kvKey = `audit:${session.id}`;
    const kvValue = {
      inputs,
      result,
      paid: true,
      timestamp: new Date().toISOString(),
      uuid,
      sessionId: session.id,
      currency: session.currency,
      amount: session.amount_total,
    };

    try {
      await kv.set(kvKey, kvValue, { ex: TTL_SECONDS });
      console.log('[Stripe Webhook] Stored audit result in KV', {
        key: kvKey,
        uuid,
        status: result.status,
      });
    } catch (err) {
      console.error('[Stripe Webhook] Failed to store in KV:', err);
      // Don't fail the webhook — the payment is still valid
    }

    return NextResponse.json({ received: true });
  }

  // ── payment_intent.payment_failed ──────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.error('[Stripe Webhook] payment_intent.payment_failed', {
      paymentIntentId: paymentIntent.id,
      timestamp: new Date().toISOString(),
      reason: paymentIntent.last_payment_error?.message ?? 'Unknown',
      code: paymentIntent.last_payment_error?.code,
    });

    return NextResponse.json({ received: true });
  }

  // ── Unhandled event types — acknowledge silently ─────────────────────────
  return NextResponse.json({ received: true });
}
