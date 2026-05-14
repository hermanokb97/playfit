export interface PlayRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  score: number;
  total?: number;
  success: boolean;
  difficulty?: string;
  details?: Record<string, string | number | boolean | null>;
}

type NewPlayRecord = Omit<PlayRecord, 'id' | 'endedAt'> & {
  endedAt?: string;
};

const STORAGE_KEY = 'playfit-records-v1';
const MAX_RECORDS = 200;

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function safeParseRecords(raw: string | null): PlayRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPlayRecord) : [];
  } catch {
    return [];
  }
}

function isPlayRecord(value: unknown): value is PlayRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<PlayRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.gameId === 'string' &&
    typeof record.gameTitle === 'string' &&
    typeof record.startedAt === 'string' &&
    typeof record.endedAt === 'string' &&
    typeof record.durationMs === 'number' &&
    typeof record.score === 'number' &&
    typeof record.success === 'boolean'
  );
}

export function getPlayRecords(): PlayRecord[] {
  try {
    return safeParseRecords(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function addPlayRecord(record: NewPlayRecord): PlayRecord {
  const saved: PlayRecord = {
    ...record,
    id: makeId(),
    endedAt: record.endedAt ?? new Date().toISOString(),
  };

  try {
    const records = [saved, ...getPlayRecords()].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* ignore storage failures */
  }

  return saved;
}

export function clearPlayRecords() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore storage failures */
  }
}

function csvValue(value: unknown): string {
  if (value == null) return '';
  const text = String(value).replaceAll('"', '""');
  return /[",\n\r]/.test(text) ? `"${text}"` : text;
}

function formatDetails(record: PlayRecord): string {
  if (!record.details) return '';
  return Object.entries(record.details)
    .map(([key, value]) => `${key}: ${value ?? ''}`)
    .join('; ');
}

export function recordsToCsv(records: PlayRecord[]): string {
  const headers = [
    '게임',
    '시작 시간',
    '종료 시간',
    '플레이 시간(초)',
    '점수',
    '전체',
    '성공',
    '난이도',
    '상세',
  ];

  const rows = records.map((record) => [
    record.gameTitle,
    record.startedAt,
    record.endedAt,
    Math.round(record.durationMs / 1000),
    record.score,
    record.total ?? '',
    record.success ? '성공' : '진행',
    record.difficulty ?? '',
    formatDetails(record),
  ]);

  return [headers, ...rows]
    .map((row) => row.map(csvValue).join(','))
    .join('\n');
}

export function exportPlayRecordsCsv(records: PlayRecord[]) {
  const csv = `\uFEFF${recordsToCsv(records)}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `playfit-records-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
