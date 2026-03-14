import { NextRequest, NextResponse } from 'next/server';

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

  // Audit log — always fires, regardless of email config
  console.log('[AuditLead]', {
    timestamp: new Date().toISOString(),
    email,
    postalCode,
    resultStatus,
    panelAmps,
    totalAmps: Number(totalAmps).toFixed(1),
    utilization: Number(utilization).toFixed(0),
  });

  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_EMAIL;

  if (resendKey && toEmail) {
    const isAtCapacity = resultStatus === 'FAIL' || resultStatus === 'WARN';

    const subject = isAtCapacity
      ? `⚡ Panel ${resultStatus} Lead — ${postalCode} — ${Number(totalAmps).toFixed(1)}A on ${panelAmps}A service`
      : `📋 Panel PASS Lead — ${postalCode} — ${Number(totalAmps).toFixed(1)}A on ${panelAmps}A service`;

    const emailText = [
      `New Ghost Load Auditor Lead — ${resultStatus}`,
      ``,
      `─── Contact Info ─────────────────────────────`,
      `Email:        ${email}`,
      `Postal Code:  ${postalCode}`,
      `Consented:    Yes`,
      ``,
      `─── Audit Results ────────────────────────────`,
      `Result:             ${resultStatus}`,
      `Panel Service:      ${panelAmps}A`,
      `Total Load:         ${Number(totalAmps).toFixed(1)}A`,
      `Utilization:        ${Number(utilization).toFixed(0)}%`,
      `Has EV Charger:     ${hasEV ? 'Yes' : 'No'}`,
      `Load Management:    ${loadManagement ? 'Yes (DCC-10)' : 'No'}`,
      ``,
      `─── Property & Appliance Inputs ──────────────`,
      `Floor Area:         ${sqft} ft²`,
      `Heating Load:       ${Number(heatingW).toLocaleString()} W`,
      `Cooling Load:       ${Number(coolingW).toLocaleString()} W`,
      `Range / Cooktop:    ${Number(rangeW).toLocaleString()} W`,
      `Dryer:              ${Number(dryerW).toLocaleString()} W`,
      `Water Heater:       ${Number(waterHeaterW).toLocaleString()} W`,
      `EV Charger:         ${Number(evW).toLocaleString()} W`,
      ``,
      isAtCapacity
        ? `Note: Panel at/over capacity. May qualify for CleanBC ESU rebate (up to $5,000). HPCN contractor required for rebate eligibility.`
        : `Note: Panel PASS — homeowner wants record of preliminary feasibility results.`,
      ``,
      `Submitted: ${new Date().toISOString()}`,
    ].join('\n');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Canadian Heat Pump Hub <noreply@canadianheatpumphub.ca>',
        to: [toEmail],
        subject,
        text: emailText,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[AuditLead] Resend error:', err);
      return NextResponse.json(
        { success: false, error: 'Email delivery failed' },
        { status: 500 },
      );
    }
  }

  // If env vars not set: submission still succeeds (data is in server logs)
  return NextResponse.json({ success: true });
}
