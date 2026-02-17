import type { Metadata } from 'next';
import Link from 'next/link';
import ArticleMeta from '@/components/ArticleMeta';

export const metadata: Metadata = {
  title: 'BC Heat Pump Rebates 2026 - Complete Guide | Canadian Heat Pump Hub',
  description: 'Complete guide to heat pump rebates in British Columbia for 2026. CleanBC, federal grants, income-qualified programs, and utility rebates. Up to $16,000 available.',
};

export default function RebatesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span>Rebates</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        BC Heat Pump Rebates 2026
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Complete guide to heat pump rebates, grants, and financing available to British Columbia homeowners. Updated for 2026.
      </p>

      <ArticleMeta
        lastUpdated="2026-02-16"
        readTime="15 min read"
      />

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
        <p className="text-sm text-gray-800">
          <strong>Important Update (2025-2026):</strong> Many BC heat pump rebate programs have been reduced or discontinued. CleanBC rebates for switching from natural gas ended April 11, 2025. Federal programs continue but with reduced funding. Verify current availability before planning your budget. This guide reflects the latest information as of early 2026.
        </p>
      </div>

      {/* Quick Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Maximum Available Rebates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Standard Household</p>
            <p className="text-3xl font-bold text-primary-600">Up to $6,000</p>
            <p className="text-sm text-gray-600 mt-1">Federal + Provincial programs</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Income-Qualified Household</p>
            <p className="text-3xl font-bold text-primary-600">Up to $16,000+</p>
            <p className="text-sm text-gray-600 mt-1">Enhanced rebates + interest-free loan</p>
          </div>
        </div>
      </div>

      {/* Federal Programs */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Federal Programs (Canada-Wide)</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Canada Greener Homes Grant</h3>
          <p className="text-gray-700 mb-4">
            Federal grant for home energy retrofits including heat pumps. Requires pre- and post-retrofit EnerGuide evaluations.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Air-source heat pump:</span>
              <span className="text-primary-600 font-bold">Up to $5,000</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Cold climate air-source:</span>
              <span className="text-primary-600 font-bold">Up to $5,000</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Ground-source (geothermal):</span>
              <span className="text-primary-600 font-bold">Up to $5,000</span>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Requirements:</strong> Must complete EnerGuide evaluation ($600-$800) before and after installation. Rebate covers evaluation costs plus equipment. Apply through NRCan registered service organization.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Canada Greener Homes Loan</h3>
          <p className="text-gray-700 mb-4">
            Interest-free loan to help finance energy retrofits, including heat pump installations.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Loan amount:</span>
              <span className="text-primary-600 font-bold">Up to $40,000</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Interest rate:</span>
              <span className="text-green-600 font-bold">0% (interest-free)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Repayment period:</span>
              <span>Up to 10 years</span>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Eligibility:</strong> Must participate in Canada Greener Homes Grant program. Loan can cover costs beyond grant amount. No fees, no interest, flexible repayment.
            </p>
          </div>
        </div>
      </section>

      {/* Provincial Programs (BC) */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Provincial Programs (British Columbia)</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">CleanBC Better Homes & Heat Pump Program</h3>
          <p className="text-gray-700 mb-4">
            Provincial rebates for BC homeowners installing heat pumps. <strong>Note: Many rebate pathways ended April 11, 2025.</strong>
          </p>

          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>Program Changes (2025):</strong> Rebates for switching from natural gas, oil, wood, or propane to electric heat pumps ended April 11, 2025. You may still apply if work was completed or quoted before this date. Income-qualified programs continue with enhanced rebates.
            </p>
          </div>

          <h4 className="font-bold text-gray-900 mb-2">Income-Qualified Rebates (Continuing)</h4>
          <p className="text-sm text-gray-600 mb-3">
            Households below income thresholds qualify for enhanced rebates up to 100% of installation costs (maximum $16,000).
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Ductless heat pump:</span>
              <span className="text-primary-600 font-bold">Up to $6,000</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Ducted heat pump:</span>
              <span className="text-primary-600 font-bold">Up to $11,000</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Air-to-water heat pump:</span>
              <span className="text-primary-600 font-bold">Up to $16,000</span>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Income Thresholds (2026):</strong>
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• 1-2 people: $55,000 household income</li>
              <li>• 3-4 people: $72,000 household income</li>
              <li>• 5+ people: $88,000 household income</li>
            </ul>
            <p className="text-xs text-gray-600 mt-2">
              Note: Thresholds may be adjusted. Verify current limits at betterhomesbc.ca
            </p>
          </div>
        </div>
      </section>

      {/* Utility Rebates */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Utility Company Rebates</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">FortisBC Rebates</h3>
          <p className="text-gray-700 mb-4">
            FortisBC (natural gas and electricity utility) offers rebates for energy-efficient upgrades.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Status Update:</strong> FortisBC's Dual Fuel Heating System Rebate ($5,000) ended December 18, 2025. Check FortisBC website for current programs and availability.
            </p>
          </div>

          <p className="text-sm text-gray-700">
            <strong>Who qualifies:</strong> FortisBC natural gas or electricity customers in BC.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Website:</strong> <a href="https://www.fortisbc.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">fortisbc.com</a> (verify current programs)
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">BC Hydro</h3>
          <p className="text-gray-700 mb-4">
            BC Hydro may offer heat pump incentives or efficiency programs. Availability varies by year.
          </p>
          <p className="text-sm text-gray-700">
            <strong>Check:</strong> <a href="https://www.bchydro.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">bchydro.com/rebates</a> for current offers.
          </p>
        </div>
      </section>

      {/* Municipal Programs */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Municipal Programs (City-Specific)</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">City of Vancouver</h3>
          <p className="text-gray-700 mb-2">
            City of Vancouver has offered heat pump top-up rebates in the past ($3,000 additional). Program availability changes annually.
          </p>
          <p className="text-sm text-gray-700">
            <strong>Check:</strong> <a href="https://vancouver.ca/home-property-development/heat-pump.aspx" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">vancouver.ca</a> for current programs.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">City of Richmond</h3>
          <p className="text-gray-700 mb-2">
            Richmond offered a $350 top-up for residents switching from fossil fuels to electric heat pumps. <strong>Program ended April 11, 2025.</strong>
          </p>
          <p className="text-sm text-gray-700">
            Applications accepted for work completed before end date. Check City of Richmond website for future programs.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-700">
            <strong>Other Municipalities:</strong> Victoria, Saanich, Burnaby, Surrey, and other BC municipalities may offer rebates or financing. Check your local government website for available programs.
          </p>
        </div>
      </section>

      {/* How to Apply */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Apply for Rebates</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Step-by-Step Application Process</h3>
          <ol className="space-y-4">
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</span>
              <div>
                <p className="font-semibold text-gray-900">Check Eligibility</p>
                <p className="text-sm text-gray-700">Verify you meet income thresholds (if applying for enhanced rebates), fuel source requirements, and property type qualifications.</p>
              </div>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</span>
              <div>
                <p className="font-semibold text-gray-900">Pre-Retrofit Energy Assessment (Federal Programs)</p>
                <p className="text-sm text-gray-700">Book EnerGuide evaluation through registered service organization ($600-$800, cost reimbursed through grant).</p>
              </div>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</span>
              <div>
                <p className="font-semibold text-gray-900">Get Quotes from Licensed Installers</p>
                <p className="text-sm text-gray-700">Obtain 2-3 quotes from qualified, licensed HVAC contractors. Ensure installers are HPCN-certified for best results.</p>
              </div>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</span>
              <div>
                <p className="font-semibold text-gray-900">Reserve Rebate (Provincial Programs)</p>
                <p className="text-sm text-gray-700">For CleanBC programs, reserve your rebate BEFORE installation through Better Homes BC portal. You have 120 days to complete work after reservation.</p>
              </div>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">5</span>
              <div>
                <p className="font-semibold text-gray-900">Complete Installation</p>
                <p className="text-sm text-gray-700">Have qualified contractor install heat pump. Keep all receipts, invoices, and technical specifications.</p>
              </div>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">6</span>
              <div>
                <p className="font-semibold text-gray-900">Post-Retrofit Evaluation (Federal Programs)</p>
                <p className="text-sm text-gray-700">Complete post-installation EnerGuide evaluation to verify energy improvements.</p>
              </div>
            </li>
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">7</span>
              <div>
                <p className="font-semibold text-gray-900">Submit Rebate Claims</p>
                <p className="text-sm text-gray-700">Submit completed applications with required documentation (invoices, proof of payment, technical specs, photos). Processing takes 4-8 weeks.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Stacking Rebates */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Maximizing Rebates: Can You Stack Programs?</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            <strong>Yes!</strong> You can combine multiple rebate programs to maximize savings. Here's how:
          </p>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded border border-green-200">
              <p className="font-semibold text-gray-900 mb-2">Example: Income-Qualified Household in Vancouver</p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• CleanBC Income-Qualified: <strong className="text-green-600">$16,000</strong></li>
                <li>• Federal Greener Homes Grant: <strong className="text-green-600">$5,000</strong></li>
                <li>• Federal Greener Homes Loan: <strong className="text-green-600">$40,000 interest-free</strong></li>
                <li className="pt-2 border-t mt-2">
                  <strong>Total Support: Up to $21,000 in grants + $40,000 loan (0% interest)</strong>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-700">
              Note: Total rebates cannot exceed installation cost. Verify program compatibility before applying (some programs have restrictions on stacking).
            </p>
          </div>
        </div>
      </section>

      {/* Key Deadlines */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Important Deadlines & Program Status (2026)</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-900">CleanBC Standard Rebates (Natural Gas Switch)</p>
              <p className="text-sm text-gray-700">Status: <span className="text-red-600 font-bold">ENDED April 11, 2025</span></p>
              <p className="text-xs text-gray-600 mt-1">Applications still accepted for work completed/quoted before end date.</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-900">CleanBC Income-Qualified Program</p>
              <p className="text-sm text-gray-700">Status: <span className="text-green-600 font-bold">ACTIVE (2026)</span></p>
              <p className="text-xs text-gray-600 mt-1">Funding subject to availability. Apply early to secure reservation.</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-semibold text-gray-900">Canada Greener Homes Grant</p>
              <p className="text-sm text-gray-700">Status: <span className="text-green-600 font-bold">ACTIVE (2026)</span></p>
              <p className="text-xs text-gray-600 mt-1">Federal program continuing through 2026. Funding limits apply.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">FortisBC Dual Fuel Rebate</p>
              <p className="text-sm text-gray-700">Status: <span className="text-red-600 font-bold">ENDED December 18, 2025</span></p>
              <p className="text-xs text-gray-600 mt-1">Check FortisBC website for new programs in 2026.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Official Rebate Resources</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <ul className="space-y-3">
            <li>
              <a href="https://www.betterhomesbc.ca" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-semibold">
                Better Homes BC
              </a>
              <p className="text-sm text-gray-700">Provincial CleanBC rebates, income-qualified programs, application portal</p>
            </li>
            <li>
              <a href="https://www.nrcan.gc.ca/energy-efficiency/homes/canada-greener-homes-grant/23441" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-semibold">
                Canada Greener Homes Grant
              </a>
              <p className="text-sm text-gray-700">Federal grant program, EnerGuide evaluations, application process</p>
            </li>
            <li>
              <a href="https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/funding-programs/all-funding-programs/canada-greener-homes-loan" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-semibold">
                Canada Greener Homes Loan
              </a>
              <p className="text-sm text-gray-700">Interest-free loan up to $40,000, eligibility requirements</p>
            </li>
            <li>
              <a href="https://www.fortisbc.com/rebates" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-semibold">
                FortisBC Rebates
              </a>
              <p className="text-sm text-gray-700">Utility company rebates and efficiency programs</p>
            </li>
            <li>
              <a href="https://www.bchydro.com/rebates" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-semibold">
                BC Hydro Rebates
              </a>
              <p className="text-sm text-gray-700">BC Hydro customer programs and incentives</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Related Pages */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/guides/cost-heat-pump-installation-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Heat Pump Installation Costs
            </h3>
            <p className="text-gray-600 text-sm">
              Full cost breakdown BEFORE and AFTER rebates.
            </p>
          </Link>

          <Link
            href="/faq"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Heat Pump FAQ
            </h3>
            <p className="text-gray-600 text-sm">
              Common questions about costs, efficiency, and ROI.
            </p>
          </Link>

          <Link
            href="/directory"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find a Qualified Installer
            </h3>
            <p className="text-gray-600 text-sm">
              Browse verified heat pump installers across BC.
            </p>
          </Link>

          <Link
            href="/guides/heat-pump-vs-boiler-bc"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Heat Pump vs Boiler
            </h3>
            <p className="text-gray-600 text-sm">
              Compare costs, efficiency, and ROI for your situation.
            </p>
          </Link>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-12 bg-blue-50 border-l-4 border-primary-500 p-6">
        <p className="text-sm text-gray-700">
          <strong>Questions about rebates?</strong> Email us at{' '}
          <a href="mailto:contact@canadianheatpumphub.ca" className="text-primary-600 hover:text-primary-700">
            contact@canadianheatpumphub.ca
          </a>
        </p>
      </div>

      <div className="disclaimer mt-12">
        <p className="font-semibold mb-2">Disclaimer</p>
        <p>
          Rebate information is provided for educational purposes and may change without notice.
          Always verify current program availability, eligibility requirements, and rebate amounts
          with official program websites before making purchasing decisions. Rebate amounts shown
          are maximums; actual rebates depend on system type, installation costs, and eligibility.
          This site is not affiliated with any government rebate program.
        </p>
      </div>
    </div>
  );
}
