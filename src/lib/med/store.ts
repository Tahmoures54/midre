import { create } from "zustand";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import type { AccentId, Medication, ScheduleKind } from "./types";
import {
  addMedication,
  deleteMedication,
  exportBackup,
  getAllMedications,
  importBackup,
  updateMedication,
} from "./database";
import {
  applyRefill,
  applyReset,
  applySkip,
  applySnooze,
  applyTake,
  applyToggle,
  intervalFromHours,
  remainingSeconds,
  toDue,
} from "./medication";
import type { BackupPayload } from "./types";
import { playAlarm, stopAlarm } from "./audio";
import {
  checkNotificationPermission,
  notifyDue,
  requestNotificationPermission,
  type PermissionState,
} from "./notifications";
import { intervalSecondsForTimes, nextOccurrence, normalizeTimes } from "./schedule";
import { loadSettings, saveSettings, type AppSettings } from "./settings";
import { sortMedications } from "./stats";

export interface MedDraft {
  name: string;
  condition: string;
  dosage: string;
  notes: string;
  accent: AccentId;
  scheduleKind: ScheduleKind;
  intervalHours: number;
  times: string[];
  quantity: number;
  startImmediately: boolean;
}

interface MedStore {
  medications: Medication[];
  bootDone: boolean;
  bootError: string | null;
  permission: PermissionState;
  alertId: number | null;
  now: number;
  settings: AppSettings;
  load: () => Promise<void>;
  add: (draft: MedDraft) => Promise<void>;
  save: (id: number, draft: MedDraft) => Promise<void>;
  remove: (id: number) => Promise<void>;
  take: (id: number) => Promise<void>;
  snooze: (id: number, minutes?: number) => Promise<void>;
  skip: (id: number) => Promise<void>;
  toggle: (id: number) => Promise<void>;
  reset: (id: number) => Promise<void>;
  refill: (id: number, add?: number) => Promise<void>;
  tick: () => void;
  requestPermission: () => Promise<void>;
  dismissAlert: () => void;
  exportJson: () => Promise<void>;
  importJson: (file: File) => Promise<void>;
  addDemo: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

async function persist(m: Medication) {
  await updateMedication(m);
}

function nextPendingId(medications: Medication[], except?: number | null): number | null {
  return medications.find((m) => m.pendingDose && m.id !== except)?.id ?? null;
}

function scheduleFromDraft(draft: MedDraft, now: number) {
  const scheduleKind = draft.scheduleKind;
  const times = scheduleKind === "times" ? normalizeTimes(draft.times) : [];
  const interval = scheduleKind === "times" ? intervalSecondsForTimes(times) : intervalFromHours(draft.intervalHours);
  const intervalHours = scheduleKind === "times" ? (times.length ? 24 / times.length : 24) : draft.intervalHours;
  const nextDoseAt = draft.startImmediately
    ? scheduleKind === "times" && times.length
      ? nextOccurrence(times, now)
      : now + interval * 1000
    : undefined;
  return { scheduleKind, times, interval, intervalHours, nextDoseAt };
}

export const useMedStore = create<MedStore>((set, get) => ({
  medications: [],
  bootDone: false,
  bootError: null,
  permission: "default",
  alertId: null,
  now: Date.now(),
  settings: DEFAULT_BOOT_SETTINGS(),

  load: async () => {
    try {
      const permission = checkNotificationPermission();
      const medications = sortMedications(await getAllMedications());
      const due = medications.find((m) => m.pendingDose);
      set({
        medications,
        permission,
        bootDone: true,
        bootError: null,
        alertId: due?.id ?? null,
        settings: loadSettings(),
        now: Date.now(),
      });
      if (due) {
        void playAlarm();
        notifyDue(due);
      }
    } catch (error) {
      set({
        bootDone: true,
        bootError: error instanceof Error ? error.message : t("loadError"),
      });
    }
  },

  add: async (draft) => {
    const now = Date.now();
    const planned = scheduleFromDraft(draft, now);
    const created = await addMedication({
      name: draft.name,
      condition: draft.condition,
      dosage: draft.dosage,
      notes: draft.notes,
      accent: draft.accent,
      quantity: draft.quantity,
      scheduleKind: planned.scheduleKind,
      times: planned.times,
      intervalHours: planned.intervalHours,
      interval: planned.interval,
      running: draft.startImmediately,
      pendingDose: false,
      nextDoseAt: planned.nextDoseAt,
      snoozeCount: 0,
      createdAt: now,
      updatedAt: now,
      history: [],
    });
    set((s) => ({ medications: sortMedications([...s.medications, created]) }));
    toast.success(t("added", { name: created.name }));
  },

  save: async (id, draft) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const now = Date.now();
    const planned = scheduleFromDraft({ ...draft, startImmediately: false }, now);
    let next: Medication = {
      ...current,
      name: draft.name,
      condition: draft.condition,
      dosage: draft.dosage,
      notes: draft.notes,
      accent: draft.accent,
      quantity: draft.quantity,
      scheduleKind: planned.scheduleKind,
      times: planned.times,
      intervalHours: planned.intervalHours,
      interval: planned.interval,
      updatedAt: now,
    };
    if (draft.startImmediately && !next.running && !next.pendingDose) {
      next = {
        ...next,
        running: true,
        pendingDose: false,
        nextDoseAt: planned.scheduleKind === "times" && planned.times.length ? nextOccurrence(planned.times, now) : now + planned.interval * 1000,
      };
    } else if (next.running && next.nextDoseAt && current.interval !== planned.interval && planned.scheduleKind === "interval" && current.scheduleKind === "interval") {
      const left = remainingSeconds(current, now);
      const ratio = left / Math.max(1, current.interval);
      const remaining = Math.max(1, Math.round(ratio * planned.interval));
      next = { ...next, nextDoseAt: now + remaining * 1000 };
    } else if (next.running && !next.pendingDose && current.scheduleKind !== planned.scheduleKind) {
      next = {
        ...next,
        nextDoseAt:
          planned.scheduleKind === "times" && planned.times.length ? nextOccurrence(planned.times, now) : now + planned.interval * 1000,
      };
    }
    await persist(next);
    set((s) => ({ medications: sortMedications(s.medications.map((m) => (m.id === id ? next : m))) }));
    toast.success(t("saved"));
  },

  remove: async (id) => {
    await deleteMedication(id);
    set((s) => {
      const medications = s.medications.filter((m) => m.id !== id);
      const alertId = s.alertId === id ? nextPendingId(medications) : s.alertId;
      return { medications, alertId };
    });
    if (get().alertId === null) stopAlarm();
    toast.success(t("removed"));
  },

  take: async (id) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applyTake(current);
    await persist(updated);
    const medications = get().medications.map((m) => (m.id === id ? updated : m));
    const alertId = nextPendingId(medications, id);
    if (!alertId) stopAlarm();
    else void playAlarm();
    set((s) => ({
      medications: sortMedications(medications),
      alertId,
    }));
    if (updated.quantity <= 5) {
      toast.message(updated.quantity === 0 ? t("stockEmpty") : t("stockLeft", { n: updated.quantity }));
    }
  },

  snooze: async (id, minutes = 10) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applySnooze(current, minutes);
    await persist(updated);
    const medications = get().medications.map((m) => (m.id === id ? updated : m));
    const alertId = nextPendingId(medications, id);
    if (!alertId) stopAlarm();
    set((s) => ({
      medications: sortMedications(medications),
      alertId,
    }));
  },

