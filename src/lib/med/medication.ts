import type { DoseStatus, HistoryRecord, Medication } from "./types";
import { MAX_HISTORY_RECORDS } from "./types";

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
    dueScheduledAt: m.nextDoseAt ?? now,
    updatedAt: now,
  };
}

export function applyTake(m: Medication, now = Date.now()): Medication {
  const scheduledAt = m.dueScheduledAt ?? m.nextDoseAt;
  const record: HistoryRecord = {
    id: crypto.randomUUID(),
    takenAt: now,
    scheduledAt,
    status: statusFor(now, scheduledAt),
    snoozeCount: m.snoozeCount || 0,
  };
  return {
    ...m,
    quantity: Math.max(0, m.quantity - 1),
    history: trimHistory([...(m.history || []), record]),
    lastTakenAt: now,
    pendingDose: false,
    dueScheduledAt: undefined,
    snoozeCount: 0,
    running: true,
    nextDoseAt: now + m.interval * 1000,
    updatedAt: now,
  };
}

export function applySnooze(m: Medication, minutes = 10, now = Date.now()): Medication {
  const secs = Math.max(1, Math.round(minutes * 60));
  return {
    ...m,
    pendingDose: false,
    dueScheduledAt: undefined,
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
    nextDoseAt: now + m.interval * 1000,
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
    nextDoseAt: now + m.interval * 1000,
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

export function sanitizeMedication(raw: Partial<Medication> & { name?: string }): Omit<Medication, "id"> & { id?: number } {
  const interval = Number(raw.interval) || intervalFromHours(Number(raw.intervalHours) || 8);
  const now = Date.now();
  return {
    id: raw.id,
    name: String(raw.name || "").trim() || "دارو",
    condition: String(raw.condition || "").trim(),
    dosage: String(raw.dosage || "").trim() || "—",
    interval,
    intervalHours: Number(raw.intervalHours) || Math.max(1, Math.round(interval / 3600)),
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

export function adherenceScore(history: HistoryRecord[]): number {
  if (!history.length) return 0;
  const onTime = history.filter((h) => h.status === "on-time").length;
  return Math.round((onTime / history.length) * 100);
}
