'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

interface VerifyResponse {
  paid: boolean;
  auditInputs?: Record<string, unknown>;
  error?: string;
}

// ── Inner component (reads search params — must be inside Suspense) ──────────

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'paid' | 'failed'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const triggerDownload = useCallback(async (auditInputs: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/audit-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditInputs),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers.get('Content-Disposition') ?? '';
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match ? match[1] : 'GhostLoad-Report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // PDF download failed but payment is confirmed — user can retry
      setErrorMsg('PDF download failed. Reload this page to try again.');
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setStatus('failed');
      return;
    }

    let cancelled = false;

    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data: VerifyResponse) => {
        if (cancelled) return;
        if (data.paid && data.auditInputs) {
          setStatus('paid');
          triggerDownload(data.auditInputs);
        } else {
          setStatus('failed');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, triggerDownload]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
        </div>
        <p className="text-gray-500 mt-6 text-sm">Verifying your payment...</p>
      </div>
    );
  }

  // ── Failed ───────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-2">
          <span className="text-3xl text-red-600">!</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Not Verified</h1>
        <p className="text-gray-600">
          We couldn&rsquo;t verify your payment. If you believe this is an error,
          please contact{' '}
          <a
            href="mailto:support@aelrictechnologies.com"
            className="text-primary-600 underline font-medium"
          >
            support@aelrictechnologies.com
          </a>
        </p>
        <Link
          href="/auditor"
          className="inline-block text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Back to Ghost Load Auditor
        </Link>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
        <span className="text-3xl text-green-600">&#10003;</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Payment Confirmed</h1>
      <p className="text-gray-700">
        Your Ghost Load Auditor report is downloading. Check your browser&rsquo;s
        download bar.
      </p>
      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {errorMsg}
        </p>
      )}
      <p className="text-sm text-gray-500">
        Save this page URL for 24 hours to re-download.
      </p>
      <Link
        href="/auditor"
        className="inline-block text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        &larr; Back to Ghost Load Auditor
      </Link>
    </div>
  );
}

// ── Page wrapper (Suspense required for useSearchParams in App Router) ────────

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