  skip: async (id) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applySkip(current);
    await persist(updated);
    const medications = get().medications.map((m) => (m.id === id ? updated : m));
    const alertId = nextPendingId(medications, id);
    if (!alertId) stopAlarm();
    set((s) => ({
      medications: sortMedications(medications),
      alertId,
    }));
  },

  toggle: async (id) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applyToggle(current);
    await persist(updated);
    set((s) => ({ medications: sortMedications(s.medications.map((m) => (m.id === id ? updated : m))) }));
  },

  reset: async (id) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applyReset(current);
    await persist(updated);
    set((s) => {
      const medications = s.medications.map((m) => (m.id === id ? updated : m));
      const alertId = s.alertId === id ? nextPendingId(medications, id) : s.alertId;
      if (alertId == null) stopAlarm();
      return { medications: sortMedications(medications), alertId };
    });
  },

  refill: async (id, add = 30) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applyRefill(current, add);
    await persist(updated);
    set((s) => ({ medications: s.medications.map((m) => (m.id === id ? updated : m)) }));
    toast.success(t("stockNow", { n: updated.quantity }));
  },

  tick: () => {
    const now = Date.now();
    const { medications, alertId } = get();
    let changed = false;
    let newAlert: number | null = alertId;
    const next = medications.map((m) => {
      if (m.running && m.nextDoseAt && m.nextDoseAt <= now) {
        changed = true;
        const due = toDue(m, now);
        if (newAlert == null) newAlert = due.id;
        void persist(due);
        void playAlarm();
        notifyDue(due);
        return due;
      }
      return m;
    });
    if (changed) {
      set({ medications: sortMedications(next), now, alertId: newAlert });
    } else {
      set({ now });
    }
  },

  requestPermission: async () => {
    const permission = await requestNotificationPermission();
    set({ permission });
    if (permission === "granted") toast.success(t("notifOn"));
    else if (permission === "denied") toast.error(t("notifDenied"));
  },

  dismissAlert: () => {
    const { medications, alertId } = get();
    const next = nextPendingId(medications, alertId);
    if (!next) stopAlarm();
    set({ alertId: next });
  },

  exportJson: async () => {
    const payload = await exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medireminder-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("backupReady"));
  },

  importJson: async (file) => {
    try {
      const payload = JSON.parse(await file.text()) as BackupPayload;
      await importBackup(payload);
      await get().load();
      toast.success(t("backupRestored"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("backupFailed"));
    }
  },

  addDemo: async () => {
    await get().add({
      name: t("demoName"),
      condition: t("demoCondition"),
      dosage: t("demoDose"),
      notes: t("demoNotes"),
      accent: "olive",
      scheduleKind: "interval",
      intervalHours: 2 / 60,
      times: [],
      quantity: 14,
      startImmediately: true,
    });
  },

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    saveSettings(settings);
    set({ settings });
  },
}));

function DEFAULT_BOOT_SETTINGS(): AppSettings {
  return { sound: true, vibrate: true, nagSeconds: 45 };
}
