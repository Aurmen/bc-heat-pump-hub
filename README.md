# BC Heat Pump Hub

A production-ready SEO-optimized website for BC homeowners considering heat pump installation, boiler replacement, and hybrid heating systems. Features a city-based installer directory and comprehensive educational guides.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Content:** MDX for guides
- **Data:** Local JSON file for directory listings
- **Deployment:** Static site generation (SSG)

## Project Structure

```
bc-heat-pump-hub/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── layout.tsx        # Root layout with navigation
│   │   ├── page.tsx          # Homepage
│   │   ├── sitemap.ts        # Auto-generated sitemap
│   │   ├── bc/               # BC region and city pages
│   │   ├── guides/           # Educational guide pages
│   │   └── directory/        # Installer directory
│   ├── components/           # Reusable React components
│   ├── content/guides/       # MDX guide content
│   ├── data/                 # City, region, and directory data
│   │   ├── cities.ts         # City definitions
│   │   ├── regions.ts        # Region definitions
│   │   └── directory.json    # Installer listings
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript type definitions
└── public/                   # Static assets

```

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation & Run

1. **Navigate to project directory:**
   ```bash
   cd C:\Users\Jaret\bc-heat-pump-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

The build process generates static pages for all routes, optimized for SEO and performance.

## Content Management

### Adding New Cities

Edit `src/data/cities.ts`:

```typescript
{
  name: 'New City Name',
  slug: 'new-city-name',
  region: 'Lower Mainland', // or 'Vancouver Island' or 'Interior'
  regionSlug: 'lower-mainland',
  province: 'BC',
  climateNotes: 'Climate-specific information for this city...',
  population: '~XX,000',
}
```

**Important:** The `regionSlug` must match an existing region in `src/data/regions.ts`.

Pages will be automatically generated at:
- `/bc/[regionSlug]/[citySlug]`

### Adding New Installer Listings

Edit `src/data/directory.json`:

```json
{
  "company_name": "Company Name",
  "slug": "company-name-slug",
  "website": "https://example.com",
  "phone": "6041234567",
  "city": "Vancouver",
  "region": "Lower Mainland",
  "province": "BC",
  "services": ["heat_pumps", "air_to_water", "boilers", "hybrid"],
  "emergency_service": "yes",
  "brands_supported": ["Mitsubishi", "Daikin"],
  "notes": "Factual notes only. No marketing claims.",
  "source_urls": ["https://source-verification-url.com"]
}
```

**Rules:**
- `city` must match a city name in `src/data/cities.ts`
- `region` must match exactly: `Lower Mainland`, `Vancouver Island`, or `Interior`
- `services` must be array of: `heat_pumps`, `air_to_water`, `boilers`, `hybrid`
- `emergency_service` must be: `yes`, `no`, or `unknown`
- **NEVER fabricate data.** If information is unknown, leave field empty or use "unknown".

### Adding New Educational Guides

1. **Create MDX file:**
   ```
   src/content/guides/your-guide-slug.mdx
   ```

2. **Add slug to guide list:**
   Edit `src/app/guides/[slug]/page.tsx`:
   ```typescript
   const guides = [
     'heat-pump-vs-boiler-bc',
     'your-guide-slug', // Add here
   ];
   ```

3. **Update metadata:**
   Edit the `generateMetadata` function in the same file to include title and description.

4. **Add to guides listing page:**
   Edit `src/app/guides/page.tsx` to include your new guide in the list.

**MDX formatting:**
- Use standard markdown syntax
- Include H1 (`#`) as the page title
- Use H2 (`##`) and H3 (`###`) for sections
- Wrap disclaimers in `<div className="disclaimer">...</div>`
- Use metric units first, then imperial in parentheses: `35°C (95°F)`

### Updating Regions

Edit `src/data/regions.ts` to add new regions or modify descriptions.

**For Alberta expansion:**
- Add region entries for `Calgary Area`, `Edmonton Area`, etc.
- Update `province` field to `'AB'` in types
- Create Alberta-specific city entries
- Update routing logic if needed

## SEO Features

### Automatic SEO Elements

1. **Metadata API:** Each page has unique title, description, and Open Graph tags
2. **Sitemap:** Auto-generated at `/sitemap.xml`
3. **Robots.txt:** Located in `/public/robots.txt`
4. **JSON-LD Structured Data:**
   - Organization markup on all pages
   - BreadcrumbList on content pages
   - LocalBusiness on company detail pages
5. **Canonical URLs:** Set via Next.js metadata
6. **Semantic HTML:** Proper heading hierarchy (H1 → H2 → H3)

