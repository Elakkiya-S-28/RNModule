import { create } from 'zustand';
import {
  Product,
  ProductCategory,
  ProductFilters,
  SortOption,
} from '../types/shop';
import { shopService } from '../services/shopApi';

export type { SortOption };

interface ProductListState {
  products: Product[];
  total: number;
  loadedCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  sort: SortOption;
  search: string;
  load: (reset?: boolean) => Promise<void>;
  setSearch: (q: string) => void;
  clearSearch: () => void;
  applyFilters: (f: Partial<ProductFilters>, reset?: boolean) => void;
  toggleCategory: (cat: ProductCategory) => void;
  setSort: (sort: SortOption) => void;
  clearFilters: () => void;
}

let requestSeq = 0;

export const useProductListStore = create<ProductListState>((set, get) => ({
  products: [],
  total: 0,
  loadedCount: 0,
  page: 0,
  pageSize: 12,
  hasMore: true,
  loading: false,
  initialLoading: false,
  error: null,
  filters: {},
  sort: 'relevance',
  search: '',

  load: async (reset = true) => {
    const s = get();
    if (!reset) {
      if (!s.hasMore || s.loading) return;
    }
    const seq = ++requestSeq;
    const page = reset ? 1 : s.page + 1;
    set(
      reset
        ? { initialLoading: s.products.length === 0, loading: true, error: null }
        : { loading: true, error: null },
    );
    const filters: ProductFilters = { ...s.filters, query: s.search.trim() || undefined };
    try {
      const result = await shopService.listProducts(filters, page, s.pageSize, s.sort, true);
      if (seq !== requestSeq) return;
      set(prev => ({
        products: reset ? result.items : [...prev.products, ...result.items],
        total: result.total,
        page,
        hasMore: result.hasMore,
        loadedCount: reset
          ? result.items.length
          : prev.products.length + result.items.length,
        loading: false,
        initialLoading: false,
      }));
    } catch (e) {
      if (seq !== requestSeq) return;
      set({ loading: false, initialLoading: false, error: (e as Error).message });
    }
  },

  setSearch: q => set({ search: q }),

  clearSearch: () => set({ search: '' }),

  applyFilters: (f, reset = true) => {
    set(state => ({ filters: { ...state.filters, ...f } }));
    if (reset) get().load(true);
  },

  toggleCategory: cat => {
    const cur = get().filters.categories ?? [];
    const next = cur.includes(cat) ? cur.filter(x => x !== cat) : [...cur, cat];
    get().applyFilters({ categories: next.length ? next : undefined });
  },

  setSort: sort => {
    set({ sort });
    get().load(true);
  },

  clearFilters: () => {
    set({ filters: {}, search: '' });
    get().load(true);
  },
}));

export function useProducts(): Product[] {
  return useProductListStore(s => s.products);
}

export function useProductSearch(): string {
  return useProductListStore(s => s.search);
}
