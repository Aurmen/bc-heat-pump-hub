import type { Metadata } from 'next';
import Link from 'next/link';
import ArticleMeta from '@/components/ArticleMeta';

export const metadata: Metadata = {
  title: 'Heat Pump Service & Repair Guide - BC 2026 | Canadian Heat Pump Hub',
  description: 'Complete guide to heat pump maintenance, repairs, parts, and service costs in BC. DIY maintenance tips, common problems, repair costs, and finding qualified technicians.',
};

const commonRepairs = [
  {
    problem: "Refrigerant Leak",
    symptoms: ["Reduced heating/cooling", "Ice buildup on outdoor unit", "Hissing sounds", "Higher energy bills"],
    cost: "$500 - $1,500",
    urgency: "High",
    diy: false,
    notes: "Requires licensed refrigeration mechanic. Cannot be DIY repaired. Leaks must be found, repaired, and system recharged."
  },
  {
    problem: "Compressor Failure",
    symptoms: ["No heating/cooling", "Unit won't start", "Loud grinding noise", "Tripped breaker"],
    cost: "$2,000 - $3,500",
    urgency: "Critical",
    diy: false,
    notes: "Most expensive repair. Often covered under warranty. Consider full unit replacement if out of warranty and unit is 12+ years old."
  },
  {
    problem: "Reversing Valve Stuck",
    symptoms: ["Won't switch heating/cooling modes", "Blows cold in heat mode", "Clicking sounds"],
    cost: "$400 - $800",
    urgency: "Medium",
    diy: false,
    notes: "BC winters require functioning heat mode. Schedule repair within 1-2 days if stuck in cooling mode during winter."
  },
  {
    problem: "Frozen Outdoor Coil",
    symptoms: ["Ice covering outdoor unit", "Reduced airflow", "No heat output"],
    cost: "$150 - $400",
    urgency: "Medium",
    diy: "Partial (check filters, defrost cycle)",
    notes: "Often caused by dirty filters, low refrigerant, or failed defrost cycle. Check filters first. If persists, call technician."
  },
  {
    problem: "Failed Defrost Sensor",
    symptoms: ["Excessive ice buildup", "Reduced heating capacity", "Frequent defrost cycles"],
    cost: "$200 - $450",
    urgency: "Medium",
    diy: false,
    notes: "Critical for BC winters. Sensor replacement is straightforward for technicians. Usually covered under warranty."
  },
  {
    problem: "Dirty/Clogged Filters",
    symptoms: ["Reduced airflow", "Higher bills", "Overheating warnings", "Poor performance"],
    cost: "$0 - $50 (DIY)",
    urgency: "Low",
    diy: true,
    notes: "Most common issue. Clean monthly. Ductless: wash indoor unit filters. Ducted: replace MERV filters every 1-3 months."
  },
  {
    problem: "Capacitor Failure",
    symptoms: ["Hard starting", "Won't start", "Humming but not running", "Intermittent operation"],
    cost: "$150 - $350",
    urgency: "High",
    diy: false,
    notes: "Common on units 5+ years old. Inexpensive part but requires electrical expertise. Can cause compressor damage if ignored."
  },
  {
    problem: "Drainage Issues",
    symptoms: ["Water leaking indoors", "Gurgling sounds", "Humidity problems", "Condensate overflow"],
    cost: "$100 - $300",
    urgency: "Medium",
    diy: "Partial (clean drain line)",
    notes: "Can try flushing drain line with vinegar. If frozen or clogged, professional service needed. Interior leaks can cause water damage."
  },
  {
    problem: "Fan Motor Failure",
    symptoms: ["No air movement", "Loud squealing", "Won't blow air", "Overheating"],
    cost: "$300 - $700",
    urgency: "High",
    diy: false,
    notes: "Indoor or outdoor fan can fail. Usually requires motor replacement. Lubrication helps prevent but won't fix failed motor."
  },
  {
    problem: "Thermostat/Control Issues",
    symptoms: ["Inaccurate temperature", "Won't respond to settings", "Blank display", "Erratic cycling"],
    cost: "$150 - $500",
    urgency: "Low-Medium",
    diy: "Partial (check batteries, wiring)",
    notes: "Check batteries first. Verify wiring connections. Modern smart thermostats can have software issues - try reset."
  }
];

