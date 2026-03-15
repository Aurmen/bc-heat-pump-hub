import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AuditBriefingEmail } from '@/emails/AuditBriefingEmail';

const BCC_ADDRESS = 'audits@aelrictechnologies.com';
const FROM_ADDRESS = 'Canadian Heat Pump Hub <audits@aelrictechnologies.com>';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    postalCode,
    consented,
    resultStatus,
    panelAmps,
    totalAmps,
    hasEV,
    loadManagement,
    sqft,
    heatingW,
    coolingW,
    rangeW,
    dryerW,
    waterHeaterW,
    evW,
    utilization,
  } = body;

  if (!email || !postalCode || !consented) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 },
    );
  }

  // Audit log — always fires, regardless of Resend config
  console.log('[AuditLead]', {
    timestamp: new Date().toISOString(),
    email,
    postalCode,
    resultStatus,
    panelAmps,
    totalAmps: Number(totalAmps).toFixed(1),
    utilization: Number(utilization).toFixed(0),
    consented,
  });

  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    // No key set — submission still succeeds, data preserved in server logs
    console.warn('[AuditLead] RESEND_API_KEY not set — email skipped.');
    return NextResponse.json({ success: true });
  }

  const resend = new Resend(resendKey);

  const isAtCapacity = resultStatus === 'FAIL' || resultStatus === 'WARN';

  const subject = isAtCapacity
    ? `Preliminary Feasibility Briefing — ${resultStatus} — Panel at ${Number(utilization).toFixed(0)}% Capacity`
    : `Preliminary Feasibility Briefing — PASS — ${Number(totalAmps).toFixed(1)}A on ${panelAmps}A Service`;

  const emailProps = {
    email,
    postalCode,
    consented,
    resultStatus: resultStatus as 'PASS' | 'WARN' | 'FAIL',
    panelAmps: Number(panelAmps),
    totalAmps: Number(totalAmps),
    utilization: Number(utilization),
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
