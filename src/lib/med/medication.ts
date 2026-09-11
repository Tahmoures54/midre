import type { AccentId, DoseStatus, HistoryRecord, Medication } from "./types.ts";
import { ACCENTS, MAX_HISTORY_RECORDS } from "./types.ts";
import {
  inferScheduleKind,
  intervalSecondsForTimes,
  nextDoseAfterAction,
  normalizeTimes,
  progressDenominator,
} from "./schedule.ts";

export function trimHistory(history: HistoryRecord[] | undefined): HistoryRecord[] {
  const list = Array.isArray(history) ? history : [];
  if (list.length <= MAX_HISTORY_RECORDS) return list;
  return [...list].sort((a, b) => a.takenAt - b.takenAt).slice(-MAX_HISTORY_RECORDS);
}

export function remainingSeconds(m: Pick<Medication, "running" | "nextDoseAt" | "pendingDose">, now = Date.now()): number {
  if (m.pendingDose) return 0;
  if (!m.running || !m.nextDoseAt) return 0;
  return Math.max(0, Math.ceil((m.nextDoseAt - now) / 1000));
}

export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const clock = [hours, minutes, secs].map((n) => String(n).padStart(2, "0")).join(":");
  if (days > 0) return `${days} روز ${clock}`;
  return clock;
}

export function formatFaTime(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

export function formatFaDateTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const time = date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  return sameDay ? `امروز ${time}` : `${date.toLocaleDateString("fa-IR")} ${time}`;
}

export function formatInterval(seconds: number): string {
  if (seconds < 3600) {
    const m = Math.max(1, Math.round(seconds / 60));
    return `${m} دقیقه`;
  }
  const h = seconds / 3600;
  if (Number.isInteger(h)) return `${h} ساعت`;
  return `${h.toFixed(1)} ساعت`;
}

export function formatTimesLabel(times: string[]): string {
  if (!times.length) return "ساعات مشخص";
  return times
    .map((t) => {
      const [hh, mm] = t.split(":");
      const d = new Date();
      d.setHours(Number(hh), Number(mm), 0, 0);
      return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    })
    .join(" · ");
}

export function intervalFromHours(hours: number): number {
  return Math.max(1, Math.round(hours * 3600));
}

/** Classify adherence. remaining is never used — only absolute timestamps. */
export function statusFor(takenAt: number, scheduledAt?: number): DoseStatus {
  if (!scheduledAt) return "on-time";
  const delta = takenAt - scheduledAt;
  if (delta < -30 * 60 * 1000) return "early";
  if (delta > 4 * 60 * 60 * 1000) return "missed";
  if (delta > 60 * 60 * 1000) return "late";
  return "on-time";
}

export function toDue(m: Medication, now = Date.now()): Medication {
  return {
    ...m,
    running: false,
    pendingDose: true,
    dueScheduledAt: m.dueScheduledAt ?? m.nextDoseAt ?? now,
    updatedAt: now,
  };
}

function historyTake(m: Medication, now: number, scheduledAt?: number): HistoryRecord {
  return {
    id: crypto.randomUUID(),
    takenAt: now,
    scheduledAt,
    status: statusFor(now, scheduledAt),
    snoozeCount: m.snoozeCount || 0,
  };
}

export function applyTake(m: Medication, now = Date.now()): Medication {
  const scheduledAt = m.dueScheduledAt ?? m.nextDoseAt;
  const quantity = Math.max(0, m.quantity - 1);
  return {
    ...m,
    quantity,
    history: trimHistory([...(m.history || []), historyTake(m, now, scheduledAt)]),
    lastTakenAt: now,
    pendingDose: false,
    dueScheduledAt: undefined,
    snoozeCount: 0,
    running: true,
    nextDoseAt: nextDoseAfterAction(m, now),
    updatedAt: now,
  };
}

export function applySnooze(m: Medication, minutes = 10, now = Date.now()): Medication {
  const secs = Math.max(1, Math.round(minutes * 60));
  return {
    ...m,
    pendingDose: false,
    running: true,
    snoozeCount: (m.snoozeCount || 0) + 1,
    nextDoseAt: now + secs * 1000,
    updatedAt: now,
  };
}

