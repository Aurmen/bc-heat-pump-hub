/**
 * admin-auth.ts — Bearer token authentication for admin endpoints.
 *
 * Usage in route handlers:
 *   const authError = requireAdmin(req);
 *   if (authError) return authError;
 */
import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(req: NextRequest): NextResponse | null {
  const token = process.env.ADMIN_SECRET;
  if (!token) {
    console.error('[admin-auth] ADMIN_SECRET not configured');
    return NextResponse.json({ error: 'Admin auth not configured' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }

  const provided = authHeader.slice(7);
  if (provided !== token) {
    return NextResponse.json({ error: 'Invalid admin token' }, { status: 403 });
  }

  return null; // authenticated
}
