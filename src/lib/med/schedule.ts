import type { HistoryRecord, Medication, ScheduleKind } from "./types";

export function parseHm(hm: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(hm).trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isInteger(h) || !Number.isInteger(m) || h > 23 || m > 59) return null;
  return { h, m };
}

export function formatHm(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function normalizeTimes(times: unknown): string[] {
  if (!Array.isArray(times)) return [];
  const unique = new Set<string>();
  for (const value of times) {
    const parsed = parseHm(String(value));
    if (parsed) unique.add(formatHm(parsed.h, parsed.m));
  }
  return [...unique].sort();
}

function atLocal(base: Date, h: number, m: number): number {
  const next = new Date(base.getTime());
  next.setHours(h, m, 0, 0);
  return next.getTime();
}

/** First scheduled instant strictly after `fromMs`. */
export function nextOccurrence(times: string[], fromMs: number): number {
  const list = normalizeTimes(times);
  if (!list.length) return fromMs + 86_400_000;
  const from = new Date(fromMs);
  for (let day = 0; day <= 2; day++) {
    const dayBase = new Date(from.getTime());
    dayBase.setDate(from.getDate() + day);
    for (const stamp of list) {
      const parsed = parseHm(stamp);
      if (!parsed) continue;
      const candidate = atLocal(dayBase, parsed.h, parsed.m);
      if (candidate > fromMs) return candidate;
    }
  }
  const parsed = parseHm(list[0])!;
  const fallback = new Date(from.getTime());
  fallback.setDate(from.getDate() + 1);
  return atLocal(fallback, parsed.h, parsed.m);
}

export function intervalSecondsForTimes(times: string[]): number {
  const list = normalizeTimes(times);
  if (list.length <= 1) return 86_400;
  const minutes = list.map((stamp) => {
    const parsed = parseHm(stamp)!;
    return parsed.h * 60 + parsed.m;
  });
  let minGap = 24 * 60;
  for (let i = 0; i < minutes.length; i++) {
    const current = minutes[i];
    const following = i === minutes.length - 1 ? minutes[0] + 24 * 60 : minutes[i + 1];
    minGap = Math.min(minGap, following - current);
  }
  return Math.max(60, minGap * 60);
}

export function startOfLocalDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function sameLocalDay(a: number, b: number): boolean {
  return startOfLocalDay(a) === startOfLocalDay(b);
}

export function hmFromTs(ts: number): string {
  const d = new Date(ts);
  return formatHm(d.getHours(), d.getMinutes());
}

export function slotOnDay(dayStart: number, hm: string): number | null {
  const parsed = parseHm(hm);
  if (!parsed) return null;
  return atLocal(new Date(dayStart), parsed.h, parsed.m);
}

export function nextDoseAfterAction(
  m: Pick<Medication, "scheduleKind" | "times" | "interval" | "dueScheduledAt" | "nextDoseAt">,
  now: number,
): number {
  if (m.scheduleKind === "times" && m.times.length > 0) {
    const consumed = Math.max(now, m.dueScheduledAt ?? m.nextDoseAt ?? now);
    return nextOccurrence(m.times, consumed);
  }
  return now + Math.max(1, m.interval) * 1000;
}

export function progressDenominator(m: Pick<Medication, "scheduleKind" | "times" | "interval">): number {
  if (m.scheduleKind === "times") return intervalSecondsForTimes(m.times);
  return Math.max(1, m.interval);
}

export type TodayState = "due" | "upcoming" | "taken" | "skipped";

export interface TodayItem {
  key: string;
  medicationId: number;
  name: string;
  dosage: string;
  accent: Medication["accent"];
  at: number;
  state: TodayState;
}

function matchingRecord(history: HistoryRecord[], slot: number): HistoryRecord | undefined {
  const windowMs = 3 * 60 * 1000;
  return [...history]
    .sort((a, b) => b.takenAt - a.takenAt)
    .find((record) => {
      const target = record.scheduledAt ?? record.takenAt;
      return Math.abs(target - slot) <= windowMs || (sameLocalDay(target, slot) && hmFromTs(target) === hmFromTs(slot));
    });
}

function isActiveSlot(med: Medication, at: number): boolean {
  const target = med.dueScheduledAt ?? med.nextDoseAt;
  if (target == null) return false;
  return Math.abs(target - at) < 60_000 || (sameLocalDay(target, at) && hmFromTs(target) === hmFromTs(at));
}

export function todaysPlan(medications: Medication[], now: number): TodayItem[] {
  const dayStart = startOfLocalDay(now);
  const dayEnd = dayStart + 86_400_000;
  const items: TodayItem[] = [];

  for (const med of medications) {
    if (med.scheduleKind === "times" && med.times.length > 0) {
      for (const stamp of med.times) {
        const at = slotOnDay(dayStart, stamp);
        if (at == null) continue;
        const record = matchingRecord(med.history || [], at);
        let state: TodayState | null = null;
        if (record?.status === "skipped") state = "skipped";
        else if (record && record.status !== "snoozed") state = "taken";
        else if (med.pendingDose && isActiveSlot(med, at)) state = "due";
        else if (at > now || (med.running && isActiveSlot(med, at))) state = "upcoming";
        if (!state) continue;
        items.push({
          key: `${med.id}-${stamp}`,
          medicationId: med.id,
          name: med.name,
          dosage: med.dosage,
          accent: med.accent,
          at,
          state,
        });
      }
      continue;
    }

    for (const record of med.history || []) {
      if (!sameLocalDay(record.takenAt, now)) continue;
      items.push({
        key: `${med.id}-h-${record.id}`,
        medicationId: med.id,
        name: med.name,
        dosage: med.dosage,
        accent: med.accent,
        at: record.takenAt,
        state: record.status === "skipped" ? "skipped" : "taken",
      });
    }

    if (med.pendingDose) {
      const at = med.dueScheduledAt ?? med.nextDoseAt ?? now;
      if (at >= dayStart && at < dayEnd) {
        items.push({
          key: `${med.id}-due`,
          medicationId: med.id,
          name: med.name,
          dosage: med.dosage,
          accent: med.accent,
          at,
          state: "due",
        });
      }
    } else if (med.nextDoseAt && med.nextDoseAt >= dayStart && med.nextDoseAt < dayEnd) {
      items.push({
        key: `${med.id}-next`,
        medicationId: med.id,
        name: med.name,
        dosage: med.dosage,
        accent: med.accent,
        at: med.nextDoseAt,
        state: "upcoming",
      });
    }
  }

  return items.sort((a, b) => a.at - b.at || a.medicationId - b.medicationId);
}

export function inferScheduleKind(raw: { scheduleKind?: unknown; times?: unknown }): ScheduleKind {
  if (raw.scheduleKind === "times" || raw.scheduleKind === "interval") return raw.scheduleKind;
  return normalizeTimes(raw.times).length > 0 ? "times" : "interval";
}
