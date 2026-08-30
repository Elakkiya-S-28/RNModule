/** Health Records module domain types. */

export type RecordKind =
  | 'lab-report'
  | 'prescription'
  | 'consultation'
  | 'vaccination'
  | 'allergy';

export type RecordStatus = 'normal' | 'attention' | 'critical';

export interface HealthRecord {
  id: string;
  kind: RecordKind;
  title: string;
  provider: string;
  /** Epoch ms of the event. */
  dateTs: number;
  notes: string;
  tags: string[];
  /** Attachments: image urls or data-uris / pdf references. */
  attachments: Attachment[];
  status: RecordStatus;
  /** Stored for testability. */
  values?: { key: string; value: string }[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'pdf' | 'doc';
  /** Local or remote path. For images, a uri usable by <Image>. */
  uri: string;
  name: string;
}

export interface HealthFilters {
  query?: string;
  kinds?: RecordKind[];
  tags?: string[];
  afterTs?: number | null;
  beforeTs?: number | null;
}

/** Grouped view: month-year label -> records sorted desc. */
export interface HealthGroup {
  label: string; // "Aug 2026"
  year: number;
  month: number; // 1-12
  records: HealthRecord[];
}