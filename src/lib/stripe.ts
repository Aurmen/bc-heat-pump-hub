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
