import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AuditBriefingEmail } from '@/emails/AuditBriefingEmail';
import { AuditInputSchema } from '@/lib/audit-schema';
import { checkRateLimit } from '@/lib/rate-limiter';
import { runAudit } from '@/lib/audit-engine';

const BCC_ADDRESS = 'audits@aurmen.com';
const FROM_ADDRESS = 'Canadian Heat Pump Hub <audits@heatpumplocator.com>';

export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const limit = await checkRateLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(limit.resetInMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // ── Input validation ─────────────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const parsed = AuditInputSchema.safeParse(rawBody);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, error: firstError?.message ?? 'Invalid input' },
      { status: 422 }
    );
  }

  const {
    email, postalCode, consented,
    panelAmps,
    hasEV, loadManagement, sqft,
    heatingW, coolingW, rangeW, dryerW,
    waterHeaterW, muaW, evW,
  } = parsed.data;

  // ── Authoritative server-side audit (CEC Rule 8-200, 26th Ed.) ──────────
  // Always re-compute from raw inputs. Client-provided totalAmps / utilization
  // / resultStatus are intentionally ignored — the server is the single source
  // of truth for the briefing document.
  const auditResult = runAudit({
    sqft:         Number(sqft),
    serviceAmps:  Number(panelAmps),
    rangeW:       Number(rangeW),
    dryerW:       Number(dryerW),
    waterHeaterW: Number(waterHeaterW),
    muaW:         Number(muaW ?? 0),
    heatingW:     Number(heatingW),
    coolingW:     Number(coolingW),
    evW:          Number(evW),
    loadManagement: Boolean(loadManagement),
  });

  // ── Report ID ────────────────────────────────────────────────────────────
  const reportId = `GL-${crypto.randomUUID().toUpperCase()}`;

  // ── Audit log ────────────────────────────────────────────────────────────
  console.log('[AuditLead]', {
    timestamp: new Date().toISOString(),
    reportId,
    email,
    postalCode,
    resultStatus: auditResult.status,
    panelAmps,
    totalAmps: auditResult.totalAmps.toFixed(1),
    utilization: auditResult.utilization.toFixed(0),
    consented,
    ip,
  });

  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.warn('[AuditLead] RESEND_API_KEY not set — email skipped.');
    return NextResponse.json({ success: true });
  }

  const resend = new Resend(resendKey);

  const isAtCapacity =
    auditResult.status === 'FAIL' || auditResult.status === 'WARN';

  const subject = isAtCapacity
    ? `Preliminary Feasibility Briefing — ${auditResult.status} — Panel at ${auditResult.utilization.toFixed(0)}% Capacity`
    : `Preliminary Feasibility Briefing — PASS — ${auditResult.totalAmps.toFixed(1)}A on ${panelAmps}A Service`;

  const emailProps = {
    email,
    postalCode,
    consented: consented as boolean,
    reportId,
    resultStatus:   auditResult.status,
    panelAmps:      Number(panelAmps),
    totalAmps:      auditResult.totalAmps,
    utilization:    auditResult.utilization,
    hasEV:          Boolean(hasEV),
    loadManagement: Boolean(loadManagement),
    sqft:           Number(sqft),
    heatingW:       Number(heatingW),
    coolingW:       Number(coolingW),
    rangeW:         Number(rangeW),
    dryerW:         Number(dryerW),
    waterHeaterW:   Number(waterHeaterW),
    muaW:           Number(muaW ?? 0),
    evW:            Number(evW),
  };

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [email],
    bcc: [BCC_ADDRESS],
    subject,
    react: React.createElement(AuditBriefingEmail, emailProps),
  });

  if (error) {
    console.error('[AuditLead] Resend error:', error);
    return NextResponse.json(
      { success: false, error: 'Email delivery failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
