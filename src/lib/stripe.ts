/**
 * stripe.ts — Server-side Stripe client (lazy-initialized)
 *
 * Lazy init avoids import-time errors during SSG build when
 * STRIPE_SECRET_KEY may not be present in the build environment.
 */
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// ── Multi-currency support ───────────────────────────────────────────────────

export type SupportedCurrency = 'cad' | 'usd';

export interface CheckoutConfig {
  currency: SupportedCurrency;
  auditData: Record<string, unknown>;
  successUrl: string;
  cancelUrl: string;
}

const PRICE_CENTS = 2499; // $24.99 in both currencies
const STATEMENT_DESCRIPTOR = 'HEATPUMPLOCATOR';

export async function createCheckoutSession(config: CheckoutConfig) {
  const stripe = getStripe();
  const { currency, auditData, successUrl, cancelUrl } = config;

  const auditJson = JSON.stringify(auditData);
  if (auditJson.length > 500) {
    throw new Error('Audit data exceeds metadata size limit');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency,
    payment_intent_data: {
      statement_descriptor: STATEMENT_DESCRIPTOR,
    },
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: PRICE_CENTS,
          product_data: {
            name: 'Ghost Load Auditor — Pre-Quote Panel Capacity Report',
          },
        },
        quantity: 1,
      },
    ],
    // automatic_tax: { enabled: true }, // Enable after adding head office address in Stripe Dashboard > Settings > Tax
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      audit_inputs: auditJson,
    },
  });

  return session;
}
