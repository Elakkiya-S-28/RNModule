import { api } from '../../../../core/api';
import { mockTransport } from '../../../../core/db/mockServer';
import {
  HealthFilters,
  HealthGroup,
  HealthRecord,
  RecordKind,
} from '../types/health';
import { queryRecords, groupByMonth, getRecordById } from './healthRepo';

api.useTransport(mockTransport);

async function getTimeline(filters: HealthFilters): Promise<{ groups: HealthGroup[]; total: number }> {
  const qs = new URLSearchParams();
  qs.set('grouped', '1');
  if (filters.query) qs.set('query', filters.query);
  if (filters.kinds?.length) qs.set('kinds', JSON.stringify(filters.kinds));
  if (filters.tags?.length) qs.set('tags', JSON.stringify(filters.tags));
  if (filters.afterTs != null) qs.set('afterTs', String(filters.afterTs));
  if (filters.beforeTs != null) qs.set('beforeTs', String(filters.beforeTs));
  const url = `health/records?${qs.toString()}`;
  return api.get<{ groups: HealthGroup[]; total: number }>(url, {
    cacheKey: `health:timeline:${url}`,
    cacheTtlMs: 2 * 60 * 1000,
  });
}

async function getRecord(id: string): Promise<HealthRecord | null> {
  const local = getRecordById(id);
  if (local) return local;
  try {
    return await api.get<HealthRecord>(`health/records/${id}`, { cacheKey: `health:${id}` });
  } catch {
    return null;
  }
}

async function getTags(): Promise<string[]> {
  try {
    return await api.get<string[]>(`health/tags`, { cacheKey: 'health:tags' });
  } catch {
    return [];
  }
}

const KIND_LABELS: Record<RecordKind, string> = {
  'lab-report': 'Lab Report',
  prescription: 'Prescription',
  consultation: 'Consultation',
  vaccination: 'Vaccination',
  allergy: 'Allergy',
};

export const healthService = {
  getTimeline,
  getRecord,
  getTags,
  KIND_LABELS,
};
export { queryRecords, groupByMonth };