import { Transport, TransportResponse, ApiError, ApiErrorCodes } from '../api';
import {
  getDoctorsPage,
  getDoctorByRank,
  getDoctorSlots,
  DOCTOR_COUNT,
} from '../../modules/consultations/src/services/doctorRepo';
import {
  getProductsPage,
  getProductById,
  getProductByRank,
  PRODUCT_COUNT,
} from '../../modules/shop/src/services/productRepo';
import {
  queryRecords,
  groupByMonth,
  getRecordById,
  getAllRecordTags,
} from '../../modules/health/src/services/healthRepo';
import { logger } from '../logger';

function json(status: number, data: unknown): TransportResponse {
  return { status, ok: status >= 200 && status < 300, data };
}

function parseQuery(url: string): URLSearchParams {
  const idx = url.indexOf('?');
  const qs = idx >= 0 ? url.slice(idx + 1) : '';
  return new URLSearchParams(qs.replace(/%2C/g, ',').replace(/\+/g, '%20'));
}

function num(q: URLSearchParams, key: string, def: number): number {
  const v = q.get(key);
  if (!v) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export const mockTransport: Transport = async (url, method) => {
  let pathname = url.split('?')[0];
  if (pathname && !pathname.startsWith('/')) pathname = `/${pathname}`;
  if (pathname === '/doctors') {
    const q = parseQuery(url);
    const page = Math.max(1, num(q, 'page', 1));
    const pageSize = Math.min(50, Math.max(1, num(q, 'pageSize', 10)));
    const filters = splitJSON(q.get('filters'));
    const sortBy = q.get('sortBy') as
      | 'rating'
      | 'fee'
      | 'experience'
      | undefined;
    const result = getDoctorsPage(page, pageSize, filters, sortBy);
    return json(200, { ...result, count: DOCTOR_COUNT });
  }

  const bookMatch = /^\/doctors\/([\w-]+)\/book$/.exec(pathname);
  if (bookMatch) {
    if (method === 'POST')
      return json(200, { ok: true, bookingId: `bk-${Date.now()}` });
    return json(405, { error: 'Method not allowed' });
  }
  const cancelMatch = /^\/bookings\/([\w-]+)$/.exec(pathname);
  if (cancelMatch) {
    if (method === 'DELETE') return json(200, { ok: true });
    return json(405, { error: 'Method not allowed' });
  }
  const orderMatch = /^\/orders$/.exec(pathname);
  if (orderMatch) {
    if (method === 'POST')
      return json(200, { ok: true, orderId: `ord-${Date.now()}` });
    return json(405, { error: 'Method not allowed' });
  }

  const doctorMatch = /^\/doctors\/([\w-]+)$/.exec(pathname);
  if (doctorMatch) {
    const rank = rankFromId(doctorMatch[1], 'doc');
    if (rank == null) return json(404, { error: 'Not found' });
    const doctor = getDoctorByRank(rank);
    const q = parseQuery(url);
    const dateISO = q.get('date') ?? todayISO();
    const mode = (q.get('mode') as never) || undefined;
    const includeBooked = q.get('includeBooked') === '1';
    const slots = getDoctorSlots(doctor, dateISO, mode, includeBooked);
    if (method !== 'GET') {
      throw new ApiError('Slot conflict', {
        code: ApiErrorCodes.FAILURE,
        status: 409,
      });
    }
    return json(200, { doctor, slots });
  }

  if (pathname === '/products') {
    const q = parseQuery(url);
    const page = Math.max(1, num(q, 'page', 1));
    const pageSize = Math.min(40, Math.max(1, num(q, 'pageSize', 10)));
    const filters = splitJSON(q.get('filters')) || {};
    const sort = (q.get('sort') || 'relevance') as
      | 'relevance'
      | 'price-asc'
      | 'price-desc'
      | 'rating'
      | 'newest';
    const infinite = q.get('infinite') === '1';
    const result = getProductsPage(page, pageSize, filters, sort, infinite);
    return json(200, { ...result, count: PRODUCT_COUNT });
  }

  const productMatch = /^\/products\/([\w-]+)$/.exec(pathname);
  if (productMatch) {
    const product = getProductById(productMatch[1]);
    if (!product) return json(404, { error: 'Not found' });
    return json(200, product);
  }

  if (pathname === '/health/records') {
    const q = parseQuery(url);
    const filters = splitJSON(q.get('filters')) || {};
    const grouped = q.get('grouped') === '1';
    const records = queryRecords(filters);
    if (grouped)
      return json(200, {
        groups: groupByMonth(records),
        total: records.length,
      });
    return json(200, { items: records, total: records.length });
  }

  const recMatch = /^\/health\/records\/([\w-]+)$/.exec(pathname);
  if (recMatch) {
    const rec = getRecordById(recMatch[1]);
    if (!rec) return json(404, { error: 'Not found' });
    return json(200, rec);
  }
  if (pathname === '/health/tags') {
    return json(200, getAllRecordTags());
  }

  logger.warn(`Unhandled mock route: ${url}`);
  return json(404, { error: `No mock route for ${pathname}` });
};

function rankFromId(id: string, prefix: string): number | null {
  if (!id.startsWith(prefix + '-')) return null;
  const rank = Number(id.slice(prefix.length + 1)) - 1;
  return rank >= 0 ? rank : null;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(
    2,
    '0',
  )}-${`${d.getDate()}`.padStart(2, '0')}`;
}

function splitJSON(raw: string | null): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export { getProductByRank };
