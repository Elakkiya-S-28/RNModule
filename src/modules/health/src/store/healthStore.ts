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
  error: string | null;
  filters: HealthFilters;
  search: string;
  load: (reset?: boolean) => Promise<void>;
  setSearch: (q: string) => void;
  applyFilters: (f: Partial<HealthFilters>) => void;
  toggleKind: (k: RecordKind) => void;
  toggleTag: (t: string) => void;
  clearFilters: () => void;
}

/**
 * Health Records store: fetches + groups records by month/year from the API
 * (with caching), and composes query/tag/kind filters.
 */
export const useHealthStore = create<HealthState>((set, get) => ({
  groups: [],
  total: 0,
  loading: false,
  error: null,
  filters: {},
  search: '',

  load: async (reset = true) => {
    set({ loading: true, error: null });
    const filters: HealthFilters = { ...get().filters, query: get().search || undefined };
    try {
      const { groups, total } = await healthService.getTimeline(filters);
      set({ groups: reset ? groups : groups, total, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  setSearch: q => {
    set({ search: q });
    get().load(true);
  },

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

/** Flatten groups to a flat list for searchability. */
export function flattenGroups(groups: HealthGroup[]): HealthRecord[] {
  return groups.flatMap(g => g.records);
}