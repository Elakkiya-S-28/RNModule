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
  initialLoading: boolean;
  error: string | null;
  filters: DoctorFilters;
  sortBy: DoctorSort;
  search: string;
  listDoctors: (reset?: boolean) => Promise<void>;
  setSearch: (q: string) => void;
  clearSearch: () => void;
  applyFilters: (f: Partial<DoctorFilters>, reset?: boolean) => void;
  toggleSpecialization: (s: Specialization) => void;
  setMode: (m: ConsultationMode | null) => void;
  setSort: (sort: DoctorSort) => void;
  clearFilters: () => void;
}

let requestSeq = 0;

export const useDoctorListStore = create<DoctorListState>((set, get) => ({
  doctors: [],
  total: 0,
  loadedCount: 0,
  page: 0,
  pageSize: 10,
  hasMore: true,
  loading: false,
  initialLoading: false,
  error: null,
  filters: {},
  sortBy: 'relevance',
  search: '',

  listDoctors: async (reset = true) => {
    const state = get();
    if (!reset) {
      if (!state.hasMore || state.loading) return;
    }
    const seq = ++requestSeq;
    const page = reset ? 1 : state.page + 1;
    set(
      reset
        ? { initialLoading: state.doctors.length === 0, loading: true, error: null }
        : { loading: true, error: null },
    );

    const filters: DoctorFilters = {
      ...state.filters,
      query: state.search.trim() || undefined,
    };
    try {
      const result: DoctorListResult = await consultationService.listDoctors(
        filters,
        page,
        state.pageSize,
        state.sortBy === 'relevance' ? undefined : state.sortBy,
      );
      if (seq !== requestSeq) return;
      set(s => ({
        doctors: reset ? result.items : [...s.doctors, ...result.items],
        total: result.total,
        page,
        hasMore: page * state.pageSize < result.total,
        loadedCount: reset
          ? result.items.length
          : s.doctors.length + result.items.length,
        loading: false,
        initialLoading: false,
      }));
    } catch (e) {
      if (seq !== requestSeq) return;
      set({
        loading: false,
        initialLoading: false,
        error: (e as Error).message || 'Failed to load doctors',
      });
    }
  },

  setSearch: q => set({ search: q }),

  clearSearch: () => set({ search: '' }),

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

export function useDoctorSearch(): string {
  return useDoctorListStore(s => s.search);
}
