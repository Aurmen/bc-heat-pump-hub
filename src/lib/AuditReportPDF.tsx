/**
 * AuditReportPDF.tsx
 *
 * Server-side React-PDF document for the Ghost Load™ Mechanical &
 * Thermal Compliance Report.  Import only from server code — this file
 * must never be included in a client bundle.
 *
 * Rendered via @react-pdf/renderer -> renderToBuffer() in the
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
import type { AuditInputs, AuditResult, HvacOption } from './audit-engine';

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

  // - Header -
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

  // - Meta row -
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
    padding: 10,
    backgroundColor: C.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaLabel: { fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  metaValue: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.ink },

  // - Input summary -
  inputsBox: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: C.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  inputsTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.primary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  inputsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  inputsItem: { width: '50%', marginBottom: 3 },
  inputsLabel: { fontSize: 7.5, color: C.muted },
  inputsValue: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.ink },
  inputsDisclaimer: { fontSize: 6.5, color: C.light, marginTop: 6, lineHeight: 1.4 },

  // - Section -
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

  // - Table -
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
  // 5-column layout: Category | Nameplate | Calculation | Rule | Demand
  thCategory:    { width: '24%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thNameplate:   { width: '14%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thCalc:        { width: '24%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thRule:        { width: '20%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thDemand:      { width: '18%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted, textAlign: 'right' },

  tdCategory:    { width: '24%', fontSize: 8, color: C.ink },
  tdNameplate:   { width: '14%', fontSize: 8, color: C.muted },
  tdCalc:        { width: '24%', fontSize: 7.5, color: C.muted, fontFamily: 'Helvetica-Oblique' },
  tdRule:        { width: '20%', fontSize: 7.5, color: C.muted, fontFamily: 'Helvetica-Oblique' },
  tdDemand:      { width: '18%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.ink, textAlign: 'right' },
  tdDemandGreen: { width: '18%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.passInk, textAlign: 'right' },
  tdDemandTotalLabel: { width: '82%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary },
  tdDemandTotalValue: { width: '18%', fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },

  // - HVAC option row -
  hvacOptionRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  hvacOptionSelected: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: C.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: C.primary,
  },
  hvacLabel:    { width: '30%', fontSize: 8, color: C.ink },
  hvacRule:     { width: '40%', fontSize: 7.5, color: C.muted, fontFamily: 'Helvetica-Oblique' },
  hvacDemand:   { width: '18%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.ink, textAlign: 'right' },
  hvacMarker:   { width: '12%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },

  // - Finding box -
  findingBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  findingTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 4 },
  findingBody: { fontSize: 8.5, color: C.ink, lineHeight: 1.5 },

  // - Compliance summary row -
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

  // - Disclaimer -
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

  // - Notes section -
  notesTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.muted, marginBottom: 10 },
  notesLine: { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 18 },

  // - Footer -
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

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AuditReportData {
  reportId: string;
  generatedAt: string;   // ISO date string
  inputs: AuditInputs;
  result: AuditResult;
}

// ── Appliance row builder ─────────────────────────────────────────────────────
// Each appliance that the user entered gets its own row with:
//   - Category label
//   - Raw nameplate wattage
//   - Calculation step (the actual math)
//   - CEC rule reference
//   - Final calculated demand

interface ApplianceRow {
  category: string;
  nameplate: string;
  calcStep: string;
  rule: string;
  demandW: number;
  isDeduction?: boolean;  // green text for excluded/reduced loads
  isExcluded?: boolean;   // gray text for interlocked-out HVAC
}

function buildApplianceRows(inputs: AuditInputs, result: AuditResult): ApplianceRow[] {
  const rows: ApplianceRow[] = [];
  const hasRange = inputs.rangeW > 0;

  // 1. Basic Load -- always present
  rows.push({
    category: 'Basic Load',
    nameplate: `${result.sqm.toFixed(1)} m2`,
    calcStep: result.extraBlocks > 0
      ? `5,000 + ${result.extraBlocks} x 1,000 = ${fW(result.basicLoadW)}`
      : '5,000 W (first 90 m2)',
    rule: '8-200(1)(a)(i)+(ii)',
    demandW: result.basicLoadW,
  });

  // 2. Range -- only if user entered a value
  if (inputs.rangeW > 0) {
    const excessW = Math.max(0, inputs.rangeW - 12000);
    rows.push({
      category: 'Electric Range / Cooktop',
      nameplate: fW(inputs.rangeW),
      calcStep: excessW > 0
        ? `6,000 + 40% x (${fW(inputs.rangeW)} - 12,000) = ${fW(result.rangeApplied)}`
        : `6,000 W base (nameplate <= 12 kW)`,
      rule: '8-200(1)(a)(iv)',
      demandW: result.rangeApplied,
    });
  }

  // 3. Dryer -- only if user entered a value (#7 - show nameplate in calcStep)
  if (inputs.dryerW > 0) {
    const reduced = hasRange && inputs.dryerW > 1500;
    rows.push({
      category: 'Clothes Dryer',
      nameplate: fW(inputs.dryerW),
      calcStep: reduced
        ? `${fW(inputs.dryerW)} x 25% = ${fW(result.dryerApplied)}`
        : `${fW(inputs.dryerW)} x 100%`,
      rule: reduced ? '8-200(1)(a)(vii)(A)' : '8-200(1)(a)(vii)',
      demandW: result.dryerApplied,
    });
    // Show the deduction as a separate line when 25% is applied
    if (reduced) {
      rows.push({
        category: '  Demand factor deduction',
        nameplate: '',
        calcStep: `Range present + nameplate > 1,500 W -- 75% reduction`,
        rule: '8-200(1)(a)(vii)(A)',
        demandW: -(inputs.dryerW - result.dryerApplied),
        isDeduction: true,
      });
    }
  }

  // 4. Water Heater -- only if user entered a value (#7)
  if (inputs.waterHeaterW > 0) {
    const reduced = hasRange && inputs.waterHeaterW > 1500;
    rows.push({
      category: 'Water Heater (tank / HPWH)',
      nameplate: fW(inputs.waterHeaterW),
      calcStep: reduced
        ? `${fW(inputs.waterHeaterW)} x 25% = ${fW(result.waterHeaterApplied)}`
        : `${fW(inputs.waterHeaterW)} x 100%`,
      rule: reduced ? '8-200(1)(a)(vii)(A)' : '8-200(1)(a)(vii)',
      demandW: result.waterHeaterApplied,
    });
    if (reduced) {
      rows.push({
        category: '  Demand factor deduction',
        nameplate: '',
        calcStep: `Range present + nameplate > 1,500 W -- 75% reduction`,
        rule: '8-200(1)(a)(vii)(A)',
        demandW: -(inputs.waterHeaterW - result.waterHeaterApplied),
        isDeduction: true,
      });
    }
  }

  // 5. MUA Heater -- only if user entered a value
  if (inputs.muaW > 0) {
    const reduced = hasRange && inputs.muaW > 1500;
    rows.push({
      category: 'Ghost Load -- MUA Heater',
      nameplate: fW(inputs.muaW),
      calcStep: reduced
        ? `${fW(inputs.muaW)} x 25% = ${fW(result.muaApplied)}`
        : `${fW(inputs.muaW)} x 100%`,
      rule: reduced ? '8-200(1)(a)(vii)(A)' : '8-200(1)(a)(vii)',
      demandW: result.muaApplied,
    });
    if (reduced) {
      rows.push({
        category: '  Demand factor deduction',
        nameplate: '',
        calcStep: `Range present + nameplate > 1,500 W -- 75% reduction`,
        rule: '8-200(1)(a)(vii)(A)',
        demandW: -(inputs.muaW - result.muaApplied),
        isDeduction: true,
      });
    }
  }

  // 6. HVAC (#6 - show both heating AND cooling, mark applied, gray excluded)
  if (inputs.heatingW > 0 || inputs.coolingW > 0) {
    const hasBoth = inputs.heatingW > 0 && inputs.coolingW > 0;

    // Heating demand line
    if (inputs.heatingW > 0) {
      const heatingCalc = inputs.heatingW <= 10000
        ? `${fW(inputs.heatingW)} x 100%`
        : `10,000 + 75% x (${fW(inputs.heatingW)} - 10,000) = ${fW(result.heatingDemand)}`;

      rows.push({
        category: result.hvacIsHeating
          ? 'Heating demand'
          : 'Heating demand (excluded)',
        nameplate: fW(inputs.heatingW),
        calcStep: heatingCalc,
        rule: '62-118(3)',
        demandW: result.hvacIsHeating ? result.heatingDemand : result.heatingDemand,
        isExcluded: hasBoth && !result.hvacIsHeating,
      });
    }

    // Cooling demand line
    if (inputs.coolingW > 0) {
      rows.push({
        category: !result.hvacIsHeating
          ? 'Heat pump / cooling'
          : 'Heat pump / cooling (excluded)',
        nameplate: fW(inputs.coolingW),
        calcStep: `${fW(inputs.coolingW)} x 100%`,
        rule: '8-200(1)(a)(iii)',
        demandW: inputs.coolingW,
        isExcluded: hasBoth && result.hvacIsHeating,
      });
    }

    // Applied marker line
    if (hasBoth) {
      const appliedLabel = result.hvacIsHeating ? 'Heating' : 'Heat pump / cooling';
      rows.push({
        category: `  HVAC applied: ${appliedLabel}`,
        nameplate: '',
        calcStep: `8-106(3): only the larger of heating and cooling is counted`,
        rule: '8-106(3)',
        demandW: result.hvacW,
        isDeduction: false,
      });
    }
  }

  // 7. EV -- only if user entered a value
  if (inputs.evW > 0) {
    rows.push({
      category: 'EV Supply Equipment (EVSE)',
      nameplate: fW(inputs.evW),
      calcStep: inputs.loadManagement
        ? `Excluded -- EVEMS monitors & controls per Rule 8-500`
        : `${fW(inputs.evW)} x 100%`,
      rule: inputs.loadManagement ? '8-106(11)' : '8-200(1)(a)(vi)',
      demandW: result.evApplied,
      isDeduction: inputs.loadManagement,
    });
    if (inputs.loadManagement) {
      rows.push({
        category: '  EVEMS deduction',
        nameplate: '',
        calcStep: `Full EV load of ${fW(inputs.evW)} excluded from calculated load`,
        rule: '8-106(11) + 8-500',
        demandW: -inputs.evW,
        isDeduction: true,
      });
    }
  }

  return rows;
}

// ── Document ──────────────────────────────────────────────────────────────────

export function AuditReportDocument({ reportId, generatedAt, inputs, result }: AuditReportData) {
  const pal = statusPalette(result.status);
  const over80 = result.totalAmps - result.continuousLimit;
  const disclaimerSectionNum = result.thermal ? 5 : 4;
  const notesSectionNum = disclaimerSectionNum + 1;
  const dateStr = new Date(generatedAt).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const applianceRows = buildApplianceRows(inputs, result);
  const selectedHvac = result.hvacOptions.find((o: HvacOption) => o.selected);
  const hvacLetters = ['(1)', '(2)', '(3)', '(4)'];

  const hpReplacesAc = inputs.heatingW > 0 && inputs.coolingW > 0;

  // Build user input lines (#11 - only non-zero fields)
  const inputLines: { label: string; value: string }[] = [];
  inputLines.push({ label: 'Panel rating', value: `${inputs.serviceAmps}A` });
  inputLines.push({ label: 'Home size', value: `${inputs.sqft.toLocaleString()} ft2 (${result.sqm.toFixed(1)} m2)` });
  if (inputs.heatingW > 0) inputLines.push({ label: 'Space heating', value: `${inputs.heatingW.toLocaleString()} W` });
  if (inputs.coolingW > 0) inputLines.push({ label: 'Cooling / AC', value: `${inputs.coolingW.toLocaleString()} W` });
  if (inputs.rangeW > 0) inputLines.push({ label: 'Range / oven', value: `${inputs.rangeW.toLocaleString()} W` });
  if (inputs.dryerW > 0) inputLines.push({ label: 'Clothes dryer', value: `${inputs.dryerW.toLocaleString()} W` });
  if (inputs.waterHeaterW > 0) inputLines.push({ label: 'Water heater', value: `${inputs.waterHeaterW.toLocaleString()} W` });
  if (inputs.muaW > 0) inputLines.push({ label: 'MUA heater', value: `${inputs.muaW.toLocaleString()} W` });
  if (inputs.evW > 0) inputLines.push({ label: 'EV charger', value: `${inputs.evW.toLocaleString()} W${inputs.loadManagement ? ' (EVEMS)' : ''}` });
  if (inputs.elevation && inputs.elevation > 0) inputLines.push({ label: 'Elevation', value: `${inputs.elevation.toLocaleString()} m` });
  if (inputs.isDualFuel) inputLines.push({ label: 'Dual-fuel', value: 'Yes' });

  const findingsText = (() => {
    if (result.status === 'PASS') {
      return (
        `Based on the CEC Rule 8-200 Optional Method calculation, the existing ` +
        `${result.serviceAmps} A service is compliant. The calculated demand of ` +
        `${fA(result.totalAmps)} represents ${result.utilization.toFixed(0)}% of the ` +
        `service rating, within the 80% continuous load limit of ${fA(result.continuousLimit)}. ` +
        `The installation of a heat pump and associated loads ` +
        `is electrically feasible without a service upgrade under current load conditions.`
      );
    }
    if (result.status === 'WARN') {
      return (
        `The calculated demand of ${fA(result.totalAmps)} (${result.utilization.toFixed(0)}% ` +
        `of service) exceeds the 80% continuous load limit (${fA(result.continuousLimit)}) ` +
        `by ${fA(Math.abs(over80))} but remains under the ${result.serviceAmps} A service rating. ` +
        `The installation is technically within code limits but leaves no practical margin for ` +
        `additional circuits or simultaneous cold-snap peak loads. A load management strategy or service ` +
        `evaluation is recommended before commissioning additional high-draw equipment.`
      );
    }
    // FAIL
    const headroom = result.serviceAmps - result.totalAmps;
    const deficit = Math.abs(headroom);
    const evNote = inputs.loadManagement
      ? ` An approved EVEMS device (Rule 8-106(11)) would remove the ` +
        `${fW(inputs.evW)} EV supply from the calculated load, potentially ` +
        `eliminating the service deficit.`
      : '';
    return (
      `The calculated demand of ${fA(result.totalAmps)} exceeds the ` +
      `${result.serviceAmps} A service rating by ${fA(deficit)} and is ` +
      `${fA(Math.abs(over80))} over the 80% continuous limit. ` +
      `If the heat pump, EV charger, and auxiliary loads trigger simultaneously ` +
      `during a cold-snap event, the main service breaker is at risk of a thermal ` +
      `trip -- a non-compliant installation under the CEC.` +
      evNote +
      ` A 200 A service upgrade or engineered load-management solution is required ` +
      `before proceeding with this load combination.`
    );
  })();

  return (
    <Document
      title={`Ghost Load Audit -- ${reportId}`}
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
            <Text style={s.brand}>Aelric Technologies -- canadianheatpumphub.ca</Text>
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
            <Text style={s.metaValue}>CSA C22.1:24 (CEC 26th Ed.) -- Rule 8-200</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>Property Area</Text>
            <Text style={s.metaValue}>{inputs.sqft.toLocaleString()} ft2 ({result.sqm.toFixed(1)} m2)</Text>
          </View>
        </View>

        {/* ── YOUR INPUTS ── (#11) */}
        <View style={s.inputsBox}>
          <Text style={s.inputsTitle}>Your Inputs</Text>
          <View style={s.inputsGrid}>
            {inputLines.map((line, i) => (
              <View key={i} style={s.inputsItem}>
                <Text style={s.inputsLabel}>
                  {line.label}: <Text style={s.inputsValue}>{line.value}</Text>
                </Text>
              </View>
            ))}
          </View>
          <Text style={s.inputsDisclaimer}>
            This calculation is based on the information you provided. If any input is incorrect,
            the result will be inaccurate. Verify all values with a licensed electrician.
          </Text>
        </View>

        {/* ── AC Replacement Note ── (#12) */}
        {hpReplacesAc && (
          <View style={[s.findingBox, { borderColor: C.primaryLight, backgroundColor: C.primaryLight, marginTop: 0, marginBottom: 4 }]}>
            <Text style={[s.findingTitle, { color: C.primary }]}>
              Heat Pump Replaces Existing AC
            </Text>
            <Text style={s.findingBody}>
              Your heat pump replaces an existing AC unit. Per CEC Rule 8-106(3), the interlock
              provision applies -- only the larger of heating and cooling loads is counted.
              The excluded load does not contribute to your calculated demand.
            </Text>
          </View>
        )}

        {/* ── Section 1 -- Individual Appliance Breakdown ── */}
        <Text style={s.sectionHeader}>1.  Appliance-by-Appliance Load Calculation</Text>

        <View style={s.table}>
          {/* Table header */}
          <View style={s.tableHead}>
            <Text style={s.thCategory}>Appliance</Text>
            <Text style={s.thNameplate}>Nameplate</Text>
            <Text style={s.thCalc}>Calculation Step</Text>
            <Text style={s.thRule}>CEC Rule</Text>
            <Text style={s.thDemand}>Demand</Text>
          </View>

          {/* Individual appliance rows */}
          {applianceRows.map((row, i) => (
            <View key={i} style={row.isDeduction
              ? [s.tableRow, { backgroundColor: row.demandW < 0 ? '#f0fdf4' : C.surface }]
              : row.isExcluded
                ? [s.tableRow, { backgroundColor: '#f5f5f5' }]
                : s.tableRow
            }>
              <Text style={[
                s.tdCategory,
                row.isDeduction ? { color: C.passInk, fontSize: 7.5 } : {},
                row.isExcluded ? { color: C.light, textDecoration: 'line-through' } : {},
              ]}>
                {row.category}
              </Text>
              <Text style={[s.tdNameplate, row.isExcluded ? { color: C.light } : {}]}>{row.nameplate}</Text>
              <Text style={[s.tdCalc, row.isExcluded ? { color: C.light } : {}]}>{row.calcStep}</Text>
              <Text style={[s.tdRule, row.isExcluded ? { color: C.light } : {}]}>{row.rule}</Text>
              <Text style={[
                row.isDeduction ? s.tdDemandGreen : s.tdDemand,
                row.isExcluded ? { color: C.light } : {},
              ]}>
                {row.isExcluded ? 'excluded' : (row.demandW < 0 ? `(${fW(Math.abs(row.demandW))})` : fW(row.demandW))}
              </Text>
            </View>
          ))}

          {/* Minimum demand floor */}
          <View style={s.tableRowFloor}>
            <Text style={s.tdCategory}>MINIMUM DEMAND FLOOR</Text>
            <Text style={s.tdNameplate}>N/A</Text>
            <Text style={s.tdCalc}>
              {result.sqm >= 80 ? '>= 80 m2 -- 24,000 W' : '< 80 m2 -- 14,400 W'}
            </Text>
            <Text style={s.tdRule}>8-200(1)(b)</Text>
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

        {/* Compliance summary (#4 - deficit from 80% limit) */}
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
            <Text style={s.summaryLabel}>{over80 <= 0 ? 'Under 80% limit' : 'Over 80% limit'}</Text>
            <Text style={[s.summaryValue, { color: pal.ink }]}>{fA(Math.abs(over80))}</Text>
          </View>
        </View>

        {/* ── Section 2 -- HVAC Options Comparison ── (#8) */}
        <Text style={s.sectionHeader}>2.  HVAC Load Scenarios -- Rule 8-106(3) Interlock Analysis</Text>

        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.hvacLabel, { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted }]}>
              HVAC Configuration
            </Text>
            <Text style={[s.hvacRule, { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted }]}>
              CEC Rule &amp; Demand Factor
            </Text>
            <Text style={[s.hvacDemand, { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted }]}>
              Demand
            </Text>
            <Text style={[s.hvacMarker, { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted }]}>
              Status
            </Text>
          </View>

          {result.hvacOptions.map((opt: HvacOption, i: number) => (
            <View key={i} style={opt.selected ? s.hvacOptionSelected : s.hvacOptionRow}>
              <Text style={[s.hvacLabel, opt.selected ? { fontFamily: 'Helvetica-Bold' } : {}]}>
                {hvacLetters[i]} {opt.label}
              </Text>
              <Text style={s.hvacRule}>{opt.rule}</Text>
              <Text style={[s.hvacDemand, opt.selected ? { color: C.primary } : {}]}>
                {fW(opt.demandW)}
              </Text>
              <Text style={s.hvacMarker}>
                {opt.selected ? 'APPLIED' : '--'}
              </Text>
            </View>
          ))}
        </View>

        {/* Plain-English explanation of why this HVAC option was chosen */}
        {selectedHvac && (
          <View style={[s.findingBox, { borderColor: C.primaryLight, backgroundColor: C.primaryLight }]}>
            <Text style={[s.findingTitle, { color: C.primary }]}>
              Option {hvacLetters[result.hvacOptions.findIndex((o: HvacOption) => o.selected)]} applies -- this is your peak HVAC load.
            </Text>
            <Text style={s.findingBody}>{selectedHvac.explanation}</Text>
          </View>
        )}

        {/* ── Section 3 -- Audit Findings ── */}
        <Text style={s.sectionHeader}>3.  Audit Findings &amp; Infrastructure Assessment</Text>

        <View style={[s.findingBox, { borderColor: pal.bg, backgroundColor: pal.bg }]}>
          <Text style={[s.findingTitle, { color: pal.ink }]}>
            {result.status === 'PASS' && 'Observation: Service is Compliant -- No Upgrade Required'}
            {result.status === 'WARN' && 'Observation: Service Near Capacity -- Marginal Headroom'}
            {result.status === 'FAIL' && 'Observation: Service is Insufficient -- Upgrade or EVEMS Required'}
          </Text>
          <Text style={s.findingBody}>{findingsText}</Text>
        </View>

        {/* ── Section 4 -- Thermal Analysis (conditional) ── */}
        {result.thermal && (
          <>
            <Text style={s.sectionHeader}>4.  Thermal Integration &amp; Elevation Audit</Text>

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
                <Text style={[s.tdRule, { width: '25%' }]}>1.08 x (BP / 101.325)</Text>
              </View>

              <View style={s.tableRow}>
                <Text style={[s.tdCategory, { width: '50%' }]}>Gas Appliance Derate Factor</Text>
                <Text style={[s.tdDemand, { width: '25%' }]}>{result.thermal.derateFactor.toFixed(3)}</Text>
                <Text style={[s.tdRule, { width: '25%' }]}>B149.1 Sec. 5.3</Text>
              </View>

              {result.thermal.gasNameplateBtu > 0 && (
                <>
                  <View style={s.tableRow}>
                    <Text style={[s.tdCategory, { width: '50%' }]}>Gas Furnace -- Nameplate</Text>
                    <Text style={[s.tdDemand, { width: '25%' }]}>{result.thermal.gasNameplateBtu.toLocaleString()} BTU/h</Text>
                    <Text style={[s.tdRule, { width: '25%' }]}>Manufacturer rating</Text>
                  </View>

                  <View style={s.tableRow}>
                    <Text style={[s.tdCategory, { width: '50%' }]}>Gas Furnace -- Effective (derated)</Text>
                    <Text style={[s.tdDemand, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{result.thermal.effectiveBtu.toLocaleString()} BTU/h</Text>
                    <Text style={[s.tdRule, { width: '25%' }]}>Nameplate x derate</Text>
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
                    <Text style={[s.tdRule, { width: '25%' }]}>(elec x AFUE x 277.78) / gas</Text>
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
            feasibility audit only -- it is not a design specification or permit drawing.
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

        {/* ── Notes section (#10) ── */}
        <Text style={[s.sectionHeader, { marginTop: 24 }]}>{notesSectionNum}.  Notes -- For Your Electrician&apos;s Use</Text>
        <View style={s.notesLine} />
        <View style={s.notesLine} />
        <View style={s.notesLine} />
        <View style={s.notesLine} />
        <View style={s.notesLine} />

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Ghost Load Technical Audits -- Aelric Technologies
          </Text>
          <Text style={s.footerText}>
            {reportId} -- CEC CSA C22.1:24 Rule 8-200
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
