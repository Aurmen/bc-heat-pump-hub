/**
 * audit-log.ts — Persistent audit log in Upstash Redis (no TTL).
 *
 * Key pattern:  audit-log:{uuid}
 * Index key:    audit-log:index  (sorted set, score = timestamp ms)
 *
 * Stores operational data only — NO PII (email, name, phone).
 */
import 'server-only';

import { Redis } from '@upstash/redis';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  uuid: string;
  timestamp: string;           // ISO 8601
  country: 'us' | 'ca';
  standard: 'NEC 220.82' | 'CEC 8-200';
  zip: string;
  panelAmps: number;
  sqft: number;
  calculatedAmps: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  utilization: number;         // percentage
  paid: boolean;
  promoCode: string | null;
  appliances: string[];        // list of what they entered
  hpReplacesAc: boolean;
}

export interface AuditLogStats {
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

// ── Redis client ───────────────────────────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

// ── Write ──────────────────────────────────────────────────────────────────────

const LOG_PREFIX = 'audit-log:';
const INDEX_KEY = 'audit-log:index';

export async function writeAuditLog(entry: AuditLogEntry): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    console.warn('[audit-log] Redis not configured, skipping audit log write');
    return false;
  }

  try {
    const key = `${LOG_PREFIX}${entry.uuid}`;
    const score = new Date(entry.timestamp).getTime();

    // Pipeline: set the entry + add to sorted set index (no TTL)
    await redis.set(key, JSON.stringify(entry));
    await redis.zadd(INDEX_KEY, { score, member: entry.uuid });

    console.log('[audit-log] Stored', { uuid: entry.uuid, status: entry.status, paid: entry.paid });
    return true;
  } catch (err) {
    console.error('[audit-log] Write failed:', err);
    return false;
  }
}

// ── Read ───────────────────────────────────────────────────────────────────────

export interface AuditLogListOptions {
  offset?: number;
  limit?: number;
  status?: 'PASS' | 'WARN' | 'FAIL';
  country?: 'us' | 'ca';
  paid?: boolean;
}

export async function listAuditLogs(
  opts: AuditLogListOptions = {}
): Promise<{ entries: AuditLogEntry[]; total: number }> {
  const redis = getRedis();
  if (!redis) return { entries: [], total: 0 };

  try {
    // Get all UUIDs from sorted set (newest first)
    const allUuids = await redis.zrange(INDEX_KEY, 0, -1, { rev: true }) as string[];
    if (allUuids.length === 0) return { entries: [], total: 0 };

    // Fetch all entries in batch
    const keys = allUuids.map(uuid => `${LOG_PREFIX}${uuid}`);
    const rawEntries = await redis.mget<(string | null)[]>(...keys);

    let entries: AuditLogEntry[] = rawEntries
      .filter((raw): raw is string => raw !== null)
      .map(raw => {
        if (typeof raw === 'string') return JSON.parse(raw) as AuditLogEntry;
        return raw as AuditLogEntry;
      });

    // Apply filters
    if (opts.status) {
      entries = entries.filter(e => e.status === opts.status);
    }
    if (opts.country) {
      entries = entries.filter(e => e.country === opts.country);
    }
    if (opts.paid !== undefined) {
      entries = entries.filter(e => e.paid === opts.paid);
    }

    const total = entries.length;

    // Paginate
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? 25;
    entries = entries.slice(offset, offset + limit);

    return { entries, total };
  } catch (err) {
    console.error('[audit-log] List failed:', err);
    return { entries: [], total: 0 };
  }
}

// ── Single entry ───────────────────────────────────────────────────────────────

export async function getAuditLog(uuid: string): Promise<AuditLogEntry | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const raw = await redis.get<string>(`${LOG_PREFIX}${uuid}`);
    if (!raw) return null;
    if (typeof raw === 'string') return JSON.parse(raw) as AuditLogEntry;
    return raw as AuditLogEntry;
  } catch (err) {
    console.error('[audit-log] Get failed:', err);
    return null;
  }
}

// ── Stats ──────────────────────────────────────────────────────────────────────

export async function getAuditStats(): Promise<AuditLogStats> {
  const redis = getRedis();
  const empty: AuditLogStats = {
    total: 0, pass: 0, warn: 0, fail: 0,
    passPercent: 0, warnPercent: 0, failPercent: 0,
    paidCount: 0, freeCount: 0,
    mostCommonPanel: 0, avgUtilization: 0,
    todayCount: 0, weekCount: 0, monthCount: 0,
  };
  if (!redis) return empty;

  try {
    const allUuids = await redis.zrange(INDEX_KEY, 0, -1, { rev: true }) as string[];
    if (allUuids.length === 0) return empty;

    const keys = allUuids.map(uuid => `${LOG_PREFIX}${uuid}`);
    const rawEntries = await redis.mget<(string | null)[]>(...keys);

    const entries: AuditLogEntry[] = rawEntries
      .filter((raw): raw is string => raw !== null)
      .map(raw => {
        if (typeof raw === 'string') return JSON.parse(raw) as AuditLogEntry;
        return raw as AuditLogEntry;
      });

    const total = entries.length;
    const pass = entries.filter(e => e.status === 'PASS').length;
    const warn = entries.filter(e => e.status === 'WARN').length;
    const fail = entries.filter(e => e.status === 'FAIL').length;
    const paidCount = entries.filter(e => e.paid).length;

    // Most common panel
    const panelCounts = new Map<number, number>();
    let totalUtil = 0;
    for (const e of entries) {
      panelCounts.set(e.panelAmps, (panelCounts.get(e.panelAmps) ?? 0) + 1);
      totalUtil += e.utilization;
    }
    let mostCommonPanel = 0;
    let maxCount = 0;
    for (const [panel, count] of panelCounts) {
      if (count > maxCount) { mostCommonPanel = panel; maxCount = count; }
    }

    // Time-based counts
    const now = Date.now();
    const dayMs = 86400000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    for (const e of entries) {
      const age = now - new Date(e.timestamp).getTime();
      if (age <= dayMs) todayCount++;
      if (age <= weekMs) weekCount++;
      if (age <= monthMs) monthCount++;
    }

    return {
      total, pass, warn, fail,
      passPercent: total > 0 ? Math.round((pass / total) * 100) : 0,
      warnPercent: total > 0 ? Math.round((warn / total) * 100) : 0,
      failPercent: total > 0 ? Math.round((fail / total) * 100) : 0,
      paidCount, freeCount: total - paidCount,
      mostCommonPanel,
      avgUtilization: total > 0 ? Math.round(totalUtil / total) : 0,
      todayCount, weekCount, monthCount,
    };
  } catch (err) {
    console.error('[audit-log] Stats failed:', err);
    return empty;
  }
}
