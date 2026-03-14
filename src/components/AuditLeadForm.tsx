'use client';

import { useState } from 'react';

export interface AuditLeadData {
  resultStatus: 'PASS' | 'WARN' | 'FAIL';
  panelAmps: number;
  totalAmps: number;
  hasEV: boolean;
  loadManagement: boolean;
  sqft: number;
  heatingW: number;
  coolingW: number;
  rangeW: number;
  dryerW: number;
  waterHeaterW: number;
  evW: number;
  utilization: number;
}

export default function AuditLeadForm({ data }: { data: AuditLeadData }) {
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isAtCapacity = data.resultStatus === 'FAIL' || data.resultStatus === 'WARN';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consented) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/audit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, postalCode, consented, ...data }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-xl shrink-0">✅</span>
          <div>
            <p className="font-semibold text-green-800">Technical briefing sent!</p>
            <p className="text-sm text-green-700 mt-1">
              Check your inbox for a summary of your audit results. A local specialist will reach
              out if you requested a contractor referral.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const cardBorder = isAtCapacity ? 'border-red-200' : 'border-primary-200';
  const headerBg = isAtCapacity
    ? 'bg-red-50 border-b border-red-200'
    : 'bg-primary-50 border-b border-primary-100';
  const headerText = isAtCapacity ? 'text-red-800' : 'text-primary-800';
  const subText = isAtCapacity ? 'text-red-700' : 'text-primary-700';
  const btnCls = isAtCapacity
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-primary-600 hover:bg-primary-700';

  return (
    <div className={`bg-white border rounded-xl overflow-hidden ${cardBorder}`}>
      {/* Header */}
      <div className={`px-6 py-5 ${headerBg}`}>
        <h2 className={`font-bold text-base ${headerText}`}>
          {isAtCapacity
            ? '⚡ Your Service is at Capacity. Get a Professional Review.'
            : '📋 Save Your Preliminary Feasibility Report.'}
        </h2>
        <p className={`text-sm mt-1.5 leading-relaxed ${subText}`}>
          {isAtCapacity
            ? 'You likely qualify for the $5,000 CleanBC Electrical Service Upgrade (ESU) rebate. Get a technical copy of this audit sent to your inbox and a referral to a vetted HPCN-certified electrician in your area.'
            : 'Enter your email to receive a technical briefing of these results for your home records or to fast-track your meeting with a heat pump installer.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
              placeholder="V1H 1A1"
              maxLength={7}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/privacy" className="underline text-primary-600 hover:text-primary-700">
              Terms of Service
            </a>{' '}
            and consent to being contacted by a licensed partner regarding my results.
          </span>
        </label>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={!consented || status === 'loading'}
          className={`w-full text-white font-semibold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${btnCls}`}
        >
          {status === 'loading'
            ? 'Sending…'
            : isAtCapacity
              ? 'Send My Audit + Request Contractor Referral →'
              : 'Email Me My Results →'}
        </button>

        {/* Liability & privacy small print */}
        <p className="text-xs text-gray-400 leading-relaxed">
          Canadian Heat Pump Hub provides mathematical modelling based on CEC Rule 8-200 Optional
          Method. This is not a formal electrical permit or professional declaration. Your data is
          protected under our{' '}
          <a href="/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </a>
          .{' '}
          <span className="block mt-1">
            This inquiry is a request for information. Final technical verification and site visits
            are required by a licensed contractor.
          </span>
        </p>
      </form>
    </div>
  );
}
