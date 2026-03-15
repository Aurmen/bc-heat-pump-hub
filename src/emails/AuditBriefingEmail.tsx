import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Section,
  Row,
  Column,
  Text,
  Hr,
  Link,
} from '@react-email/components';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuditBriefingEmailProps {
  email: string;
  postalCode: string;
  resultStatus: 'PASS' | 'WARN' | 'FAIL';
  panelAmps: number;
  totalAmps: number;
  utilization: number;
  hasEV: boolean;
  loadManagement: boolean;
  consented: boolean;
  sqft: number;
  heatingW: number;
  coolingW: number;
  rangeW: number;
  dryerW: number;
  waterHeaterW: number;
  evW: number;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS = {
  PASS: {
    label: 'PASS',
    color: '#166534',
    bg: '#f0fdf4',
    border: '#86efac',
    message:
      'Your current electrical infrastructure aligns with the proposed mechanical loads for Phase 0 planning. This panel supports the requested heat pump and EV charging load combination within CEC 8-200 Optional Method parameters. Proceed with equipment selection and contractor engagement.',
  },
  WARN: {
    label: 'WARN — Near Capacity',
    color: '#92400e',
    bg: '#fffbeb',
    border: '#fcd34d',
    message:
      'Your calculated demand falls between the 80% continuous limit and your service rating. While technically within code, this leaves no headroom for additional circuits or future loads. A licensed electrical contractor should review your service before final equipment procurement.',
  },
  FAIL: {
    label: 'FAIL — Service Upgrade Required',
    color: '#991b1b',
    bg: '#fef2f2',
    border: '#fca5a5',
    message:
      'Your results indicate a service capacity gap. You likely qualify for the $5,000 CleanBC Electrical Service Upgrade (ESU) rebate. This rebate stacks with heat pump equipment incentives and requires installation by an HPCN-certified contractor. Visit betterhomesbc.ca for current program terms and eligibility.',
  },
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const font =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

const labelStyle: React.CSSProperties = {
  fontFamily: font,
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: '#64748b',
  margin: '0 0 8px 0',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AuditBriefingEmail({
  email,
  postalCode,
  resultStatus,
  panelAmps,
  totalAmps,
  utilization,
  hasEV,
  loadManagement,
  consented,
  sqft,
  heatingW,
  coolingW,
  rangeW,
  dryerW,
  waterHeaterW,
  evW,
}: AuditBriefingEmailProps) {
  const s = STATUS[resultStatus];
  const year = new Date().getFullYear();

  const inputRows: [string, string][] = [
    ['Floor Area', `${Number(sqft).toLocaleString()} ft²`],
    ['Heating Load (HVAC / heat strip)', `${Number(heatingW).toLocaleString()} W`],
    ['Cooling Load (AC / ASHP cooling)', `${Number(coolingW).toLocaleString()} W`],
    ['Range / Cooktop', `${Number(rangeW).toLocaleString()} W`],
    ['Clothes Dryer', `${Number(dryerW).toLocaleString()} W`],
    ['Water Heater', `${Number(waterHeaterW).toLocaleString()} W`],
    ['EV Charger', hasEV ? `${Number(evW).toLocaleString()} W` : 'None'],
    ['Load Management (DCC-10)', loadManagement ? 'Enabled' : 'Not enabled'],
  ];

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {`CEC 8-200 Baseline Demand Analysis — ${resultStatus} — ${Number(totalAmps).toFixed(1)}A on ${panelAmps}A service`}
      </Preview>
      <Body
        style={{
          backgroundColor: '#f1f5f9',
          fontFamily: font,
          margin: 0,
          padding: '40px 0',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* ── Header ── */}
          <Section style={{ backgroundColor: '#0f172a', padding: '24px 32px' }}>
            <Text
              style={{
                fontFamily: font,
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                margin: '0 0 4px 0',
                letterSpacing: '0.5px',
              }}
            >
              CANADIAN HEAT PUMP HUB
            </Text>
            <Text
              style={{
                fontFamily: font,
                color: '#94a3b8',
                fontSize: '12px',
                margin: 0,
                letterSpacing: '0.3px',
              }}
            >
              canadianheatpumphub.ca
            </Text>
          </Section>

          {/* ── Title block ── */}
          <Section style={{ padding: '28px 32px 20px' }}>
            <Text style={labelStyle}>Preliminary Feasibility Briefing</Text>
            <Text
              style={{
                fontFamily: font,
                color: '#0f172a',
                fontSize: '22px',
                fontWeight: 800,
                margin: '0 0 6px 0',
                lineHeight: '1.2',
              }}
            >
              Baseline Demand Analysis
            </Text>
            <Text
              style={{
                fontFamily: font,
                color: '#64748b',
                fontSize: '13px',
                margin: 0,
              }}
            >
              CEC Rule 8-200 Optional Method
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e2e8f0', margin: '0 32px' }} />

          {/* ── Status badge ── */}
          <Section style={{ padding: '24px 32px 16px' }}>
            <Text style={labelStyle}>Panel Load Result</Text>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: s.bg,
                border: `1.5px solid ${s.border}`,
                borderRadius: '6px',
                padding: '8px 16px',
              }}
            >
              <Text
                style={{
                  fontFamily: font,
                  color: s.color,
                  fontSize: '13px',
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '0.5px',
                }}
              >
                {s.label}
              </Text>
            </div>
          </Section>

          {/* ── Key metrics: 2-column ── */}
          <Section style={{ padding: '0 32px 24px' }}>
            <Row
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <Column
                style={{
                  padding: '18px 20px',
                  borderRight: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  width: '50%',
                }}
              >
                <Text style={labelStyle}>Calculated Demand</Text>
                <Text
                  style={{
                    fontFamily: font,
                    color: '#0f172a',
                    fontSize: '36px',
                    fontWeight: 800,
                    margin: '0',
                    lineHeight: '1',
                    letterSpacing: '-1px',
                  }}
                >
                  {Number(totalAmps).toFixed(1)}
                </Text>
                <Text
                  style={{
                    fontFamily: font,
                    color: '#64748b',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                  }}
                >
                  Amperes (A)
                </Text>
              </Column>
              <Column
                style={{
                  padding: '18px 20px',
                  backgroundColor: '#f8fafc',
                  width: '50%',
                }}
              >
                <Text style={labelStyle}>Service Rating</Text>
                <Text
                  style={{
                    fontFamily: font,
                    color: '#0f172a',
                    fontSize: '36px',
                    fontWeight: 800,
                    margin: '0',
                    lineHeight: '1',
                    letterSpacing: '-1px',
                  }}
                >
                  {String(panelAmps)}
                </Text>
                <Text
                  style={{
                    fontFamily: font,
                    color: '#64748b',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                  }}
                >
                  Amperes (A)
                </Text>
              </Column>
            </Row>
            <Text
              style={{
                fontFamily: font,
                color: '#475569',
                fontSize: '13px',
                margin: '12px 0 0 0',
                textAlign: 'center',
              }}
            >
              Calculated Load:{' '}
              <strong style={{ color: utilization > 100 ? '#991b1b' : '#0f172a' }}>
                {Number(utilization).toFixed(0)}% of capacity
              </strong>
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e2e8f0', margin: '0 32px' }} />

          {/* ── Status message ── */}
          <Section style={{ padding: '24px 32px' }}>
            <Text
              style={{
                fontFamily: font,
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.7',
                margin: 0,
              }}
            >
              {s.message}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e2e8f0', margin: '0 32px' }} />

          {/* ── Appliance inputs table ── */}
          <Section style={{ padding: '24px 32px' }}>
            <Text style={labelStyle}>Appliance Load Inputs</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {inputRows.map(([label, value], i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <td
                      style={{
                        fontFamily: font,
                        padding: '8px 0',
                        color: '#64748b',
                        fontSize: '13px',
                        width: '65%',
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        fontFamily: font,
                        padding: '8px 0',
                        color: '#0f172a',
                        fontSize: '13px',
                        fontWeight: 600,
                        textAlign: 'right',
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Hr style={{ borderColor: '#e2e8f0', margin: '0 32px' }} />

          {/* ── Next steps CTA ── */}
          <Section style={{ padding: '24px 32px', backgroundColor: '#f8fafc' }}>
            <Text
              style={{
                fontFamily: font,
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.7',
                margin: 0,
              }}
            >
              Share this briefing with your licensed heat pump installer or electrical contractor
              before committing to equipment. For HPCN-certified contractors in your area, visit the{' '}
              <Link
                href="https://canadianheatpumphub.ca/directory"
                style={{ color: '#2563eb', textDecoration: 'underline' }}
              >
                Canadian Heat Pump Hub directory
              </Link>
              .
            </Text>
          </Section>

          {/* ── Liability footer ── */}
          <Section
            style={{
              padding: '20px 32px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Text
              style={{
                fontFamily: font,
                color: '#9ca3af',
                fontSize: '10px',
                lineHeight: '1.7',
                margin: '0 0 8px 0',
              }}
            >
              This briefing is an automated mathematical model provided by the Canadian Heat Pump
              Hub. It is intended for preliminary scoping and informational purposes only. This
              document does not constitute a professional engineering opinion, a Field Safety
              Representative (FSR) declaration, or a final electrical permit. All calculations must
              be verified on-site by a licensed electrical contractor prior to equipment procurement
              or installation.
            </Text>
            <Text
              style={{
                fontFamily: font,
                color: '#d1d5db',
                fontSize: '10px',
                margin: 0,
              }}
            >
              © {String(year)} Canadian Heat Pump Hub — canadianheatpumphub.ca
              {' · '}
              Sent to {email} · Postal code: {postalCode}
              {consented ? ' · Contractor referral: Requested' : ''}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
