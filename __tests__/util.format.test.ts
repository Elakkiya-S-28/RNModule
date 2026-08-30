/**
 * Unit tests for shared formatting/parsing utilities.
 * @jest-environment node
 */

import {
  formatCurrency,
  formatCompact,
  titleCase,
  initialsFromName,
  toISODate,
  relativeTime,
  formatTime12h,
  monthYearLabel,
  chunk,
  hashString,
} from '../src/core/util/format';

describe('formatCurrency', () => {
  it('formats integers in INR style without decimals', () => {
    expect(formatCurrency(1000)).toBe('₹1,000');
  });
  it('formats decimals when present', () => {
    expect(formatCurrency(1234.5)).toBe('₹1,234.5');
  });
  it('handles non-finite gracefully', () => {
    expect(formatCurrency(NaN)).toBe('₹0');
  });
});

describe('formatCompact', () => {
  it('formats thousands as k', () => {
    expect(formatCompact(1234)).toBe('1.2k');
  });
  it('formats millions as M', () => {
    expect(formatCompact(2300000)).toBe('2.3M');
  });
});

describe('titleCase', () => {
  it('capitalises each word and splits separators', () => {
    expect(titleCase('herbal_supplement-oil')).toBe('Herbal Supplement Oil');
  });
});

describe('initialsFromName', () => {
  it('returns first and last initials', () => {
    expect(initialsFromName('Aarav Sharma')).toBe('AS');
  });
});

describe('toISODate', () => {
  it('formats a timestamp to yyyy-mm-dd', () => {
    // 2026-08-30T00:00:00 local
    expect(toISODate(new Date(2026, 7, 30).getTime())).toBe('2026-08-30');
  });
});

describe('relativeTime', () => {
  const now = new Date(2026, 0, 1, 12, 0).getTime(); // noon
  it('shows future hours', () => {
    expect(relativeTime(now + 2 * 3600000, now)).toBe('in 2h');
  });
  it('shows past days', () => {
    expect(relativeTime(now - 3 * 86400000, now)).toBe('3d ago');
  });
});

describe('formatTime12h', () => {
  it('handles PM', () => {
    expect(formatTime12h(15, 30)).toBe('3:30 PM');
  });
  it('handles midnight as 12 AM', () => {
    expect(formatTime12h(0)).toBe('12:00 AM');
  });
});

describe('monthYearLabel', () => {
  it('returns short month + year', () => {
    expect(monthYearLabel(new Date(2026, 7, 1).getTime())).toBe('Aug 2026');
  });
});

describe('chunk', () => {
  it('splits arrays into fixed-size groups', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('hashString', () => {
  it('is deterministic', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
  });
  it('differs for different inputs', () => {
    expect(hashString('abc')).not.toBe(hashString('abd'));
  });
});