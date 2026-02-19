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

export function HomepageJsonLd() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Canadian Heat Pump Hub',
      url: 'https://canadianheatpumphub.ca',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://canadianheatpumphub.ca/directory?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Canadian Heat Pump Hub',
      description: 'BC heat pump installer directory and educational resource',
      url: 'https://canadianheatpumphub.ca',
      areaServed: {
        '@type': 'State',
        name: 'British Columbia',
      },
      serviceType: 'Heat Pump Installer Directory',
    },
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
    </>
  );
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

export function ArticleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Organization',
      name: 'Canadian Heat Pump Hub',
      url: 'https://canadianheatpumphub.ca',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Canadian Heat Pump Hub',
      url: 'https://canadianheatpumphub.ca',
    },
    datePublished: datePublished,
    dateModified: dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://canadianheatpumphub.ca/guides/${slug}`,
    },
  };

  return <JsonLd data={data} />;
}
