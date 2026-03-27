/**
 * /api/stripe/webhook — Stripe event webhook handler.
 *
 * On checkout.session.completed:
 *   1. Re-run audit engine server-side
 *   2. Store/update in Upstash Redis (72h TTL, paid: true)
 *   3. Send admin notification email via Resend
 *   4. Send customer confirmation email via Resend
 *   5. Write record to Airtable
 *
 * On payment_intent.payment_failed:
 *   - Log failure details
 *
 * Register in Stripe Dashboard:
 *   URL: https://canadianheatpumphub.ca/api/stripe/webhook
 *   Events: checkout.session.completed, payment_intent.payment_failed
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { runAudit, type AuditInputs } from '@/lib/audit-engine';
import { writeAuditLog, type AuditLogEntry } from '@/lib/audit-log';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const maxDuration = 30;

const TTL_SECONDS = 259200; // 72 hours
const SITE_URL = 'https://canadianheatpumphub.ca';
const SITE_NAME = 'Canadian Heat Pump Hub';
const FROM_EMAIL = 'Canadian Heat Pump Hub <audits@canadianheatpumphub.ca>';
const CONTACT_EMAIL = 'contact@canadianheatpump.ca';
const CURRENCY_LABEL = 'CAD $24.99';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Redis } = await import('@upstash/redis');
  return new Redis({ url, token });
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Webhook] RESEND_API_KEY not set, skipping email');
    return;
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[Webhook] Email send failed:', err);
  }
}

async function writeAirtable(fields: Record<string, unknown>) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    console.warn('[Webhook] Airtable env vars not set, skipping');
    return;
  }
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/Purchases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[Webhook] Airtable write failed:', res.status, text);
    }
  } catch (err) {
    console.error('[Webhook] Airtable error:', err);
  }
}

function buildAdminEmailHtml(data: {
  uuid: string;
  sessionId: string;
  customerEmail: string;
  amount: string;
  timestamp: string;
  status: string;
  panelAmps: number;
  sqft: number;
  keyLoads: string;
  redownloadUrl: string;
}) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0f172a; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 16px;">${SITE_NAME}</h2>
    <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">New Report Purchase</p>
  </div>
  <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #64748b;">Report UUID</td><td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${data.uuid}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Amount</td><td style="padding: 6px 0; font-weight: bold;">${data.amount}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Session ID</td><td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${data.sessionId}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Customer</td><td style="padding: 6px 0;">${data.customerEmail}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Timestamp</td><td style="padding: 6px 0;">${data.timestamp}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Audit Result</td><td style="padding: 6px 0; font-weight: bold; color: ${data.status === 'PASS' ? '#16a34a' : data.status === 'WARN' ? '#d97706' : '#dc2626'};">${data.status}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Panel</td><td style="padding: 6px 0;">${data.panelAmps}A</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Sqft</td><td style="padding: 6px 0;">${data.sqft}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Key Loads</td><td style="padding: 6px 0; font-size: 12px;">${data.keyLoads}</td></tr>
    </table>
    <div style="margin-top: 16px;">
      <a href="${data.redownloadUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">Re-download Report</a>
    </div>
  </div>
</div>`;
}

function buildCustomerEmailHtml(data: {
  uuid: string;
  redownloadUrl: string;
  siteName: string;
  siteUrl: string;
  contactEmail: string;
}) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0f172a; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 16px;">${data.siteName}</h2>
    <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Your Panel Report is Ready</p>
  </div>
  <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px;">Thank you for your purchase. Your panel capacity audit report is ready for download.</p>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 8px;">Report ID: <strong style="font-family: monospace;">${data.uuid}</strong></p>
    <div style="margin: 20px 0;">
      <a href="${data.redownloadUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Download Your Report</a>
    </div>
    <p style="font-size: 13px; color: #94a3b8; margin: 16px 0 0;">This link is valid for 72 hours. Save the PDF to your device for permanent access.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
      Questions? Contact <a href="mailto:${data.contactEmail}" style="color: #2563eb;">${data.contactEmail}</a>
    </p>
    <p style="font-size: 12px; color: #94a3b8; margin: 8px 0 0;">
      <a href="${data.siteUrl}/auditor" style="color: #2563eb;">Run another audit</a>
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.5;">
      DISCLAIMER: This report provides a preliminary load estimate for informational purposes only. It does not replace a licensed electrician's site inspection or an official permit submission. Final decisions must be made by a qualified electrical contractor.
    </p>
  </div>
</div>`;
}

function buildFailureAlertHtml(data: { uuid: string; sessionId: string; customerEmail: string; error: string }) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #dc2626; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 16px;">PDF Generation Failed</h2>
    <p style="margin: 4px 0 0; font-size: 13px; color: #fecaca;">Action Required</p>
  </div>
  <div style="border: 1px solid #fecaca; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background: #fef2f2;">
    <p style="font-size: 14px; color: #991b1b; margin: 0 0 12px;">A customer paid but the audit processing failed. Manual intervention required.</p>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #64748b;">UUID</td><td style="padding: 6px 0; font-family: monospace;">${data.uuid}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Session ID</td><td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${data.sessionId}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Customer</td><td style="padding: 6px 0;">${data.customerEmail}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Error</td><td style="padding: 6px 0; color: #dc2626;">${data.error}</td></tr>
    </table>
    <p style="font-size: 13px; color: #991b1b; margin: 16px 0 0;">Issue a manual refund or resend the report from the Stripe Dashboard.</p>
  </div>
</div>`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // ── checkout.session.completed ───────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email ?? session.customer_email ?? '';
    const timestamp = new Date().toISOString();

    console.log('[Stripe Webhook] checkout.session.completed', {
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail,
    });

    // Extract audit inputs from session metadata
    const auditJson = session.metadata?.audit_inputs;
    if (!auditJson) {
      console.error('[Stripe Webhook] No audit_inputs in session metadata');
      return NextResponse.json({ received: true });
    }

    let auditData: Record<string, unknown>;
    try {
      auditData = JSON.parse(auditJson);
    } catch {
      console.error('[Stripe Webhook] Failed to parse audit_inputs JSON');
      return NextResponse.json({ received: true });
    }

    // Re-run audit engine server-side
    let uuid = 'UNKNOWN';
    let status = 'UNKNOWN';
    let panelAmps = 0;
    let sqft = 0;

    try {
      const inputs: AuditInputs = {
        sqft: Number(auditData.sqft ?? 0),
        serviceAmps: Number(auditData.serviceAmps ?? auditData.panelAmps ?? 200),
        rangeW: Number(auditData.rangeW ?? 0),
        dryerW: Number(auditData.dryerW ?? 0),
        waterHeaterW: Number(auditData.waterHeaterW ?? 0),
        muaW: Number(auditData.muaW ?? 0),
        heatingW: Number(auditData.heatingW ?? 0),
        coolingW: Number(auditData.coolingW ?? 0),
        evW: Number(auditData.evW ?? 0),
        loadManagement: Boolean(auditData.loadManagement),
        elevation: Number(auditData.elevation ?? 0),
        isDualFuel: Boolean(auditData.isDualFuel),
        balancePoint: Number(auditData.balancePoint ?? 2),
        gasNameplateBtu: Number(auditData.gasNameplateBtu ?? 0),
        gasRatePerGj: Number(auditData.gasRatePerGj ?? 12.50),
        elecRatePerKwh: Number(auditData.elecRatePerKwh ?? 0.14),
        furnaceAfue: Number(auditData.furnaceAfue ?? 0.96),
      };

      const result = runAudit(inputs);
      uuid = crypto.randomUUID().toUpperCase().replace(/-/g, '').slice(0, 12);
      status = result.status;
      panelAmps = inputs.serviceAmps;
      sqft = inputs.sqft;

      const keyLoads = [
        inputs.heatingW > 0 ? `Heat: ${inputs.heatingW}W` : null,
        inputs.coolingW > 0 ? `Cool: ${inputs.coolingW}W` : null,
        inputs.rangeW > 0 ? `Range: ${inputs.rangeW}W` : null,
        inputs.evW > 0 ? `EV: ${inputs.evW}W` : null,
      ].filter(Boolean).join(', ') || 'None';

      const redownloadUrl = `${SITE_URL}/auditor/success?session_id=${session.id}`;

      // 1. Store in Upstash Redis (72h TTL, paid: true)
      const redis = await getRedis();
      if (redis) {
        const kvValue = {
          inputs,
          result,
          paid: true,
          customerEmail,
          timestamp,
          uuid,
          sessionId: session.id,
          currency: session.currency,
          amount: session.amount_total,
        };
        try {
          await redis.set(`audit:${session.id}`, JSON.stringify(kvValue), { ex: TTL_SECONDS });
          console.log('[Webhook] Stored in Redis', { uuid, status });
        } catch (err) {
          console.error('[Webhook] Redis store failed:', err);
        }
      }

      // 2. Persistent audit log (no PII, no TTL)
      const paidAppliances: string[] = [];
      if (inputs.rangeW > 0) paidAppliances.push('range');
      if (inputs.dryerW > 0) paidAppliances.push('dryer');
      if (inputs.waterHeaterW > 0) paidAppliances.push('water_heater');
      if (inputs.muaW > 0) paidAppliances.push('mua');
      if (inputs.heatingW > 0) paidAppliances.push('heating');
      if (inputs.coolingW > 0) paidAppliances.push('cooling');
      if (inputs.evW > 0) paidAppliances.push('ev');

      const auditLogEntry: AuditLogEntry = {
        uuid,
        timestamp,
        country: (session.currency === 'usd' ? 'us' : 'ca') as 'us' | 'ca',
        standard: session.currency === 'usd' ? 'NEC 220.82' : 'CEC 8-200',
        zip: '',
        panelAmps: inputs.serviceAmps,
        sqft: inputs.sqft,
        calculatedAmps: Math.round(result.totalAmps * 10) / 10,
        status: result.status,
        utilization: Math.round(result.utilization * 10) / 10,
        paid: true,
        promoCode: session.metadata?.promo_code ?? null,
        appliances: paidAppliances,
        hpReplacesAc: inputs.heatingW > 0 && inputs.coolingW > 0,
      };
      writeAuditLog(auditLogEntry).catch(() => {});

      // 3. Send admin notification email (renumbered from original step 2)
      const leadEmail = process.env.LEAD_EMAIL;
      if (leadEmail) {
        await sendEmail(
          leadEmail,
          `New Report Purchase — ${uuid}`,
          buildAdminEmailHtml({
            uuid,
            sessionId: session.id,
            customerEmail,
            amount: CURRENCY_LABEL,
            timestamp,
            status,
            panelAmps,
            sqft,
            keyLoads,
            redownloadUrl,
          })
        );
      }

      // 3. Send customer confirmation email
      if (customerEmail) {
        await sendEmail(
          customerEmail,
          'Your Heat Pump Panel Report is Ready',
          buildCustomerEmailHtml({
            uuid,
            redownloadUrl,
            siteName: SITE_NAME,
            siteUrl: SITE_URL,
            contactEmail: CONTACT_EMAIL,
          })
        );
      }

      // 4. Write to Airtable
      await writeAirtable({
        UUID: uuid,
        'Stripe Session': session.id,
        'Customer Email': customerEmail,
        Amount: `${CURRENCY_LABEL}`,
        Timestamp: timestamp,
        'Audit Status': status,
        'Panel Amps': panelAmps,
        'Square Footage': sqft,
        'Download Status': 'completed',
        'Report URL': redownloadUrl,
      });

    } catch (err) {
      // 5. Error alerting — PDF/audit processing failed
      console.error('[Webhook] Audit processing failed:', err);

      const leadEmail = process.env.LEAD_EMAIL;
      if (leadEmail) {
        await sendEmail(
          leadEmail,
          `PDF FAILED — Action Required [${uuid}]`,
          buildFailureAlertHtml({
            uuid,
            sessionId: session.id,
            customerEmail,
            error: err instanceof Error ? err.message : String(err),
          })
        );
      }

      await writeAirtable({
        UUID: uuid,
        'Stripe Session': session.id,
        'Customer Email': customerEmail,
        Amount: CURRENCY_LABEL,
        Timestamp: timestamp,
        'Audit Status': 'pdf_failed',
        'Panel Amps': panelAmps,
        'Square Footage': sqft,
        'Download Status': 'pdf_failed',
        'Report URL': '',
      });
    }

    return NextResponse.json({ received: true });
  }

  // ── payment_intent.payment_failed ──────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.error('[Stripe Webhook] payment_intent.payment_failed', {
      paymentIntentId: paymentIntent.id,
      reason: paymentIntent.last_payment_error?.message ?? 'Unknown',
      code: paymentIntent.last_payment_error?.code,
    });
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
