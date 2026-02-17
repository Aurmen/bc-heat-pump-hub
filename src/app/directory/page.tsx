import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllListings } from '@/lib/utils';
import DirectoryFilters from '@/components/DirectoryFilters';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'BC Heat Pump & Boiler Installer Directory',
  description: 'Browse heat pump and boiler replacement installers across British Columbia. Filter by city and service type.',
};

export default function DirectoryPage() {
  const listings = getAllListings();

  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Directory', url: 'https://canadianheatpumphub.ca/directory' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>Directory</span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BC Installer Directory
            </h1>
            <p className="text-xl text-gray-600">
              Find heat pump and boiler replacement installers serving British Columbia.
            </p>
          </div>
          <Link
            href="/directory/submit"
            className="whitespace-nowrap bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            Add Your Company →
          </Link>
        </div>

        <DirectoryFilters listings={listings} />

        {/* CTA for Contractors */}
        <div className="mt-12 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Are you a heat pump installer?
              </h2>
              <p className="text-gray-700">
                Get found by homeowners searching for qualified contractors. Free basic listing.
              </p>
            </div>
            <Link
              href="/directory/submit"
              className="whitespace-nowrap bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Submit Your Company
            </Link>
          </div>
        </div>

        <div className="disclaimer mt-12">
          <p className="font-semibold mb-2">Disclaimer</p>
          <p>
            This directory is provided for informational purposes only. Listings do not constitute
            endorsements or recommendations. Always verify contractor licensing, insurance, and suitability
            for your specific project. Request multiple quotes and check references before hiring.
          </p>
        </div>
      </div>
    </>
  );
}
