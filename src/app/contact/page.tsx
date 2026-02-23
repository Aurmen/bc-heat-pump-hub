import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Canadian Heat Pump Hub. Submit corrections, ask questions, or add your business to our directory.',
  alternates: { canonical: 'https://canadianheatpumphub.ca/contact' },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-xl text-gray-600 mb-8">
        We're here to help homeowners and contractors navigate heat pump decisions in BC.
      </p>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* General Inquiries */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">General Inquiries</h2>
          <p className="text-gray-600 mb-4">
            Questions about our guides, rebate information, or general heat pump inquiries.
          </p>
          <a
            href="mailto:contact@canadianheatpumphub.ca"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            contact@canadianheatpumphub.ca →
          </a>
        </div>

        {/* Submit Your Business */}
        <div className="bg-white border border-accent-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🏢</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Add Your Business</h2>
          <p className="text-gray-600 mb-4">
            Heat pump or boiler contractor? Get listed in our directory.
          </p>
          <Link
            href="/directory/submit"
            className="text-accent-600 hover:text-accent-700 font-semibold"
          >
            Submit Your Business →
          </Link>
        </div>
      </div>

      {/* What We Can Help With */}
      <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-xl p-8 mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">What We Can Help With</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-success-600 font-bold text-xl">✓</span>
            <div>
              <p className="font-semibold text-gray-900">Directory Updates</p>
              <p className="text-sm text-gray-600">Corrections to contractor information</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-success-600 font-bold text-xl">✓</span>
            <div>
              <p className="font-semibold text-gray-900">Content Questions</p>
              <p className="text-sm text-gray-600">Clarifications about our guides</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-success-600 font-bold text-xl">✓</span>
            <div>
              <p className="font-semibold text-gray-900">Business Listings</p>
              <p className="text-sm text-gray-600">Add or update contractor profiles</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-success-600 font-bold text-xl">✓</span>
            <div>
              <p className="font-semibold text-gray-900">Partnership Inquiries</p>
              <p className="text-sm text-gray-600">Collaboration opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Can't Help With */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-12">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-gray-900 mb-2">What We Can't Help With</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Engineering advice or system design (consult licensed HVAC professionals)</li>
              <li>• Product endorsements or specific contractor recommendations</li>
              <li>• Troubleshooting existing heat pump or boiler systems</li>
              <li>• Rebate application processing (contact CleanBC or FortisBC directly)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Response Time</h3>
        <p className="text-gray-600 mb-4">
          We typically respond to inquiries within 2-3 business days. For urgent contractor
          listing updates, please include "URGENT" in your email subject line.
        </p>
        <p className="text-sm text-gray-500">
          Note: This is an educational resource maintained by a small team. For immediate heat pump
          emergencies, contact a local HVAC contractor directly.
        </p>
      </div>
    </div>
  );
}
