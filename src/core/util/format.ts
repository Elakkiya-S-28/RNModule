/**
 * Generic formatting & parsing utilities shared across modules.
 */

/** Format a number in compact currency (₹). */
export function formatCurrency(value: number, currency = '₹'): string {
  if (!Number.isFinite(value)) return `${currency}0`;
  return `${currency}${value.toLocaleString('en-IN', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

/** Humanise a large numeric count (e.g. 1234 -> "1.2k"). */
export function formatCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

/** Capitalise first letter of every word. */
export function titleCase(input: string): string {
  return input
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}

/** Convert a JS timestamp into an ISO date-string in the local tz (yyyy-mm-dd). */
export function toISODate(ts: number): string {
  const d = new Date(ts);
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Human-friendly relative time like "in 2h", "in 3d", "2d ago". */
export function relativeTime(ts: number, now = Date.now()): string {
  const diff = ts - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const value =
    mins < 60
      ? `${Math.max(1, mins)}m`
      : hours < 24
      ? `${hours}h`
      : days === 0
      ? '1d'
      : `${days}d`;
  return diff >= 0 ? `in ${value}` : `${value} ago`;
}

/** Format a 24h hour/minute into a 12h display string. */
export function formatTime12h(hour: number, minute = 0): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${`${minute}`.padStart(2, '0')} ${suffix}`;
}

/** Return a short month-year label (e.g. "Aug 2026"). */
export function monthYearLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

/** Chunk an array into groups of `size`. */
export function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/** Stable string hash (simple djb2) used for deterministic ids / grouping keys. */
export function hashString(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

/** Pick a deterministic pseudo-random value in [0,1) from a string seed. */
export function seededRandom(seed: string): number {
  const h = hashString(seed);
  let n = 0;
  for (let i = 0; i < h.length; i++) {
    n = (n * 31 + h.charCodeAt(i)) % 100000;
  }
  return n / 100000;
}