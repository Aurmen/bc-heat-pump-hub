import type { Metadata } from 'next';
import GhostLoadAuditor from '@/components/GhostLoadAuditor';
import { WebApplicationJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Heat Pump Replacement Cost BC — Check Panel Capacity First',
  description:
    'Before you get a heat pump quote, run a CEC 8-200 load calculation. The Ghost Load Auditor tells you what your panel can handle — 10 minutes, $24.99.',
  alternates: { canonical: 'https://canadianheatpumphub.ca/auditor' },
  keywords: [
    'CEC 8-200 load calculation',
    '100 amp panel heat pump BC',
    'electrical panel feasibility',
    'heat pump panel upgrade BC',
    'CEC Rule 8-200 Optional Method',
    'residential load calculation BC',
    'EV charger heat pump 100A panel',
    'CleanBC ESU rebate panel upgrade',
  ],
};

export default function AuditorPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://canadianheatpumphub.ca' },
    { name: 'Ghost Load Auditor', url: 'https://canadianheatpumphub.ca/auditor' },
  ];

  return (
    <>
      <WebApplicationJsonLd
        name="Ghost Load Auditor — CEC 8-200 Panel Feasibility Tool"
        description="Free CEC Rule 8-200 Optional Method load calculation. Determine if your 100A panel can support a heat pump and EV charger before committing to equipment or permits."
        url="https://canadianheatpumphub.ca/auditor"
        keywords={[
          'CEC 8-200 load calculation',
          '100 amp panel heat pump',
          'electrical panel feasibility BC',
          'heat pump panel upgrade',
          'EV charger load calculation',
          'residential electrical load calculation',
          'CleanBC ESU rebate',
          'DCC-10 load management',
        ]}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-4">
            <span className="inline-block bg-primary-800/60 text-primary-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              CEC Rule 8-200 Optional Method
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Ghost Load Auditor
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl leading-relaxed">
            Determine whether your existing electrical service can safely carry a heat pump, EV
            charger, and full residential load — before you commit to equipment or permits.
          </p>
          <p className="text-sm text-primary-200 mt-3">
            Defaults pre-loaded for a typical 2,700 ft² BC home on a 100A panel.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
          <GhostLoadAuditor />
        </div>
      </div>
    </>
  );
}
