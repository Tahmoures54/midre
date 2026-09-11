import type { HistoryRecord, Medication } from "./types";
import { sameLocalDay, startOfLocalDay } from "./schedule";

export function takenStatuses(history: HistoryRecord[]): HistoryRecord[] {
  return history.filter((h) => h.status !== "skipped" && h.status !== "snoozed");
}

/** On-time share among actually taken doses (skips excluded). */
export function onTimeRate(history: HistoryRecord[]): number {
  const taken = takenStatuses(history);
  if (!taken.length) return 0;
  const onTime = taken.filter((h) => h.status === "on-time").length;
  return Math.round((onTime / taken.length) * 100);
}

/** Taken vs skipped+missed. */
export function completionRate(history: HistoryRecord[]): number {
  if (!history.length) return 0;
  const taken = takenStatuses(history).length;
  return Math.round((taken / history.length) * 100);
}

export function takenToday(medications: Medication[], now = Date.now()): number {
  return medications.reduce((sum, med) => {
    return sum + (med.history || []).filter((h) => sameLocalDay(h.takenAt, now) && h.status !== "skipped").length;
  }, 0);
}

export function lowStockCount(medications: Medication[]): number {
  return medications.filter((m) => m.quantity > 0 && m.quantity <= 5).length;
}

export function emptyStockCount(medications: Medication[]): number {
  return medications.filter((m) => m.quantity <= 0).length;
}

export interface DayBucket {
  start: number;
  label: string;
  taken: number;
  skipped: number;
}

export function lastNDays(history: HistoryRecord[], days: number, now = Date.now()): DayBucket[] {
  const todayStart = startOfLocalDay(now);
  const buckets: DayBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = todayStart - i * 86_400_000;
    const label = new Date(start).toLocaleDateString("fa-IR", { weekday: "short" });
    const rows = history.filter((h) => sameLocalDay(h.takenAt, start));
    buckets.push({
      start,
      label,
      taken: rows.filter((h) => h.status !== "skipped" && h.status !== "snoozed").length,
      skipped: rows.filter((h) => h.status === "skipped" || h.status === "missed").length,
    });
  }
  return buckets;
}

/** Consecutive local days, ending today, with at least one taken dose. */
export function streakDays(history: HistoryRecord[], now = Date.now()): number {
  const taken = takenStatuses(history);
  if (!taken.length) return 0;
  let streak = 0;
  let cursor = startOfLocalDay(now);
  for (;;) {
    const hit = taken.some((h) => sameLocalDay(h.takenAt, cursor));
    if (!hit) {
      if (streak === 0 && cursor === startOfLocalDay(now)) {
        cursor -= 86_400_000;
        continue;
      }
      break;
    }
    streak += 1;
    cursor -= 86_400_000;
    if (streak > 365) break;
  }
  return streak;
}

export function sortMedications(list: Medication[]): Medication[] {
  const rank = (m: Medication) => {
    if (m.pendingDose) return 0;
    if (m.quantity <= 0) return 1;
    if (m.running && m.nextDoseAt) return 2;
    return 3;
  };
  return [...list].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    const ta = a.pendingDose ? 0 : a.nextDoseAt ?? Number.MAX_SAFE_INTEGER;
    const tb = b.pendingDose ? 0 : b.nextDoseAt ?? Number.MAX_SAFE_INTEGER;
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name, "fa");
  });
}
