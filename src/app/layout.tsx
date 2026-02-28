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
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://canadianheatpumphub.ca',
    siteName: 'Canadian Heat Pump Hub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Canadian Heat Pump Hub — BC Heat Pump Installer Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BC Heat Pump Installers & Directory | Canadian Heat Pump Hub',
    description: 'Find BC heat pump installers, compare costs, and calculate ROI. Climate-specific guides for Vancouver, Victoria, Kelowna, and all BC cities.',
    images: ['/og-image.png'],
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
