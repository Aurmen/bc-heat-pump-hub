'use client';

import { useState } from 'react';

interface TechnicalDeepDiveProps {
  summary: string;
  label?: string;
  children: React.ReactNode;
}

export default function TechnicalDeepDive({
  summary,
  label = 'Technical Detail',
  children,
}: TechnicalDeepDiveProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-6 rounded-xl border border-gray-200 overflow-hidden not-prose">
      {/* Plain-language summary — always visible */}
      <div className="bg-blue-50 border-b border-blue-100 px-5 py-4 flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold">
          i
        </span>
        <p className="text-sm text-blue-900 font-medium leading-relaxed">{summary}</p>
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wide">
            {label}
          </span>
          <span className="text-sm text-gray-600 font-medium">
            {open ? 'Hide details' : 'Show technical details'}
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Technical content — revealed on expand */}
      {open && (
        <div className="px-5 pb-6 pt-4 border-t border-gray-100 bg-white prose prose-sm max-w-none
          prose-table:text-sm prose-th:font-semibold prose-th:text-gray-700
          prose-td:text-gray-600 prose-strong:text-gray-900">
          {children}
        </div>
      )}
    </div>
  );
}
