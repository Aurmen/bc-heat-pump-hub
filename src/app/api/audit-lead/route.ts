import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AuditBriefingEmail } from '@/emails/AuditBriefingEmail';
import { AuditInputSchema } from '@/lib/audit-schema';
import { checkRateLimit } from '@/lib/rate-limiter';

const BCC_ADDRESS = 'audits@aurmen.com';
const FROM_ADDRESS = 'Canadian Heat Pump Hub <audits@canadianheatpumphub.ca>';

export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const limit = checkRateLimit(ip);

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
    resultStatus, panelAmps, totalAmps,
    hasEV, loadManagement, sqft,
    heatingW, coolingW, rangeW, dryerW,
    waterHeaterW, evW, utilization,
  } = parsed.data;

  // ── Audit log ────────────────────────────────────────────────────────────
  console.log('[AuditLead]', {
    timestamp: new Date().toISOString(),
    email,
    postalCode,
    resultStatus,
    panelAmps,
    totalAmps: Number(totalAmps ?? 0).toFixed(1),
    utilization: Number(utilization ?? 0).toFixed(0),
    consented,
    ip,
  });

  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.warn('[AuditLead] RESEND_API_KEY not set — email skipped.');
    return NextResponse.json({ success: true });
  }

  const resend = new Resend(resendKey);

  const isAtCapacity = resultStatus === 'FAIL' || resultStatus === 'WARN';

  const subject = isAtCapacity
    ? `Preliminary Feasibility Briefing — ${resultStatus} — Panel at ${Number(utilization ?? 0).toFixed(0)}% Capacity`
    : `Preliminary Feasibility Briefing — PASS — ${Number(totalAmps ?? 0).toFixed(1)}A on ${panelAmps}A Service`;

  const emailProps = {
    email,
    postalCode,
    consented: consented as boolean,
    resultStatus: (resultStatus ?? 'PASS') as 'PASS' | 'WARN' | 'FAIL',
    panelAmps: Number(panelAmps),
    totalAmps: Number(totalAmps ?? 0),
    utilization: Number(utilization ?? 0),
    hasEV: Boolean(hasEV),
    loadManagement: Boolean(loadManagement),
    sqft: Number(sqft),
    heatingW: Number(heatingW),
    coolingW: Number(coolingW),
    rangeW: Number(rangeW),
    dryerW: Number(dryerW),
    waterHeaterW: Number(waterHeaterW),
    evW: Number(evW),
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
