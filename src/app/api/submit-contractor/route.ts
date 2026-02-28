import { NextRequest, NextResponse } from 'next/server';

const SERVICE_LABELS: Record<string, string> = {
  heat_pumps:   'Heat Pumps',
  air_to_water: 'Air-to-Water',
  boilers:      'Boilers',
  hybrid:       'Hybrid Systems',
};

export async function POST(req: NextRequest) {
  const API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!API_KEY || !BASE_ID) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Map form fields → Airtable fields
  const services = Array.isArray(body.services)
    ? (body.services as string[]).map(s => SERVICE_LABELS[s]).filter(Boolean)
    : [];

  const fields: Record<string, unknown> = {
    'Company Name': body.company_name,
    'Phone':        body.phone,
    'Website':      body.website,
    'City':         body.city,
    'Contact Name': body.contact_name,
    'Email':        body.email,
    'Address':      body.address,
    'Service Area': body.service_areas,
    'Admin Notes':  body.notes,
    'Year Experience': body.years_experience ? Number(body.years_experience) : undefined,
    'Status':       'Pending Review',
  };

  if (body.region) {
    fields['Lower Mainland, Vancouver Island, Interior, Northern BC'] = body.region;
  }
  if (services.length) {
    fields['Heat Pumps, Air-to-Water, Boilers, Hybrid Systems, Ground Source, Pool Heating, Snow Melt'] = services;
  }
  if (body.emergency_service && body.emergency_service !== '') {
    fields['Emergency Service'] = body.emergency_service === 'yes' ? 'Yes' : 'No';
  }
  if (body.brands_supported) {
    fields['Brand Support'] = body.brands_supported;
  }
  if (body.fsr_license)        fields['FSR License']        = body.fsr_license;
  if (body.gas_fitter_license) fields['Gas Fitter License'] = body.gas_fitter_license;
  if (body.electrical_license) fields['Electrical License'] = body.electrical_license;
  if (body.hpcn_certified)     fields['HPCN Certified']     = body.hpcn_certified === 'yes' ? 'Yes' : 'No';

  // Remove undefined values
  Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k]);

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/Submissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Airtable error:', err);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
