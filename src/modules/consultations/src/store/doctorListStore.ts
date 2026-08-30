import { create } from 'zustand';
import {
  Doctor,
  DoctorFilters,
  DoctorListResult,
  Specialization,
  ConsultationMode,
} from '../types/ct';
import { consultationService } from '../services/consultationApi';

export type DoctorSort = 'relevance' | 'rating' | 'fee' | 'experience';

interface DoctorListState {
  doctors: Doctor[];
  total: number;
  loadedCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  filters: DoctorFilters;
  sortBy: DoctorSort;
  search: string;
  listDoctors: (reset?: boolean) => Promise<void>;
  setSearch: (q: string) => void;
  applyFilters: (f: Partial<DoctorFilters>, reset?: boolean) => void;
  toggleSpecialization: (s: Specialization) => void;
  setMode: (m: ConsultationMode | null) => void;
  setSort: (sort: DoctorSort) => void;
  clearFilters: () => void;
}

/**
 * Doctor listing store: handles search debouncing at the call-site, filter
 * composition, pagination and infinite-"load more" semantics. All data flows
 * through the API layer (with caching) for consistency.
 */
export const useDoctorListStore = create<DoctorListState>((set, get) => ({
  doctors: [],
  total: 0,
  loadedCount: 0,
  page: 0,
  pageSize: 10,
  hasMore: true,
  loading: false,
  error: null,
  filters: {},
  sortBy: 'relevance',
  search: '',

  listDoctors: async (reset = false) => {
    const state = get();
    const page = reset ? 1 : state.page + 1;
    if (!reset && !state.hasMore) return;
    if (state.loading && !reset) return;
    set({ loading: true, error: null });

    const filters: DoctorFilters = {
      ...state.filters,
      query: state.search || undefined,
    };
    try {
      const result: DoctorListResult = await consultationService.listDoctors(
        filters,
        page,
        state.pageSize,
        state.sortBy === 'relevance' ? undefined : state.sortBy,
      );
      set(s => ({
        doctors: reset ? result.items : [...s.doctors, ...result.items],
        total: result.total,
        page,
        hasMore: page * state.pageSize < result.total,
        loadedCount: reset ? result.items.length : s.doctors.length + result.items.length,
        loading: false,
      }));
    } catch (e) {
      set({ loading: false, error: (e as Error).message || 'Failed to load doctors' });
    }
  },

  setSearch: q => {
    set({ search: q });
    get().listDoctors(true);
  },

  applyFilters: (f, reset = true) => {
    set(state => ({ filters: { ...state.filters, ...f } }));
    if (reset) get().listDoctors(true);
  },

  toggleSpecialization: s => {
    const cur = get().filters.specializations ?? [];
    const next = cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s];
    get().applyFilters({ specializations: next.length ? next : undefined });
  },

  setMode: m => get().applyFilters({ mode: m ?? null }),

  setSort: sort => {
    set({ sortBy: sort });
    get().listDoctors(true);
  },

  clearFilters: () => {
    set({ filters: {}, search: '' });
    get().listDoctors(true);
  },
}));

export function useDoctors(): Doctor[] {
  return useDoctorListStore(s => s.doctors);
}