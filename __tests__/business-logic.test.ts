/**
 * Business-logic tests for the mock repositories & stores.
 */

import {
  DOCTOR_COUNT,
  getDoctorByRank,
  getDoctorsPage,
  getDoctorSlots,
} from '../src/modules/consultations/src/services/doctorRepo';
import {
  PRODUCT_COUNT,
  getProductByRank,
  getProductsPage,
  getProductById,
} from '../src/modules/shop/src/services/productRepo';
import { computeCheckoutSummary } from '../src/modules/shop/src/services/shopApi';
import {
  HEALTH_RECORD_COUNT,
  queryRecords,
  groupByMonth,
} from '../src/modules/health/src/services/healthRepo';
import { selectUpcoming, isSlotBookedById } from '../src/modules/consultations/src/store/appointmentsStore';

describe('Doctors repository', () => {
  it('materialises the required dataset size (5,000)', () => {
    expect(DOCTOR_COUNT).toBe(5000);
  });
  it('produces valid, deterministic doctors', () => {
    const a = getDoctorByRank(0);
    const b = getDoctorByRank(0);
    expect(a.id).toBe(b.id);
    expect(a.rating).toBeGreaterThanOrEqual(3.5);
    expect(a.experienceYears).toBeGreaterThanOrEqual(3);
  });
  it('paginates and honours text search', () => {
    const page = getDoctorsPage(1, 10, { query: 'Cardi' });
    expect(page.items.length).toBeLessThanOrEqual(10);
    // Every returned item contains the query substring somewhere (name/spec/city)
    for (const d of page.items) {
      const haystack = `${d.name} ${d.specialization} ${d.city}`.toLowerCase();
      expect(haystack).toContain('cardi');
    }
  });
  it('generates future slots that are not expired', () => {
    const doc = getDoctorByRank(1);
    const iso = Object.keys(doc.availability)[0];
    const slots = getDoctorSlots(doc, iso, undefined, true);
    for (const s of slots) {
      const start = new Date(`${s.dateISO}T00:00:00`).getTime() + s.startMinutes * 60000;
      expect(start).toBeGreaterThan(Date.now() - 60000);
    }
  });
});

describe('Products repository', () => {
  it('materialises the required dataset size (20,000)', () => {
    expect(PRODUCT_COUNT).toBe(20000);
  });
  it('looks up a product by id', () => {
    const p = getProductById('prd-100');
    expect(p?.id).toBe('prd-100');
    expect(p?.price).toBeGreaterThan(0);
  });
  it('filters by category and stock', () => {
    const res = getProductsPage(1, 5, { categories: ['Oils'], inStock: true });
    expect(res.items.length).toBeLessThanOrEqual(5);
    for (const p of res.items) {
      expect(p.category).toBe('Oils');
      expect(p.stock).toBeGreaterThan(0);
    }
  });
  it('sorts by price ascending', () => {
    const res = getProductsPage(1, 20, {}, 'price-asc');
    for (let i = 1; i < res.items.length; i++) {
      expect(res.items[i].price).toBeGreaterThanOrEqual(res.items[i - 1].price);
    }
  });
});

describe('Compute checkout summary (business logic)', () => {
  it('computes totals, discount, shipping and tax', () => {
    const p = getProductByRank(0);
    // Buy 2 of the same product.
    const summary = computeCheckoutSummary([{ productId: p.id, quantity: 2 }]);
    expect(summary.subtotal).toBeCloseTo(p.price * 2, 2);
    expect(summary.discount).toBeCloseTo(summary.subtotal * 0.1, 2);
    expect(summary.tax).toBeCloseTo(summary.subtotal * 0.05, 2);
    expect(summary.itemCount).toBe(2);
    expect(summary.total).toBeCloseTo(
      summary.subtotal - summary.discount + summary.shipping + summary.tax,
      2,
    );
  });
});

describe('Health records repository', () => {
  it('materialises the required dataset size (10,000)', () => {
    expect(HEALTH_RECORD_COUNT).toBe(10000);
  });
  it('groups records by month & year, newest first', () => {
    const groups = groupByMonth(queryRecords({}));
    // Sorted descending by year/month
    for (let i = 1; i < groups.length; i++) {
      const prev = groups[i - 1];
      const cur = groups[i];
      expect(prev.year > cur.year || (prev.year === cur.year && prev.month > cur.month)).toBe(true);
    }
    // Records within a group are newest-first
    for (const g of groups) {
      for (let j = 1; j < g.records.length; j++) {
        expect(g.records[j - 1].dateTs).toBeGreaterThanOrEqual(g.records[j].dateTs);
      }
    }
  });
  it('filters by kind', () => {
    const records = queryRecords({ kinds: ['vaccination'] });
    expect(records.length).toBeGreaterThan(0);
    for (const r of records) expect(r.kind).toBe('vaccination');
  });
});

describe('Appointments store helpers (business logic)', () => {
  const future = {
    id: 'b1', doctorId: 'doc-1', slotId: 'slot-1', dateISO: '2099-01-01',
    startMinutes: 540, mode: 'video' as const, patientName: 'P', patientAge: 30,
    status: 'upcoming' as const, createdAt: Date.now(), cancelledAt: null, isExpired: false,
  };
  it('selectUpcoming excludes expired/future checks', () => {
    const upcoming = selectUpcoming([future], Date.now());
    expect(upcoming).toHaveLength(1);
  });
  it('isSlotBookedById detects overlap', () => {
    expect(isSlotBookedById([future], 'slot-1')).toBe(true);
    expect(isSlotBookedById([future], 'slot-other')).toBe(false);
  });
});