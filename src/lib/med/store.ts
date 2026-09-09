import { create } from "zustand";
import type { Medication } from "./types";
import {
  addMedication,
  deleteMedication,
  exportBackup,
  getAllMedications,
  importBackup,
  updateMedication,
} from "./database";
import {
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

export interface MedDraft {
  name: string;
  condition: string;
  dosage: string;
  intervalHours: number;
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
  load: () => Promise<void>;
  add: (draft: MedDraft) => Promise<void>;
  save: (id: number, draft: MedDraft) => Promise<void>;
  remove: (id: number) => Promise<void>;
  take: (id: number) => Promise<void>;
  snooze: (id: number, minutes?: number) => Promise<void>;
  skip: (id: number) => Promise<void>;
  toggle: (id: number) => Promise<void>;
  reset: (id: number) => Promise<void>;
  tick: () => void;
  requestPermission: () => Promise<void>;
  dismissAlert: () => void;
  exportJson: () => Promise<void>;
  importJson: (file: File) => Promise<void>;
  addDemo: () => Promise<void>;
}

async function persist(m: Medication) {
  await updateMedication(m);
}

export const useMedStore = create<MedStore>((set, get) => ({
  medications: [],
  bootDone: true,
  bootError: null,
  permission: "default",
  alertId: null,
  now: Date.now(),

  load: async () => {
    try {
      const permission = checkNotificationPermission();
      const medications = await getAllMedications();
      const due = medications.find((m) => m.pendingDose);
      set({
        medications,
        permission,
        bootDone: true,
        bootError: null,
        alertId: due?.id ?? null,
      });
      if (due) {
        void playAlarm();
        notifyDue(due);
      }
    } catch (error) {
      set({
        bootError: error instanceof Error ? error.message : "خطا در بارگذاری داده‌ها",
      });
    }
  },

  add: async (draft) => {
    const now = Date.now();
    const interval = intervalFromHours(draft.intervalHours);
    const created = await addMedication({
      name: draft.name,
      condition: draft.condition,
      dosage: draft.dosage,
      quantity: draft.quantity,
      intervalHours: draft.intervalHours,
      interval,
      running: draft.startImmediately,
      pendingDose: false,
      nextDoseAt: draft.startImmediately ? now + interval * 1000 : undefined,
      snoozeCount: 0,
      createdAt: now,
      updatedAt: now,
      history: [],
    });
    set((s) => ({ medications: [...s.medications, created] }));
  },

  save: async (id, draft) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const now = Date.now();
    const interval = intervalFromHours(draft.intervalHours);
    let next: Medication = {
      ...current,
      name: draft.name,
      condition: draft.condition,
      dosage: draft.dosage,
      quantity: draft.quantity,
      intervalHours: draft.intervalHours,
      interval,
      updatedAt: now,
    };
    if (draft.startImmediately && !next.running && !next.pendingDose) {
      next = {
        ...next,
        running: true,
        pendingDose: false,
        nextDoseAt: now + interval * 1000,
      };
    } else if (next.running && next.nextDoseAt && current.interval !== interval) {
      const left = remainingSeconds(current, now);
      const ratio = left / Math.max(1, current.interval);
      const remaining = Math.max(1, Math.round(ratio * interval));
      next = { ...next, nextDoseAt: now + remaining * 1000 };
    }
    await persist(next);
    set((s) => ({ medications: s.medications.map((m) => (m.id === id ? next : m)) }));
  },

  remove: async (id) => {
    await deleteMedication(id);
    set((s) => ({
      medications: s.medications.filter((m) => m.id !== id),
      alertId: s.alertId === id ? null : s.alertId,
    }));
    if (get().alertId === null) stopAlarm();
  },

  take: async (id) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applyTake(current);
    await persist(updated);
    stopAlarm();
    set((s) => ({
      medications: s.medications.map((m) => (m.id === id ? updated : m)),
      alertId: s.alertId === id ? null : s.alertId,
    }));
  },

  snooze: async (id, minutes = 10) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applySnooze(current, minutes);
    await persist(updated);
    stopAlarm();
    set((s) => ({
      medications: s.medications.map((m) => (m.id === id ? updated : m)),
      alertId: s.alertId === id ? null : s.alertId,
    }));
  },

  skip: async (id) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applySkip(current);
    await persist(updated);
    stopAlarm();
    set((s) => ({
      medications: s.medications.map((m) => (m.id === id ? updated : m)),
      alertId: s.alertId === id ? null : s.alertId,
    }));
  },

  toggle: async (id) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applyToggle(current);
    await persist(updated);
    set((s) => ({ medications: s.medications.map((m) => (m.id === id ? updated : m)) }));
  },

  reset: async (id) => {
    const current = get().medications.find((m) => m.id === id);
    if (!current) return;
    const updated = applyReset(current);
    await persist(updated);
    if (get().alertId === id) stopAlarm();
    set((s) => ({
      medications: s.medications.map((m) => (m.id === id ? updated : m)),
      alertId: s.alertId === id ? null : s.alertId,
    }));
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
        newAlert = due.id;
        void persist(due);
        void playAlarm();
        notifyDue(due);
        return due;
      }
      return m;
    });
    if (changed) {
      set({ medications: next, now, alertId: newAlert });
    } else {
      set({ now });
    }
  },

  requestPermission: async () => {
    const permission = await requestNotificationPermission();
    set({ permission });
  },

  dismissAlert: () => {
    stopAlarm();
    set({ alertId: null });
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
  },

  importJson: async (file) => {
    const payload = JSON.parse(await file.text()) as BackupPayload;
    await importBackup(payload);
    await get().load();
  },

  addDemo: async () => {
    await get().add({
      name: "نمونه — ویتامین D",
      condition: "دمو برای تست یادآوری",
      dosage: "۱۰۰۰ IU",
      intervalHours: 2 / 60, // 2 minutes
      quantity: 14,
      startImmediately: true,
    });
  },
}));
