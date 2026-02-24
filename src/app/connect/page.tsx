import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'Connect with a Technical Specialist | Canadian Heat Pump Hub',
  description:
    'Submit your heat pump inquiry to our technical curator. We review your project details and connect you with a verified local contractor in BC.',
  alternates: { canonical: 'https://canadianheatpumphub.ca/connect' },
};

export default function ConnectPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Connect', url: 'https://canadianheatpumphub.ca/connect' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-10">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Connect</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wide mb-5">
            Technical Review
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Connect with a Technical Specialist
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Submit your project details below. A technical curator will review your inquiry and connect you with a verified local contractor — typically within 1–2 business days.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            What Happens Next
          </h2>
          <ol className="space-y-3">
            {[
              'Your inquiry is reviewed by our technical curator — not an algorithm.',
              'We match your project type and city to a verified, licensed BC contractor.',
              'The contractor contacts you directly to schedule a site visit or quote.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Form — wrapped in Suspense for useSearchParams */}
        <Suspense fallback={
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        }>
          <LeadCaptureForm />
        </Suspense>

        {/* Verify contractor note */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            All contractors in our network are checked against Technical Safety BC. You can independently verify any contractor at{' '}
            <a
              href="https://www.technicalsafetybc.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              technicalsafetybc.ca
            </a>
            . We do not guarantee the quality, pricing, or availability of any contractor referral.
          </p>
          <div className="mt-4 flex gap-4">
            <Link href="/guides" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Back to Guides →
            </Link>
            <Link href="/directory" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Browse Directory →
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}
