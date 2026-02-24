# CLAUDE.md — BC Heat Pump Hub

## Project
BC-specific heat pump contractor directory and educational content site.
- **Live:** https://canadianheatpumphub.ca
- **Stack:** Next.js 15 App Router (SSG), TypeScript, Tailwind CSS, MDX, Vercel
- **Build:** `npm run build` — must pass with 0 errors before any push
- **Deploy:** auto on push to `main`

---

## Documentation & Tool Standards

- **Checklist Formatting:** Use interactive `<input type="checkbox">` elements in MDX. Import `PrintButton` from `@/components/PrintButton` for print functionality.
- **Tone:** Objective, technical, and compliance-focused. Empower the homeowner to verify technical claims (load calcs, AHRI numbers, design temps).
- **Pro-Tip callouts:** Use `<div className="not-prose bg-amber-50 border-l-4 border-amber-400 px-5 py-4 my-6 rounded-r-xl">` pattern.
- **Print support:** Every checklist guide imports and renders `<PrintButton />` at the top. `PrintButton` calls `window.print()` and is a `'use client'` component.

## Soft-Launch & Metrics Standards

- **Lead Capture:** All inquiries must be routed to a single central inbox (manual review phase).
- **Data Preservation:** The contact form must attempt to capture the 'context' of the user (e.g., if they just used the Rebate Calculator, pass those estimated values into the message field).
- **Liability:** Every lead form must include a disclaimer: "This inquiry is a request for information. Final technical verification and site visits are required by a licensed contractor."

---

## Step Code & Compliance Standards

- **ZCSC Integration:** Reference the Zero Carbon Step Code (ZCSC) as the primary driver for all-electric requirements in new BC builds. EL = Emission Level (EL-1 through EL-4).
- **The TEDI Factor:** Mention that high-efficiency envelopes (BC Energy Step Code Step 3+) allow for smaller, more affordable heat pump tonnages because TEDI (Thermal Energy Demand Intensity) is lower.
- **Regional Variation:** Vancouver and Saanich mandate EL-4 (no combustion for space heating). Many Interior BC and lower-priority municipalities are still at EL-1 (measure and report only). Always cite "check with your AHJ" for specifics.
- **Key Acronyms to use correctly:** ZCSC, BCESC (BC Energy Step Code), TEDI, TEUI, GHGI (Greenhouse Gas Intensity in kgCO₂e/m²/year), AHJ (Authority Having Jurisdiction).

---

## Tool & Calculator Standards

- **Mandatory Disclaimer:** Every calculator (ROI & Rebate) must display a bold disclaimer at the top AND bottom: "ESTIMATE ONLY. Actual results may vary based on site conditions, utility rates, and final rebate approval."
- **Data Integrity:** Rebate calculations must be based on the latest 2026 CleanBC Better Homes and BC Hydro stacking rules. Reference `betterhomesbc.ca` for current program amounts.
- **Label Discipline:** All output values must use qualified labels — "Estimated Annual Savings", "Estimated Payback Period", "Up to $X,XXX" — never bare dollar figures presented as guarantees.
- **Tone:** Professional, conservative, and transparent about variables. Never overstate savings or rebate certainty.
- **Components:** `ROICalculator` and `RebateCalculator` are `'use client'` components in `src/components/`. Import them into MDX guides the same way as `TechnicalDeepDive` or `PrintButton`.

---

## UI/UX Standards

- **Progressive Disclosure:** Wrap heavy technical tables/math in `<details>`/`<summary>` in MDX
- **3-Click Rule:** Every city or guide reachable within 3 clicks of homepage
- **Visual Hierarchy:** H2 = "The Problem", bullets = solutions, tables = comparison data
- **Next Steps:** Every guide MDX must end with `## Next Steps` (guide-specific links) before any `<div className="disclaimer">`

---

## Adding a New Guide

Requires changes in **5 places** in `src/app/guides/[slug]/page.tsx`:
1. `guides` array (slug only)
2. `importGuideContent()` switch statement
3. `titles` record (×2 — both instances in the file)
4. `readTimes` record
5. `descriptions` record

Also update:
- `src/app/sitemap.ts` — add slug to `guides` array
- `src/app/guides/page.tsx` — add to hub display list

MDX file goes in `src/content/guides/[slug].mdx`.

---

## Adding a New Case Study

1. Create `src/content/case-studies/[slug].mdx`
2. Add to `caseStudies` record in `src/app/case-studies/[slug]/page.tsx`
3. Add `importCaseStudy()` switch case
4. Add slug to `caseStudies` array in `src/app/sitemap.ts`

---

## Adding a New City

Edit `src/data/cities.ts`. Full profile requires:
`name, slug, region, regionSlug, province, climateNotes, population, designTemp, avgWinterLow, heatingDegreeDays, installCosts, operatingCosts, recommendedSystems`

Region values: `'Lower Mainland' | 'Vancouver Island' | 'Interior'`
RegionSlug values: `'lower-mainland' | 'vancouver-island' | 'interior'`

---

## Key Data Files
- `src/data/directory.json` — contractor listings (~129 entries)
- `src/data/cities.ts` — city climate/cost data (43 cities as of Feb 2026)
- `src/data/repair-cities.ts` — 16 repair-specific city pages
- `src/data/regions.ts` — 3 region definitions
- `src/lib/reliability.ts` — ServiceReliability score calculation
- `src/components/JsonLd.tsx` — all structured data components

---

## Current Priority (Feb 2026)
Lower Mainland traffic — Vancouver, Surrey, Burnaby, Richmond, Coquitlam.
Content hub: strata/condo compliance + 100A panel limitations.
Key deadline: Vancouver strata EPR filing due Dec 31, 2026.

## Pending
- CSV migration: `scripts/bc_contractors_master.csv` → `src/data/directory.json`
- Hub-and-spoke directory: `/directory` regional nav with contractor counts
- First ServiceReliability scores (infrastructure ready, no entries scored yet)
