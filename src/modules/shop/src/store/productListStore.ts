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
  error: string | null;
  filters: ProductFilters;
  sort: SortOption;
  search: string;
  load: (reset?: boolean) => Promise<void>;
  setSearch: (q: string) => void;
  applyFilters: (f: Partial<ProductFilters>, reset?: boolean) => void;
  toggleCategory: (cat: ProductCategory) => void;
  setSort: (sort: SortOption) => void;
  clearFilters: () => void;
}

/** Shop product feed store: infinite scroll + filters + sorting. */
export const useProductListStore = create<ProductListState>((set, get) => ({
  products: [],
  total: 0,
  loadedCount: 0,
  page: 0,
  pageSize: 12,
  hasMore: true,
  loading: false,
  error: null,
  filters: {},
  sort: 'relevance',
  search: '',

  load: async (reset = false) => {
    const s = get();
    const page = reset ? 1 : s.page + 1;
    if (!reset && !s.hasMore) return;
    if (s.loading && !reset) return;
    set({ loading: true, error: null });
    const filters: ProductFilters = { ...s.filters, query: s.search || undefined };
    try {
      const result = await shopService.listProducts(
        filters,
        page,
        s.pageSize,
        s.sort,
        true,
      );
      set(prev => ({
        products: reset ? result.items : [...prev.products, ...result.items],
        total: result.total,
        page,
        hasMore: result.hasMore,
        loadedCount: reset ? result.items.length : prev.products.length + result.items.length,
        loading: false,
      }));
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  setSearch: q => {
    set({ search: q });
    get().load(true);
  },

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