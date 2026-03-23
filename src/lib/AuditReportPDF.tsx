/**
 * AuditReportPDF.tsx
 *
 * Server-side React-PDF document for the Ghost Load™ Mechanical &
 * Thermal Compliance Report.  Import only from server code — this file
 * must never be included in a client bundle.
 *
 * Rendered via @react-pdf/renderer → renderToBuffer() in the
 * /api/audit-pdf route.
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { AuditInputs, AuditResult } from './audit-engine';

// ── Fonts ─────────────────────────────────────────────────────────────────────
// react-pdf bundles Helvetica by default; we use it as our system-safe font.
// No font registration needed — Helvetica / Helvetica-Bold are always available.

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  ink:     '#111827', // gray-900
  muted:   '#6b7280', // gray-500
  light:   '#9ca3af', // gray-400
  border:  '#e5e7eb', // gray-200
  surface: '#f9fafb', // gray-50
  white:   '#ffffff',

  primary:      '#1e40af',  // blue-800
  primaryLight: '#dbeafe',  // blue-100

  passInk:   '#166534',  passLight: '#dcfce7',
  warnInk:   '#92400e',  warnLight: '#fef3c7',
  failInk:   '#991b1b',  failLight: '#fee2e2',

  amber: '#b45309',  // amber-700  (ghost-load callout)
} as const;

function statusPalette(s: 'PASS' | 'WARN' | 'FAIL') {
  return {
    PASS: { ink: C.passInk, bg: C.passLight },
    WARN: { ink: C.warnInk, bg: C.warnLight },
    FAIL: { ink: C.failInk, bg: C.failLight },
  }[s];
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.ink,
    backgroundColor: C.white,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },

  // ─ Header ─
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
  },
  brand: { fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  reportTitle: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.primary, marginTop: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontFamily: 'Helvetica-Bold', fontSize: 11 },

  // ─ Meta row ─
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 18,
    padding: 10,
    backgroundColor: C.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaLabel: { fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  metaValue: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.ink },

  // ─ Section ─
  sectionHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: C.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  // ─ Table ─
  table: { borderWidth: 1, borderColor: C.border, borderRadius: 3 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowFloor: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: C.surface,
  },
  tableRowTotal: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: C.primaryLight,
    borderTopWidth: 2,
    borderTopColor: C.primary,
  },
  thCategory: { width: '32%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thNameplate: { width: '18%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thRule: { width: '26%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thDemand: { width: '24%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted, textAlign: 'right' },

  tdCategory: { width: '32%', fontSize: 8, color: C.ink },
  tdNameplate: { width: '18%', fontSize: 8, color: C.muted },
  tdRule: { width: '26%', fontSize: 8, color: C.muted, fontFamily: 'Helvetica-Oblique' },
  tdDemand: { width: '24%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.ink, textAlign: 'right' },
  tdDemandGreen: { width: '24%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.passInk, textAlign: 'right' },
  tdDemandTotalLabel: { width: '76%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary },
  tdDemandTotalValue: { width: '24%', fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },

  // ─ Finding box ─
  findingBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  findingTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 4 },
  findingBody: { fontSize: 8.5, color: C.ink, lineHeight: 1.5 },

  // ─ Compliance summary row ─
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  summaryValue: { fontFamily: 'Helvetica-Bold', fontSize: 12 },
  summaryUnit: { fontSize: 8, color: C.muted },

  // ─ Disclaimer ─
  disclaimerBox: {
    marginTop: 16,
    padding: 10,
    backgroundColor: C.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  disclaimerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.ink, marginBottom: 4 },
  disclaimerText: { fontSize: 7, color: C.muted, lineHeight: 1.55 },
  disclaimerBold: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: C.ink },

  // ─ Footer ─
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: C.light },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fW(w: number): string {
  return w === 0 ? '0 W' : `${w.toLocaleString()} W`;
}
function fA(a: number, decimals = 1): string {
  return `${a.toFixed(decimals)} A`;
}
function demandRuleLabel(hasRange: boolean, nameplate: number): string {
  if (hasRange && nameplate > 1500) return '25% of nameplate';
  return '100% of nameplate';
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AuditReportData {
  reportId: string;
  generatedAt: string;   // ISO date string
  inputs: AuditInputs;
  result: AuditResult;
}

// ── Document ──────────────────────────────────────────────────────────────────

export function AuditReportDocument({ reportId, generatedAt, inputs, result }: AuditReportData) {
  const pal = statusPalette(result.status);
  const hasRange = inputs.rangeW > 0;
  const headroom = result.serviceAmps - result.totalAmps; // + = headroom, – = deficit
  const disclaimerSectionNum = result.thermal ? 4 : 3;
  const dateStr = new Date(generatedAt).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const findingsText = (() => {
    if (result.status === 'PASS') {
      return (
        `Based on the CEC Rule 8-200 Optional Method calculation, the existing ` +
        `${result.serviceAmps} A service is compliant. The calculated demand of ` +
        `${fA(result.totalAmps)} represents ${result.utilization.toFixed(0)}% of the ` +
        `service rating, leaving ${fA(Math.abs(headroom))} of headroom below the ` +
        `service rating. The installation of a heat pump and associated loads ` +
        `is electrically feasible without a service upgrade under current load conditions.`
      );
    }
    if (result.status === 'WARN') {
      return (
        `The calculated demand of ${fA(result.totalAmps)} (${result.utilization.toFixed(0)}% ` +
        `of service) falls between the 80% continuous load limit (${fA(result.continuousLimit)}) ` +
        `and the ${result.serviceAmps} A service rating. The installation is technically ` +
        `within code limits but leaves no practical margin for additional circuits or ` +
        `simultaneous cold-snap peak loads. A load management strategy or service ` +
        `evaluation is recommended before commissioning additional high-draw equipment.`
      );
    }
    // FAIL
    const deficit = Math.abs(headroom);
    const evNote = inputs.loadManagement
      ? ` An approved EVEMS device (Rule 8-106(11)) would remove the ` +
        `${fW(inputs.evW)} EV supply from the calculated load, potentially ` +
        `eliminating the service deficit.`
      : '';
    return (
      `The calculated demand of ${fA(result.totalAmps)} exceeds the ` +
      `${result.serviceAmps} A service rating by ${fA(deficit)}. ` +
      `If the heat pump, EV charger, and auxiliary loads trigger simultaneously ` +
      `during a cold-snap event, the main service breaker is at risk of a thermal ` +
      `trip — a non-compliant installation under the CEC.` +
      evNote +
      ` A 200 A service upgrade or engineered load-management solution is required ` +
      `before proceeding with this load combination.`
    );
  })();

  return (
    <Document
      title={`Ghost Load Audit — ${reportId}`}
      author="Aelric Technologies"
      subject="CEC Rule 8-200 Mechanical & Thermal Compliance Report"
      creator="canadianheatpumphub.ca"
      producer="Ghost Load Auditor v2026"
      keywords="CEC 8-200, heat pump, electrical service, BC, panel audit"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Aelric Technologies · canadianheatpumphub.ca</Text>
            <Text style={s.reportTitle}>Mechanical &amp; Thermal Compliance Report</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: pal.bg }]}>
            <Text style={[s.statusText, { color: pal.ink }]}>{result.status}</Text>
          </View>
        </View>

        {/* ── Meta row ── */}
        <View style={s.metaRow}>
          <View>
            <Text style={s.metaLabel}>Project ID</Text>
            <Text style={s.metaValue}>{reportId}</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>Date</Text>
            <Text style={s.metaValue}>{dateStr}</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>Code Reference</Text>
            <Text style={s.metaValue}>CSA C22.1:24 (CEC 26th Ed.) — Rule 8-200</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>Property Area</Text>
            <Text style={s.metaValue}>{inputs.sqft.toLocaleString()} ft² ({result.sqm.toFixed(1)} m²)</Text>
          </View>
        </View>

        {/* ── Section 1 ── */}
        <Text style={s.sectionHeader}>1.  Infrastructure Reality — Electrical Service Audit</Text>

        <View style={s.table}>
          {/* Table header */}
          <View style={s.tableHead}>
            <Text style={s.thCategory}>Assessment Category</Text>
            <Text style={s.thNameplate}>Nameplate</Text>
            <Text style={s.thRule}>CEC Demand Factor</Text>
            <Text style={s.thDemand}>Calculated Demand</Text>
          </View>

          {/* Basic Load */}
          <View style={s.tableRow}>
            <Text style={s.tdCategory}>Basic Load</Text>
            <Text style={s.tdNameplate}>{result.sqm.toFixed(1)} m²</Text>
            <Text style={s.tdRule}>Rule 8-200(1)(a)(i)+(ii)</Text>
            <Text style={s.tdDemand}>{fW(result.basicLoadW)}</Text>
          </View>

          {/* Range */}
          <View style={s.tableRow}>
            <Text style={s.tdCategory}>Electric Range / Cooktop</Text>
            <Text style={s.tdNameplate}>{fW(inputs.rangeW)}</Text>
            <Text style={s.tdRule}>
              {inputs.rangeW > 0
                ? `6,000 W base + 40% above 12 kW [8-200(1)(a)(iv)]`
                : 'N/A — no range'}
            </Text>
            <Text style={s.tdDemand}>{fW(result.rangeApplied)}</Text>
          </View>

          {/* Dryer */}
          <View style={s.tableRow}>
            <Text style={s.tdCategory}>Clothes Dryer</Text>
            <Text style={s.tdNameplate}>{fW(inputs.dryerW)}</Text>
            <Text style={s.tdRule}>
              {hasRange && inputs.dryerW > 1500
                ? '25% (range present) [8-200(1)(a)(vii)(A)]'
                : '100% nameplate [8-200(1)(a)(vii)(A)]'}
            </Text>
            <Text style={s.tdDemand}>{fW(result.dryerApplied)}</Text>
          </View>

          {/* Water Heater */}
          <View style={s.tableRow}>
            <Text style={s.tdCategory}>Water Heater (tank / HPWH)</Text>
            <Text style={s.tdNameplate}>{fW(inputs.waterHeaterW)}</Text>
            <Text style={s.tdRule}>
              {hasRange && inputs.waterHeaterW > 1500
                ? '25% (range present) [8-200(1)(a)(vii)(A)]'
                : '100% nameplate [8-200(1)(a)(vii)(A)]'}
            </Text>
            <Text style={s.tdDemand}>{fW(result.waterHeaterApplied)}</Text>
          </View>

          {/* MUA */}
          <View style={s.tableRow}>
            <Text style={s.tdCategory}>Ghost Load — MUA Heater</Text>
            <Text style={s.tdNameplate}>{fW(inputs.muaW)}</Text>
            <Text style={s.tdRule}>
              {inputs.muaW === 0
                ? 'N/A — not present'
                : hasRange && inputs.muaW > 1500
                  ? '25% (range present) [8-200(1)(a)(vii)(A)]'
                  : '100% nameplate [8-200(1)(a)(vii)(A)]'}
            </Text>
            <Text style={s.tdDemand}>{fW(result.muaApplied)}</Text>
          </View>

          {/* Space Heating */}
          <View style={s.tableRow}>
            <Text style={s.tdCategory}>Space Heating — ASHP</Text>
            <Text style={s.tdNameplate}>{fW(inputs.heatingW)}</Text>
            <Text style={s.tdRule}>
              {inputs.heatingW <= 10000
                ? '100% [Rule 62-118(3)]'
                : '100% / 10 kW + 75% balance [62-118(3)]'}
            </Text>
            <Text style={s.tdDemand}>{fW(result.heatingDemand)}</Text>
          </View>

          {/* Cooling — shown as excluded if heating is the interlock winner */}
          <View style={s.tableRow}>
            <Text style={s.tdCategory}>Cooling / AC</Text>
            <Text style={s.tdNameplate}>{fW(inputs.coolingW)}</Text>
            <Text style={s.tdRule}>
              {result.hvacIsHeating
                ? 'Excluded — heating &gt; cooling [8-106(3)]'
                : '100% — cooling &gt; heating [8-106(3)]'}
            </Text>
            <Text style={result.hvacIsHeating ? s.tdDemandGreen : s.tdDemand}>
              {result.hvacIsHeating ? '0 W' : fW(result.hvacW)}
            </Text>
          </View>

          {/* EV */}
          <View style={s.tableRow}>
            <Text style={s.tdCategory}>EV Supply Equipment (EVSE)</Text>
            <Text style={s.tdNameplate}>{fW(inputs.evW)}</Text>
            <Text style={s.tdRule}>
              {inputs.loadManagement
                ? 'Excluded — EVEMS present [8-106(11)]'
                : inputs.evW === 0
                  ? 'N/A — not present'
                  : '100% nameplate [8-200(1)(a)(vi)]'}
            </Text>
            <Text style={inputs.loadManagement && inputs.evW > 0 ? s.tdDemandGreen : s.tdDemand}>
              {fW(result.evApplied)}
            </Text>
          </View>

          {/* Minimum demand floor */}
          <View style={s.tableRowFloor}>
            <Text style={s.tdCategory}>MINIMUM DEMAND FLOOR</Text>
            <Text style={s.tdNameplate}>N/A</Text>
            <Text style={s.tdRule}>
              {result.sqm >= 80 ? '≥ 80 m²' : '< 80 m²'} [Rule 8-200(1)(b)]
            </Text>
            <Text style={s.tdDemand}>{fW(result.minDemandW)}</Text>
          </View>

          {/* Grand total row */}
          <View style={s.tableRowTotal}>
            <Text style={s.tdDemandTotalLabel}>
              Total Calculated Peak Demand (applied) @ 240 V
            </Text>
            <Text style={s.tdDemandTotalValue}>{fA(result.totalAmps)}</Text>
          </View>
        </View>

        {/* Compliance summary */}
        <View style={[s.summaryRow, { borderColor: pal.bg, backgroundColor: pal.bg }]}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Total load</Text>
            <Text style={[s.summaryValue, { color: pal.ink }]}>{result.totalW.toLocaleString()} W</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Service rating</Text>
            <Text style={[s.summaryValue, { color: C.ink }]}>{result.serviceAmps} A</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>80% continuous limit</Text>
            <Text style={[s.summaryValue, { color: C.ink }]}>{result.continuousLimit.toFixed(0)} A</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Utilization</Text>
            <Text style={[s.summaryValue, { color: pal.ink }]}>{result.utilization.toFixed(0)}%</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>{headroom >= 0 ? 'Headroom' : 'Deficit'}</Text>
            <Text style={[s.summaryValue, { color: pal.ink }]}>{fA(Math.abs(headroom))}</Text>
          </View>
        </View>

        {/* ── Section 2 ── */}
        <Text style={s.sectionHeader}>2.  Audit Findings &amp; Infrastructure Assessment</Text>

        <View style={[s.findingBox, { borderColor: pal.bg, backgroundColor: pal.bg }]}>
          <Text style={[s.findingTitle, { color: pal.ink }]}>
            {result.status === 'PASS' && 'Observation: Service is Compliant — No Upgrade Required'}
            {result.status === 'WARN' && 'Observation: Service Near Capacity — Marginal Headroom'}
            {result.status === 'FAIL' && 'Observation: Service is Insufficient — Upgrade or EVEMS Required'}
          </Text>
          <Text style={s.findingBody}>{findingsText}</Text>
        </View>

        {/* ── Section 3 — Thermal Analysis (conditional) ── */}
        {result.thermal && (
          <>
            <Text style={s.sectionHeader}>3.  Thermal Integration &amp; Elevation Audit</Text>

            <View style={s.table}>
              <View style={s.tableHead}>
                <Text style={[s.thCategory, { width: '50%' }]}>Parameter</Text>
                <Text style={[s.thDemand, { width: '25%' }]}>Value</Text>
                <Text style={[s.thRule, { width: '25%' }]}>Reference</Text>
              </View>

              <View style={s.tableRow}>
                <Text style={[s.tdCategory, { width: '50%' }]}>Site Elevation</Text>
                <Text style={[s.tdDemand, { width: '25%' }]}>{result.thermal.elevationM.toLocaleString()} m</Text>
                <Text style={[s.tdRule, { width: '25%' }]}>ASL (user input)</Text>
              </View>

              <View style={s.tableRow}>
                <Text style={[s.tdCategory, { width: '50%' }]}>Atmospheric Pressure (ISA)</Text>
                <Text style={[s.tdDemand, { width: '25%' }]}>{result.thermal.bpKpa.toFixed(2)} kPa</Text>
                <Text style={[s.tdRule, { width: '25%' }]}>ISA hypsometric</Text>
              </View>

              <View style={s.tableRow}>
                <Text style={[s.tdCategory, { width: '50%' }]}>Air Density Constant (corrected)</Text>
                <Text style={[s.tdDemand, { width: '25%' }]}>{result.thermal.correctedHeatConstant.toFixed(3)}</Text>
                <Text style={[s.tdRule, { width: '25%' }]}>1.08 × (BP / 101.325)</Text>
              </View>

              <View style={s.tableRow}>
                <Text style={[s.tdCategory, { width: '50%' }]}>Gas Appliance Derate Factor</Text>
                <Text style={[s.tdDemand, { width: '25%' }]}>{result.thermal.derateFactor.toFixed(3)}</Text>
                <Text style={[s.tdRule, { width: '25%' }]}>CSA B149.1 Cl. 8.22.1</Text>
              </View>

              {result.thermal.gasNameplateBtu > 0 && (
                <>
                  <View style={s.tableRow}>
                    <Text style={[s.tdCategory, { width: '50%' }]}>Gas Furnace — Nameplate</Text>
                    <Text style={[s.tdDemand, { width: '25%' }]}>{result.thermal.gasNameplateBtu.toLocaleString()} BTU/h</Text>
                    <Text style={[s.tdRule, { width: '25%' }]}>Manufacturer rating</Text>
                  </View>

                  <View style={s.tableRow}>
                    <Text style={[s.tdCategory, { width: '50%' }]}>Gas Furnace — Effective (derated)</Text>
                    <Text style={[s.tdDemand, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{result.thermal.effectiveBtu.toLocaleString()} BTU/h</Text>
                    <Text style={[s.tdRule, { width: '25%' }]}>Nameplate × derate</Text>
                  </View>

                  <View style={s.tableRow}>
                    <Text style={[s.tdCategory, { width: '50%' }]}>Furnace AFUE</Text>
                    <Text style={[s.tdDemand, { width: '25%' }]}>{(result.thermal.furnaceAfue * 100).toFixed(0)}%</Text>
                    <Text style={[s.tdRule, { width: '25%' }]}>User input</Text>
                  </View>
                </>
              )}

              {result.thermal.copCrossover > 0 && (
                <>
                  <View style={s.tableRow}>
                    <Text style={[s.tdCategory, { width: '50%' }]}>Electricity Rate</Text>
                    <Text style={[s.tdDemand, { width: '25%' }]}>${result.thermal.elecRatePerKwh.toFixed(4)}/kWh</Text>
                    <Text style={[s.tdRule, { width: '25%' }]}>User input</Text>
                  </View>

                  <View style={s.tableRow}>
                    <Text style={[s.tdCategory, { width: '50%' }]}>Gas Rate</Text>
                    <Text style={[s.tdDemand, { width: '25%' }]}>${result.thermal.gasRatePerGj.toFixed(2)}/GJ</Text>
                    <Text style={[s.tdRule, { width: '25%' }]}>User input</Text>
                  </View>

                  <View style={s.tableRowTotal}>
                    <Text style={[s.tdDemandTotalLabel, { width: '50%' }]}>
                      Economic Crossover COP
                    </Text>
                    <Text style={[s.tdDemandTotalValue, { width: '25%' }]}>
                      {result.thermal.copCrossover.toFixed(2)}
                    </Text>
                    <Text style={[s.tdRule, { width: '25%' }]}>(elec × AFUE × 277.78) / gas</Text>
                  </View>
                </>
              )}

              <View style={s.tableRowFloor}>
                <Text style={[s.tdCategory, { width: '50%' }]}>Target Switchover Temperature</Text>
                <Text style={[s.tdDemand, { width: '25%' }]}>{result.thermal.balancePoint}°C</Text>
                <Text style={[s.tdRule, { width: '25%' }]}>FortisBC / CleanBC</Text>
              </View>
            </View>

            {result.thermal.copCrossover > 0 && (
              <View style={[s.findingBox, { borderColor: C.warnLight, backgroundColor: C.warnLight }]}>
                <Text style={[s.findingTitle, { color: C.warnInk }]}>
                  Economic Crossover Interpretation
                </Text>
                <Text style={s.findingBody}>
                  When the outdoor temperature drops the heat pump COP below{' '}
                  {result.thermal.copCrossover.toFixed(1)}, the gas furnace delivers heat at a lower
                  cost per unit of energy. Above this COP, the heat pump is more economical. For a
                  typical cold-climate ASHP in BC Interior conditions, this crossover occurs between
                  approximately -10°C and -15°C depending on the specific unit's published COP curve.
                  The balance point of {result.thermal.balancePoint}°C is the intended switchover
                  temperature for this installation, consistent with FortisBC/CleanBC dual-fuel guidelines.
                </Text>
              </View>
            )}
          </>
        )}

        {/* ── Disclaimer section (renumbered when thermal is present) ── */}
        <Text style={s.sectionHeader}>{disclaimerSectionNum}.  Audit Compliance &amp; Technical Disclaimer</Text>

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerTitle}>Revision: 2026.03.15.SEC-5  |  Method: CEC Rule 8-200 Optional Method (26th Ed.)</Text>
          <Text style={[s.disclaimerText, { marginBottom: 4 }]}>
            <Text style={s.disclaimerBold}>1. Scope of Audit: </Text>
            This document provides a thermal and mechanical load analysis based on the demand
            factors specified in the Canadian Electrical Code (CSA C22.1:24, 26th Edition).
            Calculations use the Rule 8-200 Optional Method for single-dwelling services and
            feeders. Space heating demand factors follow Rule 62-118(3). This is a technical
            feasibility audit only — it is not a design specification or permit drawing.
          </Text>
          <Text style={[s.disclaimerText, { marginBottom: 4 }]}>
            <Text style={s.disclaimerBold}>2. Non-Advisory Status: </Text>
            The provider of this report acts strictly as an Objective Auditor. This document does
            not constitute professional engineering advice, electrical consulting, or a
            prescription for installation. All findings must be verified by a registered Field
            Safety Representative (FSR) or a Professional Engineer (P.Eng) before any permit
            application or work commences.
          </Text>
          <Text style={[s.disclaimerText, { marginBottom: 4 }]}>
            <Text style={s.disclaimerBold}>3. Liability Limitation: </Text>
            This inquiry is a request for information. Final technical verification and site
            visits are required by a licensed contractor. Aelric Technologies assumes no
            liability for system failures, property damage, or permit decisions arising from
            reliance on this document without professional verification.
          </Text>
          <Text style={s.disclaimerText}>
            <Text style={s.disclaimerBold}>4. Data Integrity: </Text>
            This report was generated by a secured server-side calculation engine (CEC Rule 8-200,
            26th Ed.). All demand factors are computed server-side from raw inputs. Tampering
            with this report voids the verification ID. Report ID: {reportId}.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            © 2026 Ghost Load™ Technical Audits · Aelric Technologies
          </Text>
          <Text style={s.footerText}>
            {reportId} · CEC CSA C22.1:24 Rule 8-200
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
}
