/**
 * /api/audit-pdf — Ghost Load™ Compliance Report PDF endpoint
 *
 * POST  { sqft, serviceAmps, rangeW, dryerW, waterHeaterW, muaW,
 *         heatingW, coolingW, evW, loadManagement }
 *
 * Returns a server-generated PDF (application/pdf) with a unique
 * Report ID. All demand factors are computed server-side using the
 * authoritative CEC Rule 8-200 engine — no client values are trusted.
 *
 * No email or consent required — free download for any completed audit.
 */
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { renderToBuffer } from '@react-pdf/renderer';
import { runAudit } from '@/lib/audit-engine';
import { AuditReportDocument } from '@/lib/AuditReportPDF';
import { checkRateLimit } from '@/lib/rate-limiter';

// ── Input validation ───────────────────────────────────────────────────────────
const VALID_SERVICE = [60, 100, 125, 150, 200, 320, 400] as const;

const PDFInputSchema = z.object({
  sqft:         z.number().min(100).max(20000).finite(),
  serviceAmps:  z.number().refine(
    (v): v is typeof VALID_SERVICE[number] =>
      (VALID_SERVICE as readonly number[]).includes(v),
    { message: 'Invalid service size' }
  ),
  rangeW:       z.number().min(0).max(14400).finite(),
  dryerW:       z.number().min(0).max(7500).finite(),
  waterHeaterW: z.number().min(0).max(6000).finite(),
  muaW:         z.number().min(0).max(20000).finite().optional().default(0),
  heatingW:     z.number().min(0).max(30000).finite(),
  coolingW:     z.number().min(0).max(20000).finite(),
  evW:          z.number().min(0).max(19200).finite(),
  loadManagement: z.boolean(),

  // Thermal analysis inputs (optional — dual-fuel & altitude)
  elevation:       z.number().min(0).max(3000).finite().optional().default(0),
  isDualFuel:      z.boolean().optional().default(false),
  balancePoint:    z.number().min(-20).max(15).finite().optional().default(2),
  gasNameplateBtu: z.number().min(0).max(200000).finite().optional().default(0),
  gasRatePerGj:    z.number().min(0).max(100).finite().optional().default(12.50),
  elecRatePerKwh:  z.number().min(0).max(1).finite().optional().default(0.14),
  furnaceAfue:     z.number().min(0.5).max(1.0).finite().optional().default(0.96),
});

// ── Handler ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const limit = await checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait before generating another report.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(limit.resetInMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = PDFInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, error: firstError?.message ?? 'Invalid input' },
      { status: 422 }
    );
  }

  const inputs = parsed.data;

  // ── Server-side audit ────────────────────────────────────────────────────
  const result = runAudit(inputs);

  // ── Report ID ────────────────────────────────────────────────────────────
  const uuid = crypto.randomUUID().toUpperCase().replace(/-/g, '').slice(0, 12);
  const reportId = `GL-${uuid}`;
  const generatedAt = new Date().toISOString();

  // ── Audit log ────────────────────────────────────────────────────────────
  console.log('[AuditPDF]', {
    timestamp: generatedAt,
    reportId,
    ip,
    status: result.status,
    serviceAmps: inputs.serviceAmps,
    totalAmps: result.totalAmps.toFixed(1),
    utilization: result.utilization.toFixed(0),
    elevation: inputs.elevation ?? 0,
    hasThermal: !!result.thermal,
  });

  // ── Generate PDF ─────────────────────────────────────────────────────────
  let pdfBuffer: Buffer;
  try {
    // renderToBuffer expects ReactElement<DocumentProps>.  AuditReportDocument
    // returns a <Document> (which IS DocumentProps) but tsc can only see the
    // wrapping FunctionComponentElement type.  The cast is safe at runtime.
    pdfBuffer = await renderToBuffer(
      React.createElement(AuditReportDocument, {
        reportId,
        generatedAt,
        inputs,
        result,
      }) as unknown as Parameters<typeof renderToBuffer>[0]
    );
  } catch (err) {
    console.error('[AuditPDF] renderToBuffer error:', err);
    return NextResponse.json(
      { success: false, error: 'PDF generation failed' },
      { status: 500 }
    );
  }

  // ── Return PDF ───────────────────────────────────────────────────────────
  // NextResponse (Fetch API body) requires BodyInit — Buffer is a Node type,
  // not directly assignable. Uint8Array satisfies BodyInit and is a zero-copy
  // view of the same underlying memory as the Buffer.
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reportId}.pdf"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Report-ID': reportId,
    },
  });
}
