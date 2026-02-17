import type { Metadata } from 'next';
import Link from 'next/link';
import ArticleMeta from '@/components/ArticleMeta';

export const metadata: Metadata = {
  title: 'Heat Pump Brand Comparison - BC 2026 | Canadian Heat Pump Hub',
  description: 'Compare top heat pump brands available in BC: Mitsubishi, Daikin, Fujitsu, Carrier, Lennox. Pricing, efficiency ratings, warranty, and reliability data for Canadian climate.',
};

const brands = [
  {
    name: "Mitsubishi Electric",
    logo: "🔴",
    priceRange: "$4,500 - $7,500",
    type: "Ductless Mini-Split",
    seer: "Up to 33.1",
    hspf: "Up to 14.0",
    coldClimateCOP: "3.2 at -15°C",
    warranty: "12 years parts, 12 years compressor",
    strengths: ["Industry-leading cold climate performance", "Hyper-Heat models rated to -30°C", "Quiet operation (19-21 dB)", "Excellent build quality"],
    weaknesses: ["Premium pricing", "Proprietary parts can be expensive"],
    availability: "Excellent",
    reliability: "5/5",
    notes: "Top choice for BC's varied climates. Hyper-Heat series excels in Interior regions.",
    recommendedFor: "Cold climates, premium builds, long-term reliability"
  },
  {
    name: "Daikin",
    logo: "🔵",
    priceRange: "$4,000 - $7,000",
    type: "Ductless Mini-Split & Ducted",
    seer: "Up to 30.5",
    hspf: "Up to 13.5",
    coldClimateCOP: "2.9 at -15°C",
    warranty: "12 years parts, 12 years compressor",
    strengths: ["World's largest HVAC manufacturer", "Strong cold climate performance", "Wide product range", "Good installer network in BC"],
    weaknesses: ["Slightly noisier than Mitsubishi", "Mid-tier pricing with premium expectations"],
    availability: "Excellent",
    reliability: "4.5/5",
    notes: "Daikin acquired Goodman/Amana. Excellent value for performance.",
    recommendedFor: "Coastal and Interior BC, balanced cost-performance"
  },
  {
    name: "Fujitsu",
    logo: "⚪",
    priceRange: "$3,800 - $6,500",
    type: "Ductless Mini-Split",
    seer: "Up to 29.0",
    hspf: "Up to 12.5",
    coldClimateCOP: "2.7 at -15°C",
    warranty: "10 years parts, 12 years compressor",
    strengths: ["Compact indoor units", "Good value pricing", "Reliable performance", "Halcyon series well-regarded"],
    weaknesses: ["Lower cold climate performance than Mitsubishi", "Shorter parts warranty"],
    availability: "Good",
    reliability: "4/5",
    notes: "Solid mid-range option. Best suited for coastal BC climates.",
    recommendedFor: "Coastal BC (Vancouver, Victoria), budget-conscious buyers"
  },
  {
    name: "Carrier",
    logo: "🟢",
    priceRange: "$4,200 - $7,200",
    type: "Ductless & Central Ducted",
    seer: "Up to 26.0",
    hspf: "Up to 12.0",
    coldClimateCOP: "2.5 at -15°C",
    warranty: "10 years parts, 10 years compressor",
    strengths: ["Strong ducted central systems", "Good for existing ductwork retrofits", "Established dealer network", "Greenspeed Intelligence tech"],
    weaknesses: ["Ductless lineup less competitive", "Lower SEER/HSPF than Asian brands"],
    availability: "Excellent",
    reliability: "4/5",
    notes: "Better for central ducted systems than ductless. Strong in retrofit market.",
    recommendedFor: "Homes with existing ductwork, central systems"
  },
  {
    name: "Lennox",
    logo: "🔴",
    priceRange: "$4,500 - $7,500",
    type: "Central Ducted",
    seer: "Up to 28.0",
    hspf: "Up to 13.5",
    coldClimateCOP: "2.6 at -15°C",
    warranty: "10 years parts, 10 years compressor",
    strengths: ["Premium ducted systems", "Variable-speed technology", "SunSource solar-ready models", "Strong North American presence"],
    weaknesses: ["Limited ductless options", "Premium pricing", "Fewer cold climate models"],
    availability: "Good",
    reliability: "4/5",
    notes: "Premium brand for central systems. Less focus on cold climate ductless.",
    recommendedFor: "Central ducted systems, new construction"
  },
  {
    name: "LG",
    logo: "⚫",
    priceRange: "$3,500 - $6,000",
    type: "Ductless Mini-Split",
    seer: "Up to 24.5",
    hspf: "Up to 11.5",
    coldClimateCOP: "2.4 at -15°C",
    warranty: "10 years parts, 10 years compressor",
    strengths: ["Competitive pricing", "Art Cool aesthetic models", "Wi-Fi connectivity standard", "Good warranty coverage"],
    weaknesses: ["Lower efficiency than premium brands", "Smaller installer network in BC", "Less cold climate focus"],
    availability: "Moderate",
    reliability: "3.5/5",
    notes: "Budget-friendly option with modern features. Best for mild climates.",
    recommendedFor: "Coastal BC, budget buyers, tech-focused homeowners"
  },
  {
    name: "Bosch",
    logo: "🔵",
    priceRange: "$5,000 - $8,500",
    type: "Air-to-Water (Hydronic)",
    seer: "N/A (hydronic)",
    hspf: "N/A (hydronic)",
    coldClimateCOP: "3.0 at -7°C",
    warranty: "10 years parts, 10 years heat exchanger",
    strengths: ["European hydronic expertise", "Excellent for radiant floor heating", "Modulating technology", "High build quality"],
    weaknesses: ["Very limited installer network in BC", "Higher upfront cost", "Requires hydronic heating system"],
    availability: "Poor",
    reliability: "4.5/5",
    notes: "Specialty product for hydronic (hot water) heating systems. Rare in BC but excellent quality.",
    recommendedFor: "Homes with radiant floors or hydronic radiators"
  }
];

