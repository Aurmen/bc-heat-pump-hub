/**
 * /api/admin/audits — Admin audit log listing + stats.
 *
 * GET /api/admin/audits?page=1&status=FAIL&country=ca&paid=true
 *
 * Requires: Authorization: Bearer <ADMIN_SECRET>
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { listAuditLogs, getAuditStats } from '@/lib/audit-log';
import { getPromoUsage, getPromoCodes } from '@/lib/promo';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const limit = 25;
  const offset = (page - 1) * limit;

  const statusFilter = url.searchParams.get('status') as 'PASS' | 'WARN' | 'FAIL' | null;
  const countryFilter = url.searchParams.get('country') as 'us' | 'ca' | null;
  const paidParam = url.searchParams.get('paid');
  const paidFilter = paidParam === 'true' ? true : paidParam === 'false' ? false : undefined;

  try {
    const codes = getPromoCodes();
    const [listResult, stats, ...promoUsages] = await Promise.all([
      listAuditLogs({
        offset,
        limit,
        status: statusFilter ?? undefined,
        country: countryFilter ?? undefined,
        paid: paidFilter,
      }),
      getAuditStats(),
      ...codes.map(c => getPromoUsage(c.code)),
    ]);

    const promoStats = codes.map((c, i) => ({
      code: c.code,
      used: promoUsages[i] as number,
      maxUses: c.maxUses,
      expiresAt: c.expiresAt,
      status:
        new Date() > new Date(c.expiresAt)
          ? 'Expired'
          : (promoUsages[i] as number) >= c.maxUses
          ? 'Exhausted'
          : 'Active',
    }));

    return NextResponse.json({
      entries: listResult.entries,
      total: listResult.total,
      page,
      totalPages: Math.ceil(listResult.total / limit),
      stats,
      promoStats,
    });
  } catch (err) {
    console.error('[admin/audits] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
