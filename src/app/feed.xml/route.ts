/**
 * RSS Feed — /feed.xml
 *
 * Static XML generated at build time from guides and key pages.
 * Enables Google News indexing, RSS reader subscriptions, and
 * automation pipelines (Zapier, Mailchimp, social posting).
 */

const SITE_URL = 'https://canadianheatpumphub.ca';
const SITE_TITLE = 'Canadian Heat Pump Hub';
const SITE_DESCRIPTION = 'BC heat pump guides, rebate updates, brand comparisons, and installation cost data. Honest, verified information for homeowners.';

// All feed items with their metadata — ordered newest first
const feedItems: Array<{
  slug: string;
  title: string;
  description: string;
  pubDate: string; // ISO date
  category: string;
}> = [
  // Key pages (most recently updated first)
  {
    slug: '/rebates',
    title: 'BC Heat Pump Rebates 2026 — Complete Guide',
    description: 'CleanBC income-qualified programs, OHPA for oil/propane, and utility rebates. Federal Greener Homes Grant discontinued.',
    pubDate: '2026-03-17',
    category: 'Rebates',
  },
  {
    slug: '/brands',
    title: 'Heat Pump Brand Comparison for BC (2026)',
    description: 'Compare Mitsubishi, Daikin, Fujitsu, Carrier, Lennox, LG, and Bosch. Pricing, HSPF, COP, warranty, and reliability data.',
    pubDate: '2026-03-16',
    category: 'Brand Comparison',
  },
  {
    slug: '/heat-pump-cost-bc',
    title: 'Heat Pump Cost in British Columbia (2026)',
    description: 'Installation costs $8,500-$24,500, rebates for income-qualified, operating cost comparisons by heating system.',
    pubDate: '2026-03-17',
    category: 'Costs',
  },
  {
    slug: '/cold-climate-heat-pump-bc',
    title: 'Cold Climate Heat Pumps for BC',
    description: 'Performance data at -15°C to -25°C, COP ranges, recommended models for Interior and Northern BC.',
    pubDate: '2026-03-17',
    category: 'Cold Climate',
  },
  // Guides
  {
    slug: '/guides/heat-pump-bc-2026',
    title: 'BC Heat Pump Guide 2026: What Every Homeowner Should Verify',
    description: 'Comprehensive 2026 guide covering compliance, sizing, rebates, and contractor selection for BC homeowners.',
    pubDate: '2026-03-01',
    category: 'Guide',
  },
  {
    slug: '/guides/how-to-claim-heat-pump-rebate-bc',
    title: 'How to Claim Heat Pump Rebates in BC (2026)',
    description: 'Step-by-step process for CleanBC, OHPA, and Greener Homes Loan applications. Updated for 2026 program changes.',
    pubDate: '2026-03-17',
    category: 'Rebates',
  },
  {
    slug: '/guides/vancouver-strata-heat-pump-guide',
    title: 'Vancouver Condo Heat Pumps: Navigating Strata Approval in 2026',
    description: 'EPR filing deadlines, strata bylaw requirements, and approved installation approaches for Vancouver condos.',
    pubDate: '2026-02-16',
    category: 'Strata',
  },
  {
    slug: '/guides/best-cold-climate-heat-pump-bc-2026',
    title: 'Best Cold Climate Heat Pumps for BC in 2026',
    description: 'Top-rated cold climate models with NEEP-verified COP data. Mitsubishi Hyper-Heat, Daikin Aurora, Fujitsu XLTH compared.',
    pubDate: '2026-02-16',
    category: 'Cold Climate',
  },
  {
    slug: '/guides/heat-pump-vs-electric-baseboard-bc',
    title: 'Heat Pump vs. Electric Baseboard Heating in BC',
    description: 'Estimated 40-65% savings potential, payback analysis, and climate zone considerations.',
    pubDate: '2026-03-17',
    category: 'Comparison',
  },
  {
    slug: '/guides/cost-heat-pump-installation-bc',
    title: 'Heat Pump Installation Costs in BC (2026)',
    description: 'Ductless $4,500-$9,000, central ducted $8,000-$18,000, hydronic $15,000-$30,000. Updated rebate calculations.',
    pubDate: '2026-03-17',
    category: 'Costs',
  },
  {
    slug: '/guides/100-amp-panel-heat-pump-vancouver',
    title: 'Can I Install a Heat Pump on a 100 Amp Panel? (Surrey & Vancouver Guide)',
    description: 'CEC Rule 8-200 load calculations, when panel upgrades are needed, and the Ghost Load audit approach.',
    pubDate: '2026-02-16',
    category: 'Electrical',
  },
  {
    slug: '/guides/heat-pump-vs-boiler-bc',
    title: 'Heat Pumps vs. Boilers in BC',
    description: 'Cost, efficiency, and ROI comparison. When to replace vs. hybridize your existing boiler system.',
    pubDate: '2026-03-17',
    category: 'Comparison',
  },
  {
    slug: '/guides/dual-fuel-vs-all-electric-interior-bc',
    title: 'Dual-Fuel vs. All-Electric: Choosing the Right System for the BC Interior',
    description: 'Balance point analysis, COP crossover economics, and FortisBC rate considerations for Kelowna, Kamloops, and beyond.',
    pubDate: '2026-02-16',
    category: 'Interior BC',
  },
  {
    slug: '/guides/types-of-heat-pumps-bc',
    title: 'Types of Heat Pumps Available in BC',
    description: 'Ductless mini-splits, central ducted, air-to-water hydronic, and ground-source systems explained for BC climates.',
    pubDate: '2026-03-17',
    category: 'Guide',
  },
  {
    slug: '/guides/understanding-heat-pump-ratings',
    title: 'Understanding SEER, HSPF & COP Ratings',
    description: 'What efficiency ratings mean, how to compare them, and why COP at -15°C matters most for BC.',
    pubDate: '2026-03-17',
    category: 'Technical',
  },
  {
    slug: '/guides/mitsubishi-vs-daikin-bc',
    title: 'Mitsubishi vs. Daikin Heat Pumps in BC',
    description: 'Head-to-head comparison of pricing, cold climate performance, warranty, and dealer networks in BC.',
    pubDate: '2026-03-17',
    category: 'Brand Comparison',
  },
  {
    slug: '/guides/bc-step-code-summary',
    title: 'The 2026 BC Step Code: What Homeowners & Builders Need to Know',
    description: 'ZCSC emission levels, TEDI requirements, and municipal adoption timelines affecting heat pump installations.',
    pubDate: '2026-02-16',
    category: 'Compliance',
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const items = feedItems
    .map(item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}${item.slug}</link>
      <guid isPermaLink="true">${SITE_URL}${item.slug}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <category>${escapeXml(item.category)}</category>
    </item>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-ca</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
