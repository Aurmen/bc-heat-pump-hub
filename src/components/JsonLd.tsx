import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Canadian Heat Pump Hub',
    url: 'https://canadianheatpumphub.ca',
    description: 'Educational resource for heat pump and boiler replacement decisions in Canada',
  };

  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

export function LocalBusinessJsonLd({
  name,
  url,
  phone,
  city,
  region
}: {
  name: string;
  url?: string;
  phone?: string;
  city: string;
  region: string;
}) {
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'BC',
      addressCountry: 'CA',
    },
  };

  if (url) data.url = url;
  if (phone) data.telephone = phone;

  return <JsonLd data={data} />;
}