const maintenanceTasks = [
  {
    frequency: "Monthly",
    task: "Clean or Replace Air Filters",
    difficulty: "Easy (DIY)",
    cost: "$0 - $30",
    details: "Ductless: Remove and wash indoor unit filters with warm water. Ducted: Replace MERV filters. Dirty filters reduce efficiency by 15-25%."
  },
  {
    frequency: "Monthly",
    task: "Check Outdoor Unit for Debris",
    difficulty: "Easy (DIY)",
    cost: "$0",
    details: "Remove leaves, snow, ice buildup. Maintain 2-foot clearance around unit. Ensure vents aren't blocked. Critical after snowfall in BC winters."
  },
  {
    frequency: "Quarterly",
    task: "Clean Indoor Unit Coils (Ductless)",
    difficulty: "Medium (DIY)",
    cost: "$0 - $20",
    details: "Use coil cleaner spray. Prevents mold and maintains efficiency. Access panel removal required. Watch manufacturer video first."
  },
  {
    frequency: "Annually",
    task: "Professional Inspection & Tune-Up",
    difficulty: "Professional Required",
    cost: "$150 - $300",
    details: "Refrigerant check, electrical connections, coil cleaning, condensate drain, defrost cycle test, efficiency measurement. Schedule spring or fall."
  },
  {
    frequency: "Annually",
    task: "Check Refrigerant Levels",
    difficulty: "Professional Required",
    cost: "Included in tune-up",
    details: "Low refrigerant indicates leak. Requires licensed refrigeration mechanic. Cannot DIY. BC regulations prohibit homeowner refrigerant work."
  },
  {
    frequency: "Annually",
    task: "Inspect Electrical Connections",
    difficulty: "Professional Required",
    cost: "Included in tune-up",
    details: "Loose connections cause fires and failures. Check contactors, capacitors, wiring. Tighten terminals, measure voltage/amperage."
  },
  {
    frequency: "As Needed",
    task: "Clear Condensate Drain Line",
    difficulty: "Easy (DIY)",
    cost: "$0 - $10",
    details: "Flush with vinegar/water mix. Prevents clogs and leaks. Important in humid coastal BC climates. Check monthly in summer."
  },
  {
    frequency: "Seasonally",
    task: "Test Defrost Cycle (Winter)",
    difficulty: "Easy (DIY)",
    cost: "$0",
    details: "Observe outdoor unit during cold weather. Should periodically reverse to melt ice. If excessive ice, call technician."
  },
  {
    frequency: "Bi-Annually",
    task: "Clean Outdoor Coil Fins",
    difficulty: "Medium (DIY)",
    cost: "$15 - $40",
    details: "Use coil cleaner and soft brush or low-pressure hose. Straighten bent fins with fin comb. Improves efficiency 5-15%."
  },
  {
    frequency: "5 Years",
    task: "Replace Capacitors (Preventive)",
    difficulty: "Professional Required",
    cost: "$150 - $350",
    details: "Capacitors degrade over time. Proactive replacement prevents compressor damage. Consider at 5-7 year mark."
  }
];

