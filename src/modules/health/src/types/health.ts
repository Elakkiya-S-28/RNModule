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

  dateTs: number;
  notes: string;
  tags: string[];

  attachments: Attachment[];
  status: RecordStatus;

  values?: { key: string; value: string }[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'pdf' | 'doc';

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

export interface HealthGroup {
  label: string;
  year: number;
  month: number;
  records: HealthRecord[];
}