export function applySkip(m: Medication, now = Date.now()): Medication {
  const record: HistoryRecord = {
    id: crypto.randomUUID(),
    takenAt: now,
    scheduledAt: m.dueScheduledAt ?? m.nextDoseAt,
    status: "skipped",
    snoozeCount: m.snoozeCount || 0,
  };
  return {
    ...m,
    history: trimHistory([...(m.history || []), record]),
    pendingDose: false,
    dueScheduledAt: undefined,
    snoozeCount: 0,
    running: true,
    nextDoseAt: nextDoseAfterAction(m, now),
    updatedAt: now,
  };
}

export function applyToggle(m: Medication, now = Date.now()): Medication {
  const running = !m.running;
  if (!running) {
    return {
      ...m,
      running: false,
      pendingDose: false,
      dueScheduledAt: undefined,
      nextDoseAt: undefined,
      updatedAt: now,
    };
  }
  return {
    ...m,
    running: true,
    pendingDose: false,
    dueScheduledAt: undefined,
    nextDoseAt:
      m.scheduleKind === "times" && m.times.length > 0 ? nextDoseAfterAction({ ...m, dueScheduledAt: undefined, nextDoseAt: undefined }, now) : now + m.interval * 1000,
    updatedAt: now,
  };
}

export function applyReset(m: Medication, now = Date.now()): Medication {
  const history = [...(m.history || [])];
  if (m.pendingDose) {
    history.push({
      id: crypto.randomUUID(),
      takenAt: now,
      scheduledAt: m.dueScheduledAt ?? m.nextDoseAt,
      status: "skipped",
      snoozeCount: m.snoozeCount || 0,
    });
  }
  return {
    ...m,
    history: trimHistory(history),
    running: false,
    pendingDose: false,
    dueScheduledAt: undefined,
    nextDoseAt: undefined,
    snoozeCount: 0,
    updatedAt: now,
  };
}

export function applyRefill(m: Medication, add: number, now = Date.now()): Medication {
  const extra = Math.max(0, Math.round(add));
  return {
    ...m,
    quantity: m.quantity + extra,
    updatedAt: now,
  };
}

function asAccent(value: unknown): AccentId {
  return ACCENTS.includes(value as AccentId) ? (value as AccentId) : "sage";
}

export function sanitizeMedication(raw: Partial<Medication> & { name?: string }): Omit<Medication, "id"> & { id?: number } {
  const scheduleKind = inferScheduleKind(raw);
  const times = scheduleKind === "times" ? normalizeTimes(raw.times) : [];
  const intervalFromRaw = Number(raw.interval);
  const hoursRaw = Number(raw.intervalHours);
  let interval =
    Number.isFinite(intervalFromRaw) && intervalFromRaw > 0
      ? intervalFromRaw
      : intervalFromHours(Number.isFinite(hoursRaw) && hoursRaw > 0 ? hoursRaw : 8);
  let intervalHours = Number.isFinite(hoursRaw) && hoursRaw > 0 ? hoursRaw : interval / 3600;
  if (scheduleKind === "times") {
    interval = intervalSecondsForTimes(times);
    intervalHours = times.length > 0 ? 24 / times.length : 24;
  }
  const now = Date.now();
  return {
    id: raw.id,
    name: String(raw.name || "").trim() || "دارو",
    condition: String(raw.condition || "").trim(),
    dosage: String(raw.dosage || "").trim() || "—",
    notes: String(raw.notes || "").trim(),
    accent: asAccent(raw.accent),
    scheduleKind,
    interval,
    intervalHours,
    times,
    quantity: Math.max(0, Number(raw.quantity) || 0),
    running: Boolean(raw.running),
    nextDoseAt: raw.nextDoseAt,
    dueScheduledAt: raw.dueScheduledAt,
    lastTakenAt: raw.lastTakenAt,
    pendingDose: Boolean(raw.pendingDose),
    snoozeCount: Number(raw.snoozeCount) || 0,
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
    history: trimHistory(raw.history),
  };
}

/** @deprecated use onTimeRate — kept so older imports keep compiling. */
export function adherenceScore(history: HistoryRecord[]): number {
  const taken = history.filter((h) => h.status !== "skipped" && h.status !== "snoozed");
  if (!taken.length) return 0;
  const onTime = taken.filter((h) => h.status === "on-time").length;
  return Math.round((onTime / taken.length) * 100);
}

export { progressDenominator };
