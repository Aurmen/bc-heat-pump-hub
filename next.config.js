/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  serverExternalPackages: ['@react-pdf/renderer'],
  experimental: {
    mdxRs: false,
  },

  async redirects() {
    const DEST = 'https://heatpumplocator.com';

    return [
      // ── Static pages ─────────────────────────────────────────────
      { source: '/', destination: DEST, permanent: true },
      { source: '/auditor', destination: `${DEST}/auditor`, permanent: true },
      { source: '/auditor/success', destination: `${DEST}/auditor/success`, permanent: true },
      { source: '/privacy', destination: `${DEST}/privacy`, permanent: true },
      { source: '/contact', destination: DEST, permanent: true },
      { source: '/connect', destination: DEST, permanent: true },
      { source: '/faq', destination: `${DEST}/canada/faq`, permanent: true },
      { source: '/calculator', destination: `${DEST}/canada/calculator`, permanent: true },

      // ── Rebates ──────────────────────────────────────────────────
      { source: '/rebates', destination: `${DEST}/canada/rebates`, permanent: true },

      // ── Guides ───────────────────────────────────────────────────
      { source: '/guides', destination: `${DEST}/canada/guides`, permanent: true },
      { source: '/guides/lower-mainland', destination: `${DEST}/canada/guides`, permanent: true },
      { source: '/guides/vancouver-island', destination: `${DEST}/canada/guides`, permanent: true },
      { source: '/guides/interior-bc', destination: `${DEST}/canada/guides`, permanent: true },
      { source: '/guides/:slug', destination: `${DEST}/canada/guides/:slug`, permanent: true },

      // ── Directory ────────────────────────────────────────────────
      { source: '/directory', destination: `${DEST}/canada/directory`, permanent: true },
      { source: '/directory/submit', destination: `${DEST}/directory/submit`, permanent: true },
      { source: '/directory/:slug', destination: `${DEST}/canada/directory/:slug`, permanent: true },

      // ── BC regions & cities ──────────────────────────────────────
      { source: '/bc', destination: `${DEST}/canada/bc`, permanent: true },
      { source: '/bc/:region', destination: `${DEST}/canada/bc/:region`, permanent: true },
      { source: '/bc/:region/:city', destination: `${DEST}/canada/bc/:region/:city`, permanent: true },

      // ── Brands ───────────────────────────────────────────────────
      { source: '/brands', destination: `${DEST}/canada/brands`, permanent: true },
      { source: '/brands/:slug', destination: `${DEST}/canada/brands/:slug`, permanent: true },

      // ── Repair ───────────────────────────────────────────────────
      { source: '/repair', destination: `${DEST}/canada/repair`, permanent: true },
      { source: '/repair/:city', destination: `${DEST}/canada/repair/:city`, permanent: true },

      // ── Service ──────────────────────────────────────────────────
      { source: '/service', destination: `${DEST}/canada/service`, permanent: true },

      // ── Supply Houses ────────────────────────────────────────────
      { source: '/supply-houses', destination: `${DEST}/canada/supply-houses`, permanent: true },
      { source: '/supply-houses/:slug', destination: `${DEST}/canada/supply-houses/:slug`, permanent: true },

      // ── Case Studies ─────────────────────────────────────────────
      { source: '/case-studies', destination: `${DEST}/canada/case-studies`, permanent: true },
      { source: '/case-studies/:slug', destination: `${DEST}/canada/case-studies/:slug`, permanent: true },

      // ── Standalone SEO pages ─────────────────────────────────────
      { source: '/bc-heat-pump-installers', destination: `${DEST}/canada/directory`, permanent: true },
      { source: '/cold-climate-heat-pump-bc', destination: `${DEST}/canada/guides/best-cold-climate-heat-pump-bc-2026`, permanent: true },
      { source: '/heat-pump-cost-bc', destination: `${DEST}/canada/guides/cost-heat-pump-installation-bc`, permanent: true },
    ];
  },
}

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-gfm').default],
    rehypePlugins: [],
  },
})

module.exports = withMDX(nextConfig)
