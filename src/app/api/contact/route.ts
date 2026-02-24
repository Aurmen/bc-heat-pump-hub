import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, city, projectType, technicalSummary } = body;

  // Audit log — always fires, regardless of email config
  console.log('[LeadCapture]', {
    timestamp: new Date().toISOString(),
    name,
    email,
    city,
    projectType,
    technicalSummary: technicalSummary?.slice(0, 120),
  });

  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_EMAIL;

  if (resendKey && toEmail) {
    const emailText = [
      `New lead from Canadian Heat Pump Hub`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      `City: ${city}`,
      `Project Type: ${projectType}`,
      ``,
      `Technical Summary:`,
      technicalSummary || '(none)',
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
        subject: `New Lead — ${projectType} — ${city}`,
        text: emailText,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[LeadCapture] Resend error:', err);
      return NextResponse.json({ success: false, error: 'Email delivery failed' }, { status: 500 });
    }
  }

  // If env vars not set: submission still succeeds (data is in server logs)
  return NextResponse.json({ success: true });
}
