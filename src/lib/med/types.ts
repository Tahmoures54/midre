export type DoseStatus = "on-time" | "early" | "late" | "missed" | "snoozed" | "skipped";

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
  /** Interval in seconds. */
  interval: number;
  intervalHours: number;
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

export const SCHEMA_VERSION = 6;
export const MAX_HISTORY_RECORDS = 120;
export const APP_VERSION = "3.2.2";
