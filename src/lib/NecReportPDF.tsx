/**
 * NecReportPDF.tsx
 *
 * Server-side React-PDF document for the Ghost Load™ NEC 220.82
 * Optional Calculation Report (US market).
 *
 * Rendered via @react-pdf/renderer -> renderToBuffer().
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { NecInputs, NecResult, NecHvacOption } from './nec-engine';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  ink:     '#111827',
  muted:   '#6b7280',
  light:   '#9ca3af',
  border:  '#e5e7eb',
  surface: '#f9fafb',
  white:   '#ffffff',

  primary:      '#1e40af',
  primaryLight: '#dbeafe',

  passInk:   '#166534',  passLight: '#dcfce7',
  warnInk:   '#92400e',  warnLight: '#fef3c7',
  failInk:   '#991b1b',  failLight: '#fee2e2',
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

  // Input summary
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

  // Table
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
  tableRowSub: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: '#f0fdf4',
  },
  tableRowTotal: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: C.primaryLight,
    borderTopWidth: 2,
    borderTopColor: C.primary,
  },
  tableRowSubtotal: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  // 4-column: Item | Nameplate | Calculation | Demand
  thItem:    { width: '30%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thNp:      { width: '16%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thCalc:    { width: '34%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted },
  thDemand:  { width: '20%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted, textAlign: 'right' },

  tdItem:    { width: '30%', fontSize: 8, color: C.ink },
  tdNp:      { width: '16%', fontSize: 8, color: C.muted },
  tdCalc:    { width: '34%', fontSize: 7.5, color: C.muted, fontFamily: 'Helvetica-Oblique' },
  tdDemand:  { width: '20%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.ink, textAlign: 'right' },
  tdDemandGreen: { width: '20%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.passInk, textAlign: 'right' },
  tdTotalLabel: { width: '80%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.primary },
  tdTotalValue: { width: '20%', fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },

  // HVAC options
  hvacRow:       { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  hvacSelected:  { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10, backgroundColor: C.primaryLight, borderBottomWidth: 1, borderBottomColor: C.primary },
  hvacLabel:     { width: '30%', fontSize: 8, color: C.ink },
  hvacRule:      { width: '38%', fontSize: 7.5, color: C.muted, fontFamily: 'Helvetica-Oblique' },
  hvacDemand:    { width: '18%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.ink, textAlign: 'right' },
  hvacMarker:    { width: '14%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.primary, textAlign: 'right' },

  // Summary / findings
  summaryRow: { flexDirection: 'row', gap: 12, marginTop: 10, padding: 10, borderRadius: 4, borderWidth: 1 },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  summaryValue: { fontFamily: 'Helvetica-Bold', fontSize: 12 },

  findingBox: { marginTop: 8, padding: 12, borderRadius: 4, borderWidth: 1 },
  findingTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 4 },
  findingBody: { fontSize: 8.5, color: C.ink, lineHeight: 1.5 },

  disclaimerBox: {
    marginTop: 16, padding: 10, backgroundColor: C.surface,
    borderRadius: 4, borderWidth: 1, borderColor: C.border,
  },
  disclaimerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.ink, marginBottom: 4 },
  disclaimerText: { fontSize: 7, color: C.muted, lineHeight: 1.55 },
  disclaimerBold: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: C.ink },

  // Notes section
  notesTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.muted, marginBottom: 10 },
  notesLine: { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 18 },

  footer: {
    position: 'absolute', bottom: 18, left: 40, right: 40,
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 6,
  },
  footerText: { fontSize: 7, color: C.light },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function fW(w: number): string { return w === 0 ? '0 VA' : `${w.toLocaleString()} VA`; }
function fA(a: number, d = 1): string { return `${a.toFixed(d)} A`; }

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface NecReportData {
  reportId: string;
  generatedAt: string;
  inputs: NecInputs;
  result: NecResult;
}

// ── Document ──────────────────────────────────────────────────────────────────
export function NecReportDocument({ reportId, generatedAt, inputs, result }: NecReportData) {
  const pal = statusPalette(result.status);
  const over80 = result.totalAmps - result.continuousLimit;
  const dateStr = new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const selectedHvac = result.hvacOptions.find((o: NecHvacOption) => o.selected);
  const hvacLetters = ['(a)', '(b)', '(c)', '(d)', '(e)'];

  // Build user input lines (skip zeros / N/A)
  const inputLines: { label: string; value: string }[] = [];
  inputLines.push({ label: 'Panel rating', value: `${inputs.serviceAmps}A` });
  inputLines.push({ label: 'Home size', value: `${inputs.sqft.toLocaleString()} sq ft` });
  if (inputs.heatingW > 0) inputLines.push({ label: 'Heat pump / heating', value: `${inputs.heatingW.toLocaleString()} W` });
  if (inputs.coolingW > 0) inputLines.push({ label: 'Existing AC / cooling', value: `${inputs.coolingW.toLocaleString()} W` });
  inputLines.push({ label: 'Heating type', value: inputs.heatingType === 'heat_pump' ? 'Heat pump' : `Central resistance (${inputs.heatingUnits} units)` });
  if (inputs.rangeW > 0) inputLines.push({ label: 'Range / oven', value: `${inputs.rangeW.toLocaleString()} W` });
  if (inputs.dryerW > 0) inputLines.push({ label: 'Clothes dryer', value: `${inputs.dryerW.toLocaleString()} W` });
  if (inputs.waterHeaterW > 0) inputLines.push({ label: 'Water heater', value: `${inputs.waterHeaterW.toLocaleString()} W` });
  if (inputs.dishwasherW > 0) inputLines.push({ label: 'Dishwasher', value: `${inputs.dishwasherW.toLocaleString()} W` });
  if (inputs.evW > 0) inputLines.push({ label: 'EV charger', value: `${inputs.evW.toLocaleString()} W${inputs.hasElms ? ' (ELMS)' : ''}` });
  if (inputs.otherFixedW > 0) inputLines.push({ label: 'Other fixed loads', value: `${inputs.otherFixedW.toLocaleString()} W` });
  inputLines.push({ label: 'Small appliance circuits', value: `${inputs.smallApplianceCircuits}` });
  inputLines.push({ label: 'NEC edition', value: '2023' });

  const findingsText = (() => {
    if (result.status === 'PASS') {
      return (
        `Based on the NEC 220.82 Optional Calculation, the existing ` +
        `${result.serviceAmps} A service is compliant. The calculated demand of ` +
        `${fA(result.totalAmps)} represents ${result.utilization.toFixed(0)}% of the ` +
        `service rating, within the 80% continuous load limit of ${fA(result.continuousLimit)}. ` +
        `The installation of a heat pump and associated loads ` +
        `is electrically feasible without a service upgrade.`
      );
    }
    if (result.status === 'WARN') {
      return (
        `The calculated demand of ${fA(result.totalAmps)} (${result.utilization.toFixed(0)}% ` +
        `of service) exceeds the 80% continuous load limit (${fA(result.continuousLimit)}) ` +
        `by ${fA(Math.abs(over80))} but remains under the ${result.serviceAmps} A service rating. ` +
        `The installation is technically within code limits but leaves minimal margin. ` +
        `A load management strategy is recommended before adding high-draw equipment.`
      );
    }
    const headroom = result.serviceAmps - result.totalAmps;
    return (
      `The calculated demand of ${fA(result.totalAmps)} exceeds the ` +
      `${result.serviceAmps} A service rating by ${fA(Math.abs(headroom))} and is ` +
      `${fA(Math.abs(over80))} over the 80% continuous limit. ` +
      `A service upgrade or engineered load management solution is required ` +
      `before proceeding with this load combination.`
    );
  })();

  return (
    <Document
      title={`Ghost Load Audit (NEC) - ${reportId}`}
      author="Aelric Technologies"
      subject="NEC 220.82 Optional Calculation Report"
      creator="heatpumplocator.com"
      producer="Ghost Load Auditor v2026"
      keywords="NEC 220.82, heat pump, electrical service, panel audit"
    >
      <Page size="LETTER" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Aelric Technologies</Text>
            <Text style={s.reportTitle}>NEC 220.82 Optional Calculation Report</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: pal.bg }]}>
            <Text style={[s.statusText, { color: pal.ink }]}>{result.status}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={s.metaRow}>
          <View>
            <Text style={s.metaLabel}>Report ID</Text>
            <Text style={s.metaValue}>{reportId}</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>Date</Text>
            <Text style={s.metaValue}>{dateStr}</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>Code Reference</Text>
            <Text style={s.metaValue}>NFPA 70 (2023 NEC) -- Article 220.82</Text>
          </View>
          <View>
            <Text style={s.metaLabel}>Dwelling Area</Text>
            <Text style={s.metaValue}>{inputs.sqft.toLocaleString()} sq ft</Text>
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

        {/* ── Section 1: General Loads 220.82(a) ── */}
        <Text style={s.sectionHeader}>1.  General Loads -- NEC 220.82(a)</Text>

        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={s.thItem}>Load Item</Text>
            <Text style={s.thNp}>Nameplate</Text>
            <Text style={s.thCalc}>Calculation</Text>
            <Text style={s.thDemand}>VA</Text>
          </View>

          {/* General lighting */}
          <View style={s.tableRow}>
            <Text style={s.tdItem}>General Lighting &amp; Receptacles</Text>
            <Text style={s.tdNp}>{inputs.sqft.toLocaleString()} sq ft</Text>
            <Text style={s.tdCalc}>3 VA x {inputs.sqft.toLocaleString()} sq ft</Text>
            <Text style={s.tdDemand}>{fW(result.generalLightingVA)}</Text>
          </View>

          {/* Small appliance circuits */}
          <View style={s.tableRow}>
            <Text style={s.tdItem}>Small Appliance Circuits</Text>
            <Text style={s.tdNp}>{inputs.smallApplianceCircuits} circuits</Text>
            <Text style={s.tdCalc}>1,500 VA x {Math.max(2, inputs.smallApplianceCircuits)} circuits [210.11(C)(1)]</Text>
            <Text style={s.tdDemand}>{fW(result.smallApplianceVA)}</Text>
          </View>

          {/* Laundry */}
          {inputs.hasLaundryCircuit && (
            <View style={s.tableRow}>
              <Text style={s.tdItem}>Laundry Circuit</Text>
              <Text style={s.tdNp}>1 circuit</Text>
              <Text style={s.tdCalc}>1,500 VA [210.11(C)(2)]</Text>
              <Text style={s.tdDemand}>{fW(result.laundryVA)}</Text>
            </View>
          )}

          {/* Individual appliances -- only if entered */}
          {inputs.rangeW > 0 && (
            <View style={s.tableRow}>
              <Text style={s.tdItem}>Range / Oven / Cooktop</Text>
              <Text style={s.tdNp}>{fW(inputs.rangeW)}</Text>
              <Text style={s.tdCalc}>Nameplate at 100% (fastened-in-place)</Text>
              <Text style={s.tdDemand}>{fW(inputs.rangeW)}</Text>
            </View>
          )}

          {inputs.dryerW > 0 && (
            <View style={s.tableRow}>
              <Text style={s.tdItem}>Clothes Dryer</Text>
              <Text style={s.tdNp}>{fW(inputs.dryerW)}</Text>
              <Text style={s.tdCalc}>Nameplate at 100% (fastened-in-place)</Text>
              <Text style={s.tdDemand}>{fW(inputs.dryerW)}</Text>
            </View>
          )}

          {inputs.waterHeaterW > 0 && (
            <View style={s.tableRow}>
              <Text style={s.tdItem}>Water Heater</Text>
              <Text style={s.tdNp}>{fW(inputs.waterHeaterW)}</Text>
              <Text style={s.tdCalc}>Nameplate at 100% (fastened-in-place)</Text>
              <Text style={s.tdDemand}>{fW(inputs.waterHeaterW)}</Text>
            </View>
          )}

          {inputs.dishwasherW > 0 && (
            <View style={s.tableRow}>
              <Text style={s.tdItem}>Dishwasher</Text>
              <Text style={s.tdNp}>{fW(inputs.dishwasherW)}</Text>
              <Text style={s.tdCalc}>Nameplate at 100% (fastened-in-place)</Text>
              <Text style={s.tdDemand}>{fW(inputs.dishwasherW)}</Text>
            </View>
          )}

          {inputs.otherFixedW > 0 && (
            <View style={s.tableRow}>
              <Text style={s.tdItem}>Other Fixed Appliances</Text>
              <Text style={s.tdNp}>{fW(inputs.otherFixedW)}</Text>
              <Text style={s.tdCalc}>Nameplate at 100% (fastened-in-place)</Text>
              <Text style={s.tdDemand}>{fW(inputs.otherFixedW)}</Text>
            </View>
          )}

          {/* Subtotal */}
          <View style={s.tableRowSubtotal}>
            <Text style={[s.tdItem, { fontFamily: 'Helvetica-Bold' }]}>General Loads Subtotal</Text>
            <Text style={s.tdNp} />
            <Text style={s.tdCalc} />
            <Text style={[s.tdDemand, { fontFamily: 'Helvetica-Bold' }]}>{fW(result.generalSubtotalVA)}</Text>
          </View>

          {/* Demand factor application (#3 - dynamic label) */}
          <View style={s.tableRow}>
            <Text style={s.tdItem}>First 10 kVA at 100%</Text>
            <Text style={s.tdNp} />
            <Text style={s.tdCalc}>min({fW(result.generalSubtotalVA)}, 10,000) x 100% [220.82(a)]</Text>
            <Text style={s.tdDemand}>{fW(result.first10kVA)}</Text>
          </View>

          <View style={s.tableRow}>
            <Text style={s.tdItem}>Remainder at 40%</Text>
            <Text style={s.tdNp} />
            <Text style={s.tdCalc}>{fW(result.remainderVA)} x 40% = {fW(result.remainderDemandVA)}</Text>
            <Text style={s.tdDemand}>{fW(result.remainderDemandVA)}</Text>
          </View>

          {/* Demand factor deduction line */}
          <View style={s.tableRowSub}>
            <Text style={[s.tdItem, { color: C.passInk, fontSize: 7.5 }]}>  220.82(a) demand factor savings</Text>
            <Text style={s.tdNp} />
            <Text style={s.tdCalc}>60% of remainder excluded</Text>
            <Text style={s.tdDemandGreen}>({fW(Math.round(result.remainderVA * 0.60))})</Text>
          </View>

          {/* General demand total */}
          <View style={s.tableRowSubtotal}>
            <Text style={[s.tdItem, { fontFamily: 'Helvetica-Bold' }]}>General Demand [220.82(a)]</Text>
            <Text style={s.tdNp} />
            <Text style={s.tdCalc}>{fW(result.first10kVA)} + {fW(result.remainderDemandVA)}</Text>
            <Text style={[s.tdDemand, { fontFamily: 'Helvetica-Bold', color: C.primary }]}>{fW(result.generalDemandVA)}</Text>
          </View>
        </View>

        {/* ── Section 2: HVAC Options 220.82(b) ── (#2 - letter prefixes + APPLIED marker) */}
        <Text style={s.sectionHeader}>2.  HVAC Load -- NEC 220.82(b) Largest-of Analysis</Text>

        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.hvacLabel, { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted }]}>HVAC Configuration</Text>
            <Text style={[s.hvacRule, { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted }]}>NEC Rule &amp; Demand Factor</Text>
            <Text style={[s.hvacDemand, { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted }]}>Demand</Text>
            <Text style={[s.hvacMarker, { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.muted }]}>Status</Text>
          </View>

          {result.hvacOptions.map((opt: NecHvacOption, i: number) => (
            <View key={i} style={opt.selected ? s.hvacSelected : s.hvacRow}>
              <Text style={[s.hvacLabel, opt.selected ? { fontFamily: 'Helvetica-Bold' } : {}]}>
                {hvacLetters[i]} {opt.label}
              </Text>
              <Text style={s.hvacRule}>{opt.rule}</Text>
              <Text style={[s.hvacDemand, opt.selected ? { color: C.primary } : {}]}>{fW(opt.demandW)}</Text>
              <Text style={s.hvacMarker}>{opt.selected ? 'APPLIED' : '--'}</Text>
            </View>
          ))}
        </View>

        {selectedHvac && (
          <View style={[s.findingBox, { borderColor: C.primaryLight, backgroundColor: C.primaryLight }]}>
            <Text style={[s.findingTitle, { color: C.primary }]}>
              Option {hvacLetters[result.hvacOptions.findIndex((o: NecHvacOption) => o.selected)]} applies -- this is your peak HVAC load.
            </Text>
            <Text style={s.findingBody}>{selectedHvac.explanation}</Text>
          </View>
        )}

        {/* ── Motor surcharge 220.82(c) / 430.24 ── (#1) */}
        {result.motorSurchargeW > 0 && (
          <>
            <Text style={s.sectionHeader}>2c.  Motor Surcharge -- NEC 220.82(c) / Article 430</Text>
            <View style={s.table}>
              <View style={s.tableRow}>
                <Text style={[s.tdItem, { width: '30%' }]}>Largest motor (25%)</Text>
                <Text style={[s.tdNp, { width: '16%' }]}>{fW(result.largestMotorW)}</Text>
                <Text style={[s.tdCalc, { width: '34%' }]}>
                  25% x {fW(result.largestMotorW)} = {fW(result.motorSurchargeW)} [430.24]
                </Text>
                <Text style={[s.tdDemand, { width: '20%' }]}>+{fW(result.motorSurchargeW)}</Text>
              </View>
            </View>
          </>
        )}

        {/* ── EV row (if present) ── */}
        {inputs.evW > 0 && (
          <>
            <Text style={s.sectionHeader}>2d.  EV Supply Equipment -- NEC 625</Text>
            <View style={s.table}>
              <View style={s.tableRow}>
                <Text style={[s.tdItem, { width: '30%' }]}>EVSE Nameplate</Text>
                <Text style={[s.tdNp, { width: '16%' }]}>{fW(inputs.evW)}</Text>
                <Text style={[s.tdCalc, { width: '34%' }]}>
                  {inputs.hasElms
                    ? `ELMS managed to ${fW(inputs.elmsLoadW)} [625.42]`
                    : `100% of nameplate [625.41]`}
                </Text>
                <Text style={[inputs.hasElms ? s.tdDemandGreen : s.tdDemand, { width: '20%' }]}>
                  {fW(result.evAppliedW)}
                </Text>
              </View>
              {inputs.hasElms && (
                <View style={s.tableRowSub}>
                  <Text style={[s.tdItem, { width: '30%', color: C.passInk, fontSize: 7.5 }]}>  ELMS deduction</Text>
                  <Text style={[s.tdNp, { width: '16%' }]} />
                  <Text style={[s.tdCalc, { width: '34%' }]}>Full nameplate reduced by energy management</Text>
                  <Text style={[s.tdDemandGreen, { width: '20%' }]}>({fW(inputs.evW - inputs.elmsLoadW)})</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* ── Grand total ── */}
        <View style={[s.table, { marginTop: 10 }]}>
          <View style={s.tableRowTotal}>
            <Text style={s.tdTotalLabel}>
              Total Calculated Demand @ 240 V
            </Text>
            <Text style={s.tdTotalValue}>{fA(result.totalAmps)}</Text>
          </View>
        </View>

        {/* Compliance summary (#4 - deficit from 80% limit) */}
        <View style={[s.summaryRow, { borderColor: pal.bg, backgroundColor: pal.bg }]}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Total Demand</Text>
            <Text style={[s.summaryValue, { color: pal.ink }]}>{result.totalDemandVA.toLocaleString()} VA</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Service Rating</Text>
            <Text style={[s.summaryValue, { color: C.ink }]}>{result.serviceAmps} A</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>80% Continuous</Text>
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

        {/* ── Section 3: Findings ── */}
        <Text style={s.sectionHeader}>3.  Audit Findings</Text>
        <View style={[s.findingBox, { borderColor: pal.bg, backgroundColor: pal.bg }]}>
          <Text style={[s.findingTitle, { color: pal.ink }]}>
            {result.status === 'PASS' && 'Service is Compliant -- No Upgrade Required'}
            {result.status === 'WARN' && 'Service Near Capacity -- Marginal Headroom'}
            {result.status === 'FAIL' && 'Service is Insufficient -- Upgrade Required'}
          </Text>
          <Text style={s.findingBody}>{findingsText}</Text>
        </View>

        {/* ── Disclaimer ── */}
        <Text style={s.sectionHeader}>4.  Compliance &amp; Technical Disclaimer</Text>
        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerTitle}>Method: NEC Article 220.82 Optional Calculation (2023 NFPA 70)</Text>
          <Text style={[s.disclaimerText, { marginBottom: 4 }]}>
            <Text style={s.disclaimerBold}>1. Scope: </Text>
            This document provides a load analysis based on the demand factors in NFPA 70 (2023 NEC),
            Article 220.82 Optional Calculation for dwelling units. This is a technical feasibility
            audit only -- it is not a design specification or permit drawing.
          </Text>
          <Text style={[s.disclaimerText, { marginBottom: 4 }]}>
            <Text style={s.disclaimerBold}>2. Non-Advisory: </Text>
            This document does not constitute professional engineering advice. All findings must be
            verified by a licensed electrician or Professional Engineer before any permit application
            or work commences.
          </Text>
          <Text style={[s.disclaimerText, { marginBottom: 4 }]}>
            <Text style={s.disclaimerBold}>3. Jurisdiction: </Text>
            NEC adoption varies by state, county, and municipality. Some AHJs enforce amended versions
            of the NEC or different editions. Always confirm the locally adopted code edition with your AHJ.
          </Text>
          <Text style={s.disclaimerText}>
            <Text style={s.disclaimerBold}>4. Data Integrity: </Text>
            All demand factors are computed server-side from raw inputs. Report ID: {reportId}.
          </Text>
        </View>

        {/* ── Notes section (#5) ── */}
        <Text style={[s.sectionHeader, { marginTop: 24 }]}>5.  Notes -- For Your Electrician&apos;s Use</Text>
        <View style={s.notesLine} />
        <View style={s.notesLine} />
        <View style={s.notesLine} />
        <View style={s.notesLine} />
        <View style={s.notesLine} />

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Ghost Load Technical Audits -- Aelric Technologies</Text>
          <Text style={s.footerText}>{reportId} -- NEC 220.82 (2023)</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
