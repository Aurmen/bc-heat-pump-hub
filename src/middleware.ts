import { NextRequest, NextResponse } from 'next/server';

/**
 * middleware.ts — HTTP Security Headers
 *
 * Applied to every response. Hardens against:
 *  - Clickjacking        (X-Frame-Options, CSP frame-ancestors)
 *  - MIME sniffing       (X-Content-Type-Options)
 *  - Protocol downgrade  (Strict-Transport-Security)
 *  - XSS                 (Content-Security-Policy)
 *  - Info leakage        (Referrer-Policy, Permissions-Policy)
 */

const CSP = [
  // Only load scripts from self + Vercel analytics + GA + Stripe.js
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com https://js.stripe.com`,
  `style-src 'self' 'unsafe-inline'`,
  // Images: self + data URIs (for inline SVGs) + Google (GA pixel)
  `img-src 'self' data: https://www.google-analytics.com`,
  // Fonts: self only
  `font-src 'self'`,
  // API calls: self + Vercel analytics + GA + Stripe API
  `connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://vitals.vercel-insights.com https://*.stripe.com https://api.stripe.com`,
  // Stripe.js iframes for secure payment elements
  `frame-src https://js.stripe.com https://hooks.stripe.com`,
  // Never render this page inside a frame — clickjacking defence
  `frame-ancestors 'none'`,
  // No plugins (Flash, etc.)
  `object-src 'none'`,
  // Force HTTPS for any embedded resources
  `upgrade-insecure-requests`,
].join('; ');

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const h = response.headers;

  // ── Anti-framing ──────────────────────────────────────────────────────────
  h.set('X-Frame-Options', 'DENY');

  // ── Content Security Policy ───────────────────────────────────────────────
  h.set('Content-Security-Policy', CSP);

  // ── MIME sniffing prevention ──────────────────────────────────────────────
  h.set('X-Content-Type-Options', 'nosniff');

  // ── HTTPS enforcement (2-year max-age, include subdomains) ────────────────
  h.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // ── Referrer policy ───────────────────────────────────────────────────────
  // Send referrer within same origin; strip it on cross-origin navigation
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // ── Permissions policy — disable unused browser APIs ─────────────────────
  h.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // ── Remove server fingerprinting header ───────────────────────────────────
  h.delete('X-Powered-By');

  return response;
}

export const config = {
  matcher: [
    /*
     * Apply to all routes except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
