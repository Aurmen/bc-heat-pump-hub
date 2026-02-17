import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { OrganizationJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL('https://canadianheatpumphub.ca'),
  title: {
    default: 'Canadian Heat Pump Hub | Heat Pump & Boiler Replacement Guide',
    template: '%s | Canadian Heat Pump Hub',
  },
  description: 'Educational resource for Canadian homeowners considering heat pump installation, air-to-water heat pumps, boiler replacement, and hybrid heating systems. Honest ROI analysis.',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://canadianheatpumphub.ca',
    siteName: 'Canadian Heat Pump Hub',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <OrganizationJsonLd />
      </head>
      <body>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