export default function ServicePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span>Service & Repair</span>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Heat Pump Service & Repair Guide for BC
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Complete guide to heat pump maintenance, common repairs, service costs, and finding qualified technicians in British Columbia. Keep your system running efficiently.
      </p>

      <ArticleMeta
        lastUpdated="2026-02-16"
        readTime="16 min read"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-primary-50 to-blue-100 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-primary-700 mb-2">$150-$300</div>
          <div className="text-sm text-gray-700">Annual Tune-Up Cost</div>
        </div>
        <div className="bg-gradient-to-br from-success-50 to-green-100 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-success-700 mb-2">15-20 years</div>
          <div className="text-sm text-gray-700">Lifespan With Maintenance</div>
        </div>
        <div className="bg-gradient-to-br from-accent-50 to-orange-100 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-accent-700 mb-2">10-25%</div>
          <div className="text-sm text-gray-700">Efficiency Loss if Neglected</div>
        </div>
      </div>

      {/* DIY vs Professional */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-12 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">DIY vs Professional Service</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-green-50 border-2 border-success-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-success-800 mb-4 flex items-center gap-2">
              <span>✅</span> Safe DIY Tasks
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Clean/replace air filters (monthly)</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Clear debris from outdoor unit</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Flush condensate drain with vinegar</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Check/clear snow/ice from outdoor unit</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Clean indoor unit coils (ductless)</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Test thermostat/remote functions</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <span>⛔</span> Requires Professional
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Refrigerant work (illegal for homeowners in BC)</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Electrical repairs (license required)</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Compressor replacement</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Reversing valve repairs</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Fan motor replacement</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Defrost system diagnostics</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-gray-800">
            <strong>BC Regulations:</strong> Refrigerant handling requires Technical Safety BC certification. DIY refrigerant work is illegal and voids warranties. Electrical work requires licensed electrician for insurance compliance.
          </p>
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Maintenance Schedule</h2>

        <div className="space-y-4">
          {maintenanceTasks.map((task, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-[120px]">
                  <div className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-bold">
                    {task.frequency}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{task.task}</h3>
                  <div className="flex flex-wrap gap-4 mb-3">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      task.difficulty.includes('DIY')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {task.difficulty}
                    </span>
                    <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                      {task.cost}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{task.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Repairs */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Repairs & Costs</h2>

        <div className="space-y-6">
          {commonRepairs.map((repair, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
              <div className={`p-4 ${
                repair.urgency === 'Critical' ? 'bg-red-500' :
                repair.urgency === 'High' ? 'bg-orange-500' :
                repair.urgency === 'Medium' ? 'bg-yellow-500' :
                'bg-blue-500'
              } text-white`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">{repair.problem}</h3>
                  <div className="flex gap-4 items-center">
                    <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-semibold">
                      {repair.urgency} Priority
                    </span>
                    <span className="text-2xl font-bold">{repair.cost}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Symptoms:</h4>
                    <ul className="space-y-1">
                      {repair.symptoms.map((symptom, i) => (
                        <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-primary-600 mt-1">•</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 mb-2">DIY Possible:</h4>
                      <span className={`inline-block px-4 py-2 rounded-lg font-bold ${
                        repair.diy === true ? 'bg-success-100 text-success-800' :
                        repair.diy === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {repair.diy === true ? 'Yes' : repair.diy === 'Partial' ? 'Partial (try first)' : 'No - Professional Only'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 border-l-4 border-primary-500 p-4 rounded">
                  <p className="text-sm text-gray-800">
                    <strong>Notes:</strong> {repair.notes}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Costs Breakdown */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Service Costs in BC (2026)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Service Calls</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span>Diagnostic visit:</span>
                <span className="font-bold text-primary-600">$100 - $200</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Annual tune-up:</span>
                <span className="font-bold text-primary-600">$150 - $300</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Emergency after-hours:</span>
                <span className="font-bold text-primary-600">$250 - $500</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Refrigerant recharge (per lb):</span>
                <span className="font-bold text-primary-600">$75 - $150</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Common Parts</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span>Capacitor:</span>
                <span className="font-bold text-primary-600">$150 - $350</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Contactor:</span>
                <span className="font-bold text-primary-600">$120 - $280</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Defrost sensor:</span>
                <span className="font-bold text-primary-600">$200 - $450</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Thermostat:</span>
                <span className="font-bold text-primary-600">$150 - $500</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Costs include parts and labor. Vancouver/Lower Mainland typically 10-15% higher than Interior BC. Mobile home parks may have additional access fees.
        </p>
      </div>

      {/* Finding Service Providers */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Finding Qualified Technicians in BC</h2>

        <div className="space-y-6">
          <div className="bg-primary-50 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>✅</span> Required Certifications
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span><strong>Refrigeration Mechanic License (FSR)</strong> - Required for refrigerant work (Technical Safety BC)</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span><strong>Gas Fitter License</strong> - If servicing backup boiler/furnace in hybrid systems</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span><strong>Electrical License</strong> - For electrical repairs (BC Safety Authority)</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span><strong>Manufacturer Certification</strong> - Preferred for warranty work (Mitsubishi, Daikin, etc.)</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔍</span> How to Verify
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Check Technical Safety BC contractor search: <a href="https://www.technicalsafetybc.ca" className="text-primary-600 underline">technicalsafetybc.ca</a></span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Ask for license numbers before booking</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Verify manufacturer certification for warranty service</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Check Better Business Bureau (BBB) ratings</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Read Google reviews (look for patterns, not just star count)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border-2 border-primary-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">Questions to Ask Before Booking:</h3>
            <ul className="space-y-2">
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">1.</span>
                <span>"Are you licensed with Technical Safety BC for refrigeration?"</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">2.</span>
                <span>"Are you certified to service [your brand]?"</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">3.</span>
                <span>"What's your diagnostic fee? Is it waived if I proceed with repairs?"</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">4.</span>
                <span>"Do you provide written estimates before starting work?"</span>
              </li>
              <li className="text-gray-700 flex items-start gap-2">
                <span className="text-primary-600 mt-1">5.</span>
                <span>"What warranty do you offer on parts and labor?"</span>
              </li>
            </ul>
          </div>

          <Link
            href="/directory"
            className="block bg-primary-600 hover:bg-primary-700 text-white text-center px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            Browse Licensed Service Providers in BC →
          </Link>
        </div>
      </div>

      {/* When to Replace vs Repair */}
      <div className="bg-gradient-to-br from-accent-50 to-orange-50 border-l-4 border-accent-500 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">When to Replace vs Repair</h2>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-5">
            <h3 className="font-bold text-green-700 mb-2">✅ Repair Makes Sense When:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Unit is less than 8 years old</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Repair cost is less than 50% of replacement cost</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Covered under warranty (especially compressor)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 mt-1">•</span>
                <span>Minor repairs (capacitor, fan, sensor)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-5">
            <h3 className="font-bold text-red-700 mb-2">⛔ Consider Replacement When:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Unit is 12+ years old</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Compressor failure out of warranty ($2,500+ repair)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Frequent repairs (3+ service calls in 2 years)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Efficiency has degraded significantly (energy bills up 25%+)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Using R-22 refrigerant (obsolete, expensive)</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary-50 rounded-lg p-5">
            <p className="text-sm text-gray-800">
              <strong>Rule of thumb:</strong> Multiply unit age by repair cost. If result exceeds $5,000, replacement often makes more sense. Example: 10-year-old unit needing $800 repair = 10 × $800 = $8,000 → Consider replacement.
            </p>
          </div>
        </div>
      </div>

      {/* Related Resources */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Related Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/directory" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
            <span>→</span> Find Service Technicians
          </Link>
          <Link href="/brands" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
            <span>→</span> Brand Reliability Comparison
          </Link>
          <Link href="/calculator" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
            <span>→</span> Replacement vs Repair Calculator
          </Link>
          <Link href="/faq" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
            <span>→</span> Heat Pump FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