// Product Schema for SEO
const productSchemas = brands.map(brand => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `${brand.name} Heat Pump`,
  "description": `${brand.name} heat pump for BC climate. ${brand.type}. HSPF: ${brand.hspf}. Price range: ${brand.priceRange}.`,
  "brand": {
    "@type": "Brand",
    "name": brand.name
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "CAD",
    "lowPrice": brand.priceRange.split(' - ')[0].replace(/[^0-9]/g, ''),
    "highPrice": brand.priceRange.split(' - ')[1].replace(/[^0-9]/g, ''),
    "availability": brand.availability === "Excellent" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": brand.reliability.split('/')[0],
    "bestRating": "5"
  }
}));

export default function BrandsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemas) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Brands</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Heat Pump Brand Comparison for BC
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive comparison of heat pump brands available in British Columbia. Pricing, efficiency, cold climate performance, warranty, and reliability data for 2026.
        </p>

        <ArticleMeta
          lastUpdated="2026-02-16"
          readTime="18 min read"
        />

        {/* Quick Comparison Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-12 overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Comparison Table</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-2 font-bold">Brand</th>
                <th className="text-left py-3 px-2 font-bold">Price Range</th>
                <th className="text-left py-3 px-2 font-bold">HSPF</th>
                <th className="text-left py-3 px-2 font-bold">Cold Climate COP</th>
                <th className="text-left py-3 px-2 font-bold">Reliability</th>
                <th className="text-left py-3 px-2 font-bold">Best For</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-2 font-semibold">{brand.logo} {brand.name}</td>
                  <td className="py-4 px-2 text-gray-700">{brand.priceRange}</td>
                  <td className="py-4 px-2 text-gray-700">{brand.hspf}</td>
                  <td className="py-4 px-2 text-gray-700">{brand.coldClimateCOP}</td>
                  <td className="py-4 px-2">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                      {brand.reliability}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-600 text-xs">{brand.recommendedFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Brand Reviews */}
        <div className="space-y-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Detailed Brand Analysis</h2>

          {brands.map((brand, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {/* Brand Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{brand.logo}</div>
                    <div>
                      <h3 className="text-2xl font-bold">{brand.name}</h3>
                      <div className="text-primary-100 text-sm">{brand.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{brand.priceRange}</div>
                    <div className="text-primary-100 text-sm">Installed (before rebates)</div>
                  </div>
                </div>
              </div>

              {/* Brand Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Heating Efficiency</div>
                    <div className="text-2xl font-bold text-blue-700">{brand.hspf}</div>
                    <div className="text-xs text-gray-600">HSPF Rating</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Cold Climate Performance</div>
                    <div className="text-2xl font-bold text-purple-700">{brand.coldClimateCOP}</div>
                    <div className="text-xs text-gray-600">COP at -15°C</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Reliability Score</div>
                    <div className="text-2xl font-bold text-green-700">{brand.reliability}</div>
                    <div className="text-xs text-gray-600">Industry Rating</div>
                  </div>
                </div>

                {/* Warranty */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="font-semibold text-gray-900 mb-2">🛡️ Warranty Coverage</div>
                  <div className="text-gray-700">{brand.warranty}</div>
                </div>

                {/* Strengths */}
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span>✅</span> Strengths
                  </h4>
                  <ul className="space-y-1">
                    {brand.strengths.map((strength, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-success-600 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Weaknesses
                  </h4>
                  <ul className="space-y-1">
                    {brand.weaknesses.map((weakness, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Notes */}
                <div className="bg-blue-50 border-l-4 border-primary-500 rounded p-4 mb-4">
                  <div className="font-semibold text-gray-900 mb-1">💡 Expert Notes</div>
                  <div className="text-gray-700 text-sm">{brand.notes}</div>
                </div>

                {/* Recommended For */}
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-gray-900">Best For:</span>
                  <span className="text-gray-700">{brand.recommendedFor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Buying Guide */}
        <div className="bg-gradient-to-br from-accent-50 to-orange-50 border-l-4 border-accent-500 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Choose the Right Brand</h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">1. Consider Your Climate Zone</h3>
              <p className="text-gray-700 text-sm">
                <strong>Coastal BC (Vancouver, Victoria):</strong> All brands perform well. Prioritize efficiency (SEER/HSPF) and features.<br/>
                <strong>Interior BC (Kelowna, Kamloops):</strong> Focus on cold climate COP at -15°C. Mitsubishi Hyper-Heat or Daikin recommended.<br/>
                <strong>Northern BC (Prince George):</strong> Only top cold climate models. Mitsubishi Hyper-Heat essential.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">2. Match Budget to Performance Needs</h3>
              <p className="text-gray-700 text-sm">
                <strong>Premium ($6,000+):</strong> Mitsubishi, Daikin, Bosch - Best for cold climates and long-term ROI<br/>
                <strong>Mid-Range ($4,000-$6,000):</strong> Fujitsu, Carrier, Lennox - Good balance for most BC homes<br/>
                <strong>Budget ($3,500-$5,000):</strong> LG - Acceptable for mild coastal climates only
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">3. Verify Installer Network</h3>
              <p className="text-gray-700 text-sm">
                Check that local HVAC contractors are certified for your chosen brand. Limited installer availability can mean higher service costs and longer wait times for repairs.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">4. Prioritize Warranty Coverage</h3>
              <p className="text-gray-700 text-sm">
                12-year warranties (Mitsubishi, Daikin) provide better long-term value than 10-year warranties, especially for compressor replacement ($2,000-$3,500 cost).
              </p>
            </div>
          </div>
        </div>

        {/* Related Resources */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/calculator" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> ROI Calculator
            </Link>
            <Link href="/rebates" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> 2026 Rebates Guide
            </Link>
            <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> Find Certified Installers
            </Link>
            <Link href="/guides/heat-pump-vs-boiler-bc" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
              <span>→</span> Heat Pumps vs Boilers
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