### Updating Domain

Replace `https://yourdomain.com` in:
- `src/app/layout.tsx` (metadataBase)
- `src/app/sitemap.ts` (baseUrl)
- `public/robots.txt` (Sitemap URL)
- All JSON-LD components in `src/components/JsonLd.tsx`

Use find-and-replace: `https://yourdomain.com` → `https://your-actual-domain.com`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy (auto-detects Next.js)
4. Update domain in settings

### Netlify

1. Push code to GitHub
2. Import project in Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`

### Static Export (Alternative)

For traditional static hosting:

1. Update `next.config.js`:
   ```javascript
   const nextConfig = {
     output: 'export',
     // ... rest of config
   }
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy `out/` directory to any static host (Cloudflare Pages, AWS S3, etc.)

## Architecture Decisions

### Why Local JSON for Directory?

- **Simplicity:** No database, no API, no server costs
- **Version control:** All data tracked in git
- **Performance:** Static generation = instant page loads
- **Portability:** Easy to migrate or backup

### Why MDX for Guides?

- **Content as code:** Type-safe, linted, version-controlled
- **Flexibility:** Can embed React components if needed
- **Developer-friendly:** Write in markdown, render as HTML

### Why Static Generation?

- **SEO:** All content rendered at build time, fully indexable
- **Performance:** Zero server latency, served from CDN
- **Cost:** Free or near-free hosting (Vercel, Netlify, Cloudflare Pages)
- **Scalability:** Handles traffic spikes without backend infrastructure

### Client-Side vs. Server-Side Filtering

**Directory filters are client-side** because:
- Small dataset (initially)
- Instant filtering UX
- No API needed
- Simpler architecture for MVP

**When to move to server-side:**
- 500+ listings
- Complex search queries
- Need database features (analytics, user reviews)

## Expanding to Alberta (Checklist)

### 1. Update Type Definitions

Edit `src/types/directory.ts`:

```typescript
export interface City {
  province: 'BC' | 'AB'; // Add 'AB'
  // ... rest
}

export interface Region {
  province: 'BC' | 'AB'; // Add 'AB'
  // ... rest
}
```

### 2. Add Alberta Regions

Edit `src/data/regions.ts`:

```typescript
{
  name: 'Calgary Area',
  slug: 'calgary-area',
  province: 'AB',
  description: '...',
  cities: ['calgary', 'airdrie', 'okotoks'],
}
```

### 3. Add Alberta Cities

Edit `src/data/cities.ts`:

```typescript
{
  name: 'Calgary',
  slug: 'calgary',
  region: 'Calgary Area',
  regionSlug: 'calgary-area',
  province: 'AB',
  climateNotes: '...',
}
```

### 4. Update Routing

**Option A:** Keep `/bc` and add `/ab` routes
- Create `src/app/ab/` directory
- Mirror BC structure
- Update navigation to include AB

**Option B:** Consolidate to `/regions` or `/provinces`
- Refactor routing to include province in URL
- Update all internal links

### 5. Update Navigation

Edit `src/components/Navigation.tsx`:

```tsx
<Link href="/ab">Alberta</Link>
```

### 6. Alberta-Specific Content

- Create Alberta-specific guides (rebates differ by province)
- Update disclaimer language if needed
- Verify regulatory differences (licensing, permits)

### 7. Update Sitemap

Sitemap auto-generates from data, so adding AB cities/regions automatically updates sitemap.

### 8. SEO Considerations

- Create province-level landing pages: `/bc`, `/ab`
- Ensure unique content per province (avoid duplicate content)
- Update schema markup to include province distinctions

## Maintenance

### Monthly Tasks

- Review directory listings for accuracy
- Check for broken external links
- Update rebate information if programs change
- Monitor search console for SEO issues

### Quarterly Tasks

- Review and update cost ranges in guides
- Check for new cities to add
- Audit installer listings for inactive companies

### Annual Tasks

- Update all rebate/incentive information
- Review climate data for accuracy
- Audit entire site for outdated content

## License & Disclaimer

**Content Disclaimer:**

All educational content is for informational purposes only. Not engineering advice, product endorsement, or contractor recommendation. Homeowners must verify contractor licensing and consult qualified professionals.

**Code License:**

This codebase is provided as-is for educational and commercial use. Modify as needed for your project.

## Support

For issues or questions:
- Open GitHub issue
- Email: [your-email@example.com]

---

**Built with Next.js, TypeScript, and Tailwind CSS.**
