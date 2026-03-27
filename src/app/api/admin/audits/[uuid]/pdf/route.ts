/**
 * /api/admin/audits/[uuid]/pdf — Regenerate PDF from stored audit log data.
 *
 * GET /api/admin/audits/:uuid/pdf
 *
 * Requires: Authorization: Bearer <ADMIN_SECRET>
 */
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { requireAdmin } from '@/lib/admin-auth';
import { getAuditLog } from '@/lib/audit-log';
import { runAudit } from '@/lib/audit-engine';
import { AuditReportDocument } from '@/lib/AuditReportPDF';
import { runNecAudit } from '@/lib/nec-engine';
import { NecReportDocument } from '@/lib/NecReportPDF';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const { uuid } = await params;
  const entry = await getAuditLog(uuid);
  if (!entry) {
    return NextResponse.json({ error: 'Audit log not found' }, { status: 404 });
  }

  try {
    let pdfBuffer: Buffer;

    if (entry.standard === 'NEC 220.82') {
      // NEC audit — reconstruct inputs from log entry
      const necInputs = {
        sqft: entry.sqft,
        serviceAmps: entry.panelAmps,
        rangeW: entry.appliances.includes('range') ? 12000 : 0,
        dryerW: entry.appliances.includes('dryer') ? 5400 : 0,
        waterHeaterW: entry.appliances.includes('water_heater') ? 4500 : 0,
        dishwasherW: 1400,
        heatingW: entry.appliances.includes('heating') ? 12000 : 0,
        coolingW: entry.appliances.includes('cooling') ? 5000 : 0,
        heatingType: 'heat_pump' as const,
        heatingUnits: 1,
        evW: entry.appliances.includes('ev') ? 7680 : 0,
        hasElms: false,
        elmsLoadW: 0,
        smallApplianceCircuits: 2,
        hasLaundryCircuit: true,
        otherFixedW: 0,
      };
      const result = runNecAudit(necInputs);
      pdfBuffer = await renderToBuffer(
        React.createElement(NecReportDocument, {
          reportId: entry.uuid,
          generatedAt: entry.timestamp,
          inputs: necInputs,
          result,
        }) as unknown as Parameters<typeof renderToBuffer>[0]
      );
    } else {
      // CEC audit — reconstruct inputs
      const cecInputs = {
        sqft: entry.sqft,
        serviceAmps: entry.panelAmps,
        rangeW: entry.appliances.includes('range') ? 12000 : 0,
        dryerW: entry.appliances.includes('dryer') ? 5400 : 0,
        waterHeaterW: entry.appliances.includes('water_heater') ? 4500 : 0,
        muaW: entry.appliances.includes('mua') ? 3000 : 0,
        heatingW: entry.appliances.includes('heating') ? 12000 : 0,
        coolingW: entry.appliances.includes('cooling') ? 5000 : 0,
        evW: entry.appliances.includes('ev') ? 7200 : 0,
        loadManagement: false,
      };
      const result = runAudit(cecInputs);
      pdfBuffer = await renderToBuffer(
        React.createElement(AuditReportDocument, {
          reportId: entry.uuid,
          generatedAt: entry.timestamp,
          inputs: cecInputs,
          result,
        }) as unknown as Parameters<typeof renderToBuffer>[0]
      );
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${entry.uuid}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[admin/audits/pdf] Generation failed:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
