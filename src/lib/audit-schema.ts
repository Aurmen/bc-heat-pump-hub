/**
 * audit-schema.ts — Zod v4 validation for Ghost Load Auditor inputs
 *
 * Sanitizes all incoming API values before they reach the calculation
 * engine or Resend. Prevents injection of extreme values, missing fields,
 * and type coercion surprises from malformed JSON bodies.
 */
import { z } from 'zod';

// ── Allowed service sizes (BC residential panels) ─────────────────────────
// 125 A  — common in BC older homes (1970s–1990s)
// 320 A  — typical strata/condo sub-panel feed
const VALID_SERVICE_SIZES = [60, 100, 125, 150, 200, 320, 400] as const;

// ── Wattage field factory ─────────────────────────────────────────────────
const watts = (label: string, max = 30000) =>
  z
    .number()
    .min(0, `${label} must be ≥ 0 W`)
    .max(max, `${label} must be ≤ ${max} W`)
    .finite();

// ── Main audit input schema ───────────────────────────────────────────────
export const AuditInputSchema = z.object({
  // Square footage
  sqft: z.number().min(100, 'Floor area must be ≥ 100 sq ft').max(20000).finite(),

  // Panel service rating — must be a standard size
  panelAmps: z
    .number()
    .refine(
      (v): v is typeof VALID_SERVICE_SIZES[number] =>
        (VALID_SERVICE_SIZES as readonly number[]).includes(v),
      { message: `Service rating must be one of: ${VALID_SERVICE_SIZES.join(', ')} A` }
    ),

  // Appliance loads
  heatingW:     watts('Heating load', 30000),
  coolingW:     watts('Cooling load', 20000),
  rangeW:       watts('Range', 14400),
  dryerW:       watts('Dryer', 7500),
  waterHeaterW: watts('Water heater', 6000),
  /** Make-Up Air heater — optional; defaults to 0 W */
  muaW:         watts('MUA heater', 20000).optional().default(0),
  evW:          watts('EV charger', 19200),

  // Flags
  hasEV:          z.boolean(),
  loadManagement: z.boolean(),

  // ── Dual-fuel & altitude inputs (optional — thermal analysis) ──────────
  elevation:       z.number().min(0).max(3000).finite().optional().default(0),
  isDualFuel:      z.boolean().optional().default(false),
  balancePoint:    z.number().min(-20).max(15).finite().optional().default(2),
  gasNameplateBtu: z.number().min(0).max(200000).finite().optional().default(0),
  gasRatePerGj:    z.number().min(0).max(100).finite().optional().default(12.50),
  elecRatePerKwh:  z.number().min(0).max(1).finite().optional().default(0.14),
  furnaceAfue:     z.number().min(0.5).max(1.0).finite().optional().default(0.96),

  // Lead capture
  email:      z.string().email('A valid email address is required').max(254),
  postalCode: z
    .string()
    .regex(
      /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      'Enter a valid Canadian postal code (e.g. V5K 1A2)'
    ),
  consented: z.literal(true),

  // Optional pass-through values from client calculation
  totalAmps:    z.number().min(0).max(10000).finite().optional(),
  utilization:  z.number().min(0).max(10000).finite().optional(),
  resultStatus: z.enum(['PASS', 'WARN', 'FAIL']).optional(),
});

export type AuditInput = z.infer<typeof AuditInputSchema>;
