'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AuditEntry {
  uuid: string;
  timestamp: string;
  country: 'us' | 'ca';
  standard: string;
  zip: string;
  panelAmps: number;
  sqft: number;
  calculatedAmps: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  utilization: number;
  paid: boolean;
  promoCode: string | null;
  appliances: string[];
  hpReplacesAc: boolean;
}

interface AuditStats {
  total: number;
  pass: number;
  warn: number;
  fail: number;
  passPercent: number;
  warnPercent: number;
  failPercent: number;
  paidCount: number;
  freeCount: number;
  mostCommonPanel: number;
  avgUtilization: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

interface PromoStat {
  code: string;
  used: number;
  maxUses: number;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Exhausted';
}

interface ApiResponse {
  entries: AuditEntry[];
  total: number;
  page: number;
  totalPages: number;
  stats: AuditStats;
  promoStats?: PromoStat[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PASS: 'bg-green-100 text-green-800',
  WARN: 'bg-amber-100 text-amber-800',
  FAIL: 'bg-red-100 text-red-800',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminAuditsPage() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<ApiResponse | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [paidFilter, setPaidFilter] = useState<string>('');

  const fetchData = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ page: String(pageNum) });
    if (statusFilter) params.set('status', statusFilter);
    if (countryFilter) params.set('country', countryFilter);
    if (paidFilter) params.set('paid', paidFilter);

    try {
      const res = await fetch(`/api/admin/audits?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setAuthenticated(false);
        setError('Invalid token');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(`API error: ${res.status}`);
        setLoading(false);
        return;
      }

      const json: ApiResponse = await res.json();
      setData(json);
      setAuthenticated(true);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, countryFilter, paidFilter]);

  useEffect(() => {
    if (authenticated) fetchData(page);
  }, [authenticated, page, fetchData]);

  // ── Login gate ─────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-slate-900">Admin Access</h1>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <input
            type="password"
            placeholder="Admin token"
            className="w-full border rounded px-3 py-2 mb-3 text-sm"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') fetchData(1); }}
          />
          <button
            onClick={() => fetchData(1)}
            className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium hover:bg-slate-800"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <button
            onClick={() => fetchData(page)}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Refresh
          </button>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="Total Audits" value={stats.total} />
            <StatCard label="Today" value={stats.todayCount} />
            <StatCard label="This Week" value={stats.weekCount} />
            <StatCard label="This Month" value={stats.monthCount} />
            <StatCard label="Avg Utilization" value={`${stats.avgUtilization}%`} />
            <StatCard label="Common Panel" value={stats.mostCommonPanel > 0 ? `${stats.mostCommonPanel}A` : '-'} />

            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-700 font-medium">PASS</p>
              <p className="text-lg font-bold text-green-800">{stats.pass} <span className="text-xs font-normal">({stats.passPercent}%)</span></p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">WARN</p>
              <p className="text-lg font-bold text-amber-800">{stats.warn} <span className="text-xs font-normal">({stats.warnPercent}%)</span></p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-700 font-medium">FAIL</p>
              <p className="text-lg font-bold text-red-800">{stats.fail} <span className="text-xs font-normal">({stats.failPercent}%)</span></p>
            </div>

            <StatCard label="Paid" value={stats.paidCount} />
            <StatCard label="Free" value={stats.freeCount} />
          </div>
        )}

        {/* Promo code stats */}
        {data?.promoStats && data.promoStats.length > 0 && (
          <div className="bg-white rounded-lg border p-4 mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Promo Codes</h2>
            <div className="space-y-2">
              {data.promoStats.map(p => (
                <div key={p.code} className="flex items-center gap-4 text-sm">
                  <span className="font-mono font-bold text-slate-800 w-32">{p.code}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (p.used / p.maxUses) * 100)}%` }}
                    />
                  </div>
                  <span className="text-slate-600 tabular-nums w-20 text-right">
                    {p.used} / {p.maxUses}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    p.status === 'Active' ? 'bg-green-100 text-green-700' :
                    p.status === 'Expired' ? 'bg-slate-100 text-slate-500' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {p.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    expires {new Date(p.expiresAt).toLocaleDateString('en-CA')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm bg-white"
          >
            <option value="">All Results</option>
            <option value="PASS">PASS</option>
            <option value="WARN">WARN</option>
            <option value="FAIL">FAIL</option>
          </select>
          <select
            value={countryFilter}
            onChange={e => { setCountryFilter(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm bg-white"
          >
            <option value="">All Countries</option>
            <option value="ca">Canada (CEC)</option>
            <option value="us">US (NEC)</option>
          </select>
          <select
            value={paidFilter}
            onChange={e => { setPaidFilter(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm bg-white"
          >
            <option value="">All (Paid/Free)</option>
            <option value="true">Paid</option>
            <option value="false">Free</option>
          </select>
        </div>

        {loading && <p className="text-sm text-slate-500 mb-4">Loading...</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {/* Table */}
        {data && (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-3 py-2 font-medium text-slate-600">Date</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">Country</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">ZIP</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Panel</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Sqft</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Calc Amps</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-600">Result</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">Util %</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-600">Paid</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">Promo</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-600">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.length === 0 && (
                    <tr><td colSpan={11} className="text-center py-8 text-slate-400">No audits found</td></tr>
                  )}
                  {data.entries.map(entry => (
                    <tr key={entry.uuid} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-2 whitespace-nowrap text-slate-700">{formatDate(entry.timestamp)}</td>
                      <td className="px-3 py-2 text-center">
                        {entry.country === 'ca' ? '🇨🇦' : '🇺🇸'}
                      </td>
                      <td className="px-3 py-2 text-slate-600 font-mono text-xs">{entry.zip || '-'}</td>
                      <td className="px-3 py-2 text-right font-mono">{entry.panelAmps}A</td>
                      <td className="px-3 py-2 text-right font-mono">{entry.sqft.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-mono">{entry.calculatedAmps}A</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${STATUS_COLORS[entry.status]}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{entry.utilization}%</td>
                      <td className="px-3 py-2 text-center">
                        {entry.paid
                          ? <span className="text-green-600 font-medium">Yes</span>
                          : <span className="text-slate-400">No</span>}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">{entry.promoCode || '-'}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => {
                            fetch(`/api/admin/audits/${entry.uuid}/pdf`, {
                              headers: { Authorization: `Bearer ${token}` },
                            })
                              .then(r => {
                                if (!r.ok) throw new Error('PDF fetch failed');
                                return r.blob();
                              })
                              .then(blob => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${entry.uuid}.pdf`;
                                a.click();
                                URL.revokeObjectURL(url);
                              })
                              .catch(() => alert('PDF generation failed'));
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          View PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500">
                  Page {data.page} of {data.totalPages} ({data.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-slate-100"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= data.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-slate-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg p-3 border">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
