import { create } from 'zustand';
import {
  HealthRecord,
  HealthFilters,
  HealthGroup,
  RecordKind,
} from '../types/health';
import { healthService } from '../services/healthApi';

interface HealthState {
  groups: HealthGroup[];
  total: number;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  filters: HealthFilters;
  search: string;
  load: (reset?: boolean) => Promise<void>;
  setSearch: (q: string) => void;
  clearSearch: () => void;
  applyFilters: (f: Partial<HealthFilters>) => void;
  toggleKind: (k: RecordKind) => void;
  toggleTag: (t: string) => void;
  clearFilters: () => void;
}

let requestSeq = 0;

export const useHealthStore = create<HealthState>((set, get) => ({
  groups: [],
  total: 0,
  loading: false,
  initialLoading: false,
  error: null,
  filters: {},
  search: '',

  load: async (reset = true) => {
    const seq = ++requestSeq;
    set(
      reset
        ? { initialLoading: get().groups.length === 0, loading: true, error: null }
        : { loading: true, error: null },
    );
    const filters: HealthFilters = {
      ...get().filters,
      query: get().search.trim() || undefined,
    };
    try {
      const { groups, total } = await healthService.getTimeline(filters);
      if (seq !== requestSeq) return;
      set({ groups, total, loading: false, initialLoading: false });
    } catch (e) {
      if (seq !== requestSeq) return;
      set({ loading: false, initialLoading: false, error: (e as Error).message });
    }
  },

  setSearch: q => set({ search: q }),

  clearSearch: () => set({ search: '' }),

  applyFilters: f => {
    set(state => ({ filters: { ...state.filters, ...f } }));
    get().load(true);
  },

  toggleKind: k => {
    const cur = get().filters.kinds ?? [];
    const next = cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k];
    get().applyFilters({ kinds: next.length ? next : undefined });
  },

  toggleTag: t => {
    const cur = get().filters.tags ?? [];
    const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
    get().applyFilters({ tags: next.length ? next : undefined });
  },

  clearFilters: () => {
    set({ filters: {}, search: '' });
    get().load(true);
  },
}));

export function flattenGroups(groups: HealthGroup[]): HealthRecord[] {
  return groups.flatMap(g => g.records);
}
