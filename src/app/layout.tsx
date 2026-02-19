import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { OrganizationJsonLd } from '@/components/JsonLd';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://canadianheatpumphub.ca'),
  title: {
    default: 'BC Heat Pump Installers & Directory | Canadian Heat Pump Hub',
    template: '%s | Canadian Heat Pump Hub',
  },
  description: 'Find BC heat pump installers, compare costs, and calculate ROI. Complete guides on air-to-water heat pumps, boiler replacement, hybrid systems, and 2026 rebates. Climate-specific advice for Vancouver, Victoria, Kelowna, and all BC cities.',
  alternates: {
    canonical: 'https://canadianheatpumphub.ca',
  },
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
        <GoogleAnalytics />
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
