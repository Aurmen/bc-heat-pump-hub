import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Service',
  description: 'Privacy policy and terms of service for Canadian Heat Pump Hub. How we collect, use, and protect your information.',
  alternates: { canonical: 'https://canadianheatpumphub.ca/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy &amp; Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-12">Last updated: March 2026 &mdash; Operator: Aelric Technologies Inc., British Columbia, Canada</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Information We Collect</h3>
        <p className="text-gray-700 mb-4">
          When you use the Ghost Load Auditor or contact form, we collect the information you submit
          directly: name, email address, postal code, and the load calculation inputs you provide
          (panel size, appliance wattages, square footage). We do not collect payment card details —
          payments are processed by Stripe and subject to{' '}
          <a href="https://stripe.com/en-ca/privacy" className="text-primary-600 underline" target="_blank" rel="noopener noreferrer">
            Stripe&apos;s Privacy Policy
          </a>.
        </p>
        <p className="text-gray-700 mb-4">
          We also collect standard server logs (IP address, browser type, pages visited) via Vercel
          infrastructure, and aggregate analytics via Google Analytics. Google Analytics data is
          anonymized and subject to{' '}
          <a href="https://policies.google.com/privacy" className="text-primary-600 underline" target="_blank" rel="noopener noreferrer">
            Google&apos;s Privacy Policy
          </a>.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">How We Use Your Information</h3>
        <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
          <li>To deliver your Ghost Load Audit report by email.</li>
          <li>To connect you with licensed BC heat pump contractors if you request a referral.</li>
          <li>To improve the accuracy of our load calculation tools.</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p className="text-gray-700 mb-4">
          We do not sell your personal information to third parties. We do not share your data with
          contractors without your explicit consent (the checkbox on the audit form).
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Data Retention</h3>
        <p className="text-gray-700 mb-4">
          Audit submissions are retained in our secure inbox for up to 24 months to support any
          follow-up questions about your report. You may request deletion at any time by emailing{' '}
          <a href="mailto:contact@canadianheatpumphub.ca" className="text-primary-600 underline">
            contact@canadianheatpumphub.ca
          </a>.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Cookies</h3>
        <p className="text-gray-700 mb-4">
          We use cookies for Google Analytics (analytics) and Stripe (payment processing). No
          tracking or advertising cookies are set by canadianheatpumphub.ca itself. You can disable
          cookies in your browser settings; this will not affect your ability to use the site.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Your Rights (PIPEDA &amp; BC PIPA)</h3>
        <p className="text-gray-700 mb-4">
          Under Canadian federal PIPEDA and BC&apos;s Personal Information Protection Act, you have
          the right to access, correct, or request deletion of your personal information. Contact us
          at{' '}
          <a href="mailto:contact@canadianheatpumphub.ca" className="text-primary-600 underline">
            contact@canadianheatpumphub.ca
          </a>{' '}
          with any privacy requests.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Nature of the Service</h3>
        <p className="text-gray-700 mb-4">
          Canadian Heat Pump Hub provides educational content, a contractor directory, and
          mathematical load calculation tools (the &ldquo;Ghost Load Auditor&rdquo;). All outputs
          are estimates based on user-supplied inputs and are for informational purposes only.
        </p>
        <p className="text-gray-700 mb-4">
          <strong>The Ghost Load Auditor applies CEC Rule 8-200 Optional Method calculations.
          Results are not a formal electrical permit, a professional engineer&apos;s declaration, or
          a utility service assessment.</strong> Final technical verification and a physical site
          inspection by a licensed electrical contractor are always required before any equipment
          installation.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Contractor Directory</h3>
        <p className="text-gray-700 mb-4">
          Contractor listings are sourced from the Technical Safety BC (TSBC) public registry and
          are provided for informational purposes. Inclusion in the directory does not constitute an
          endorsement. Always verify contractor credentials, insurance, and licensing directly with
          TSBC before engaging any contractor.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Rebate &amp; Cost Estimates</h3>
        <p className="text-gray-700 mb-4">
          Rebate amounts, eligibility criteria, and cost ranges are updated periodically but may not
          reflect the most current program details. Always verify directly with{' '}
          <a href="https://betterhomesbc.ca" className="text-primary-600 underline" target="_blank" rel="noopener noreferrer">
            betterhomesbc.ca
          </a>{' '}
          and BC Hydro before making financial decisions.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Limitation of Liability</h3>
        <p className="text-gray-700 mb-4">
          To the maximum extent permitted by applicable law, Aelric Technologies Inc. is not liable
          for any damages arising from reliance on information provided by this site. Use of this
          site is at your own risk.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Governing Law</h3>
        <p className="text-gray-700 mb-4">
          These terms are governed by the laws of British Columbia, Canada.
        </p>
      </section>

      <div className="border-t border-gray-200 pt-8">
        <p className="text-sm text-gray-500">
          Questions?{' '}
          <Link href="/contact" className="text-primary-600 underline">
            Contact us
          </Link>{' '}
          or email{' '}
          <a href="mailto:contact@canadianheatpumphub.ca" className="text-primary-600 underline">
            contact@canadianheatpumphub.ca
          </a>.
        </p>
      </div>
    </div>
  );
}
