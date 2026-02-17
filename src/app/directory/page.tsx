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

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          BC Installer Directory
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find heat pump and boiler replacement installers serving British Columbia.
        </p>

        <DirectoryFilters listings={listings} />

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
