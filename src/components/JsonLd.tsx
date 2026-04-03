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
    name: 'HeatPumpLocator',
    url: 'https://heatpumplocator.com',
    description: 'Educational resource for heat pump and boiler replacement decisions in Canada',
    logo: {
      '@type': 'ImageObject',
      url: 'https://heatpumplocator.com/og-image.png',
      width: 1200,
      height: 630,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://heatpumplocator.com/directory/submit',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'British Columbia',
      addressCountry: 'CA',
    },
    sameAs: [],
  };

  return <JsonLd data={data} />;
}

export function HomepageJsonLd() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'HeatPumpLocator',
      url: 'https://heatpumplocator.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://heatpumplocator.com/directory?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'HeatPumpLocator',
      description: 'Heat pump installer directory, rebate finder, and educational resource',
      url: 'https://heatpumplocator.com',
      areaServed: [
        { '@type': 'Country', name: 'Canada' },
        { '@type': 'Country', name: 'United States' },
      ],
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

export function TechnicalArticleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  keywords,
}: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  keywords: string[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: description,
    keywords: keywords.join(', '),
    author: {
      '@type': 'Person',
      name: 'HeatPumpLocator — Mechanical Compliance Auditor',
      description: 'Red Seal Refrigeration Mechanic and Class A Gas Fitter',
      url: 'https://heatpumplocator.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HeatPumpLocator',
      url: 'https://heatpumplocator.com',
    },
    datePublished,
    dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://heatpumplocator.com/canada/case-studies/${slug}`,
    },
    about: {
      '@type': 'Thing',
      name: 'Mechanical Compliance Audit — BC Heat Pump Systems',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Building designers, mechanical contractors, and sophisticated homeowners in British Columbia',
    },
  };

  return <JsonLd data={data} />;
}

export function WebApplicationJsonLd({
  name,
  description,
  url,
  keywords,
}: {
  name: string;
  description: string;
  url: string;
  keywords: string[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    keywords: keywords.join(', '),
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CAD',
    },
    provider: {
      '@type': 'Organization',
      name: 'HeatPumpLocator',
      url: 'https://heatpumplocator.com',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'BC homeowners evaluating heat pump and EV charger installations',
    },
  };

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
      name: 'HeatPumpLocator',
      url: 'https://heatpumplocator.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HeatPumpLocator',
      url: 'https://heatpumplocator.com',
    },
    datePublished: datePublished,
    dateModified: dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://heatpumplocator.com/canada/guides/${slug}`,
    },
  };

  return <JsonLd data={data} />;
}
