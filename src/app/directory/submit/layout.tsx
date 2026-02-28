import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Your Business to the BC Heat Pump Directory | Canadian Heat Pump Hub',
  description: 'Submit your heat pump or boiler installation company for listing in BC\'s verified contractor directory. Free listing with TSBC credential verification.',
  alternates: { canonical: 'https://canadianheatpumphub.ca/directory/submit' },
};

export default function DirectorySubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
