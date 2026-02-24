# CLAUDE.md — BC Heat Pump Hub

## Project
BC-specific heat pump contractor directory and educational content site.
- **Live:** https://canadianheatpumphub.ca
- **Stack:** Next.js 15 App Router (SSG), TypeScript, Tailwind CSS, MDX, Vercel
- **Build:** `npm run build` — must pass with 0 errors before any push
- **Deploy:** auto on push to `main`

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
