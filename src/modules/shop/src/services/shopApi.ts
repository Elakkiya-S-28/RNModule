import { api, flushOfflineQueue } from '../../../../core/api';
import { mockTransport } from '../../../../core/db/mockServer';
import {
  Product,
  ProductFilters,
  ProductListResult,
  SortOption,
  CheckoutSummary,
} from '../types/shop';
import { getProductById, getProductsPage, getProductByRank } from './productRepo';
import { toISODate } from '../../../../core/util/format';

// Route the shared api client through the mock transport (set already in
// consultationApi; re-asserted here for import-order safety).
api.useTransport(mockTransport);

async function listProducts(
  filters: ProductFilters,
  page: number,
  pageSize: number,
  sort: SortOption,
  infinite = false,
): Promise<ProductListResult> {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('pageSize', String(pageSize));
  qs.set('sort', sort);
  if (infinite) qs.set('infinite', '1');
  if (filters.query) qs.set('query', filters.query);
  if (filters.categories?.length) qs.set('categories', JSON.stringify(filters.categories));
  if (filters.brands?.length) qs.set('brands', JSON.stringify(filters.brands));
  if (filters.minPrice != null) qs.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) qs.set('maxPrice', String(filters.maxPrice));
  if (filters.minRating != null) qs.set('minRating', String(filters.minRating));
  if (filters.inStock) qs.set('inStock', '1');
  if (filters.herbalOnly) qs.set('herbalOnly', '1');
  const url = `products?${qs.toString()}`;
  const result = await api.get<ProductListResult>(url, {
    cacheKey: `products:${url}`,
    cacheTtlMs: 2 * 60 * 1000,
  });
  return result;
}

async function getProduct(id: string): Promise<Product | null> {
  const local = getProductById(id);
  if (local) return local;
  try {
    return await api.get<Product>(`products/${id}`, { cacheKey: `product:${id}` });
  } catch {
    return null;
  }
}

/** Compute checkout summary for a set of cart items (prices from repo). */
export function computeCheckoutSummary(
  items: { productId: string; quantity: number }[],
): CheckoutSummary {
  let subtotal = 0;
  let itemCount = 0;
  for (const it of items) {
    const p = getProductById(it.productId);
    if (!p) continue;
    subtotal += p.price * it.quantity;
    itemCount += it.quantity;
  }
  const discount = subtotal * 0.1; // mock flat 10% "offer"
  const shipping = subtotal > 500 ? 0 : 49;
  const tax = subtotal * 0.05;
  const total = subtotal - discount + shipping + tax;
  return { subtotal, discount, shipping, tax, total, itemCount };
}

async function placeOrder(): Promise<{ orderId: string; date: string }> {
  // In offline mode this request is queued by ApiClient and we optimistically
  // return an order id so the UI can show success.
  try {
    await api.post('orders', { ts: Date.now() }, { timeout: 4000, retries: 1 });
  } catch {
    // queued offline — proceed optimistically
  }
  return { orderId: `ord-${Date.now()}`, date: toISODate(Date.now()) };
}

async function syncOffline(): Promise<{ flushed: number; remaining: number }> {
  return flushOfflineQueue(mockTransport);
}

export const shopService = {
  listProducts,
  getProduct,
  computeCheckoutSummary,
  placeOrder,
  syncOffline,
};
export { getProductById, getProductsPage, getProductByRank };