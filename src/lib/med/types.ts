export type DoseStatus = "on-time" | "early" | "late" | "missed" | "snoozed" | "skipped";
export type ScheduleKind = "interval" | "times";
export type AccentId = "sage" | "terra" | "olive" | "slate";

export interface HistoryRecord {
  id: string;
  takenAt: number;
  scheduledAt?: number;
  status: DoseStatus;
  snoozeCount?: number;
}

export interface Medication {
  id: number;
  name: string;
  condition: string;
  dosage: string;
  notes: string;
  accent: AccentId;
  scheduleKind: ScheduleKind;
  /** Interval in seconds — also the progress-bar denominator. */
  interval: number;
  intervalHours: number;
  /** Daily clock times as `HH:mm` when `scheduleKind` is `"times"`. */
  times: string[];
  quantity: number;
  running: boolean;
  nextDoseAt?: number;
  dueScheduledAt?: number;
  lastTakenAt?: number;
  pendingDose: boolean;
  snoozeCount: number;
  createdAt: number;
  updatedAt: number;
  history: HistoryRecord[];
}

export interface BackupPayload {
  schemaVersion: number;
  exportedAt: number;
  medications: Medication[];
}

export const SCHEMA_VERSION = 7;
export const MAX_HISTORY_RECORDS = 120;
export const APP_VERSION = "4.0.0";

export const ACCENTS: AccentId[] = ["sage", "terra", "olive", "slate"];
