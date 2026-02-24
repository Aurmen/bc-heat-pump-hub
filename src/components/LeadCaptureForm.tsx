'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const PROJECT_TYPES = [
  'General Inquiry',
  'Strata / Condo Approval',
  '100A Panel Upgrade',
  'Cold-Climate Interior Install',
  'Oil / Propane Conversion',
  'Dual-Fuel Hybrid System',
  'Rebate Assistance',
  'ROI / Payback Analysis',
  'Repair / Maintenance',
];

export default function LeadCaptureForm() {
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [projectType, setProjectType] = useState('');
  const [technicalSummary, setTechnicalSummary] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill from calculator URL params
  useEffect(() => {
    const pt = searchParams.get('projectType');
    const summary = searchParams.get('summary');
    if (pt) setProjectType(pt);
    if (summary) setTechnicalSummary(decodeURIComponent(summary));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Soft-launch audit: log project type and city for regional demand tracking
    console.log('[LeadCapture] Submission:', { projectType, city, timestamp: new Date().toISOString() });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, city, projectType, technicalSummary }),
      });

      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly at contact@canadianheatpumphub.ca');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="not-prose bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Inquiry Received</h3>
        <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
          A technical curator will review your details and connect you with a verified local contractor within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="not-prose space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Optional"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Kelowna, Surrey"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Project Type <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={projectType}
          onChange={e => setProjectType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select project type...</option>
          {PROJECT_TYPES.map(pt => (
            <option key={pt} value={pt}>{pt}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Technical Summary{' '}
          <span className="font-normal text-gray-400 text-xs">(auto-filled if you came from a calculator)</span>
        </label>
        <textarea
          value={technicalSummary}
          onChange={e => setTechnicalSummary(e.target.value)}
          rows={4}
          placeholder="Describe your heating situation, current system, or paste your calculator results here."
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Disclaimer:</strong> This inquiry is a request for information. Final technical verification and site visits are required by a licensed contractor. Canadian Heat Pump Hub is not a contractor and does not provide installation services.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors"
      >
        {loading ? 'Sending...' : 'Submit Inquiry'}
      </button>
    </form>
  );
}
