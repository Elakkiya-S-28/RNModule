import {
  HealthRecord,
  HealthFilters,
  HealthGroup,
  RecordKind,
} from '../types/health';
import { SEEDS, mulberry32 } from '../../../../core/db/mock/names';

export const HEALTH_RECORD_COUNT = 10000;

const KINDS: RecordKind[] = ['lab-report', 'prescription', 'consultation', 'vaccination', 'allergy'];
const TITLES: Record<RecordKind, string[]> = {
  'lab-report': ['Complete Blood Count', 'Thyroid Panel', 'Lipid Profile', 'Liver Function Test', 'Vitamin D Test'],
  prescription: ['Antibiotic Course', 'Herbal Tonic Prescription', 'Pain Relief Rx', 'Gut Cleansing Formula'],
  consultation: ['Consultation Follow-up', 'Annual Health Check-up', 'Ayurvedic Assessment'],
  vaccination: ['Hepatitis B Booster', 'Tetanus Shot', 'Flu Vaccine', 'COVID Booster'],
  allergy: ['Dust Allergy', 'Pollen Sensitivity', 'Lactose Intolerance', 'Nickel Contact Allergy'],
};
const PROVIDERS = [
  'Amrutam Lab', 'Swasthya Path Lab', 'Dr. Mehta Clinic', 'Apollo Diagnostics',
  'AyurVeda Wellness', 'City General Hospital', 'Medlife Labs', 'Sunrise Diagnostics',
];
const TAGS_POOL = ['routine', 'preventive', 'chronic', 'urgent', 'follow-up', 'critical', 'herbal', 'allergy'];

const recordCache = new Map<number, HealthRecord>();

export function getRecordByRank(rank: number): HealthRecord {
  const cached = recordCache.get(rank);
  if (cached) return cached;
  const rng = mulberry32(SEEDS.records + rank);
  const kind = KINDS[Math.floor(rng() * KINDS.length)];
  const titles = TITLES[kind];
  const title = titles[Math.floor(rng() * titles.length)];
  const daysAgo = Math.floor(rng() * 1095);
  const dateTs = Date.now() - daysAgo * 86400000;
  const provider = PROVIDERS[Math.floor(rng() * PROVIDERS.length)];
  const status =
    rng() < 0.6 ? 'normal' : rng() < 0.8 ? 'attention' : 'critical';

  const record: HealthRecord = {
    id: `rec-${rank + 1}`,
    kind,
    title,
    provider,
    dateTs,
    notes:
      rng() < 0.5
        ? 'Results are within reference range. No action required.'
        : 'Please follow up with your physician; values indicate mild variation.',
    tags: Array.from(
      new Set([
        TAGS_POOL[Math.floor(rng() * TAGS_POOL.length)],
        rng() < 0.5 ? TAGS_POOL[Math.floor(rng() * TAGS_POOL.length)] : kind,
      ]),
    ),
    attachments:
      rng() < 0.4
        ? []
        : [
            {
              id: `att-${rank}`,
              type: rng() < 0.7 ? 'image' : 'pdf',
              uri: '',
              name: `${title.replace(/\s+/g, '-').toLowerCase()}.${rng() < 0.7 ? 'png' : 'pdf'}`,
            },
          ],
    status,
    values:
      kind === 'lab-report'
        ? [
            { key: 'Hb', value: `${(11 + rng() * 4).toFixed(1)} g/dL` },
            { key: 'WBC', value: `${(4000 + rng() * 6000)} /µL` },
          ]
        : undefined,
  };
  recordCache.set(rank, record);
  return record;
}

export function queryRecords(filters: HealthFilters = {}): HealthRecord[] {
  const out: HealthRecord[] = [];
  for (let i = 0; i < HEALTH_RECORD_COUNT; i++) {
    const r = getRecordByRank(i);
    if (matchesRecord(r, filters)) out.push(r);
  }
  out.sort((a, b) => b.dateTs - a.dateTs);
  return out;
}

export function groupByMonth(records: HealthRecord[]): HealthGroup[] {
  const map = new Map<string, HealthGroup>();
  for (const r of records) {
    const d = new Date(r.dateTs);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;
    const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    let g = map.get(key);
    if (!g) {
      g = { label, year, month, records: [] };
      map.set(key, g);
    }
    g.records.push(r);
  }
  const groups = Array.from(map.values());
  groups.sort((a, b) => (b.year - a.year) || (b.month - a.month));
  for (const g of groups) g.records.sort((a, b) => b.dateTs - a.dateTs);
  return groups;
}

export function getRecordById(id: string): HealthRecord | null {
  const m = /^rec-(\d+)$/.exec(id);
  if (!m) return null;
  const rank = Number(m[1]) - 1;
  if (rank < 0 || rank >= HEALTH_RECORD_COUNT) return null;
  return getRecordByRank(rank);
}

export function getAllRecordTags(): string[] {
  return TAGS_POOL;
}

function matchesRecord(r: HealthRecord, f: HealthFilters): boolean {
  if (f.query) {
    const q = f.query.toLowerCase().trim();
    if (
      !r.title.toLowerCase().includes(q) &&
      !r.provider.toLowerCase().includes(q) &&
      !r.notes.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  if (f.kinds?.length && !f.kinds.includes(r.kind)) return false;
  if (f.tags?.length && !f.tags.some(t => r.tags.includes(t))) return false;
  if (f.afterTs != null && r.dateTs < f.afterTs) return false;
  if (f.beforeTs != null && r.dateTs > f.beforeTs) return false;
  return true;
}
