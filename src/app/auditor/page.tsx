import type { Metadata } from 'next';
import GhostLoadAuditor from '@/components/GhostLoadAuditor';

export const metadata: Metadata = {
  title: 'Ghost Load Auditor — CEC 8-200 Panel Check | Canadian Heat Pump Hub',
  description:
    'Find out if your 100A panel can handle a heat pump and EV charger. Free CEC Rule 8-200 load calculation for BC homeowners.',
};

export default function AuditorPage() {
  return (
    <>
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
