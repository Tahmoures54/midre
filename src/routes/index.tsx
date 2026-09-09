import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, Download, Plus, Upload } from "lucide-react";
import { DoseAlert } from "@/components/dose-alert";
import { MedicationCard } from "@/components/medication-card";
import { MedicationForm } from "@/components/medication-form";
import { ReportSheet } from "@/components/report-sheet";
import { Button } from "@/components/ui/button";
import { APP_VERSION, type Medication } from "@/lib/med/types";
import { useMedStore } from "@/lib/med/store";
import { playAlarm } from "@/lib/med/audio";

export const Route = createFileRoute("/")({ component: Home });

const NAG_MS = 45_000;

function Home() {
  const {
    medications,
    bootError,
    permission,
    alertId,
    now,
    load,
    add,
    save,
    remove,
    take,
    snooze,
    skip,
    toggle,
    reset,
    tick,
    requestPermission,
    dismissAlert,
    exportJson,
    importJson,
    addDemo,
  } = useMedStore();

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [report, setReport] = useState<Medication | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nagRef = useRef<number | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    tick();
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (nagRef.current != null) window.clearTimeout(nagRef.current);
    const pending = medications.filter((m) => m.pendingDose);
    if (!pending.length) return;
    nagRef.current = window.setTimeout(() => {
      const still = useMedStore.getState().medications.find((m) => m.pendingDose);
      if (still) {
        useMedStore.setState({ alertId: still.id });
        void playAlarm();
      }
    }, NAG_MS);
    return () => {
      if (nagRef.current != null) window.clearTimeout(nagRef.current);
    };
  }, [medications, alertId]);

  const alertMed = medications.find((m) => m.id === alertId && m.pendingDose) ?? null;
  const dueCount = medications.filter((m) => m.pendingDose).length;
  const confirmMed = medications.find((m) => m.id === confirmId) ?? null;
  const formVisible = showAdd || editing !== null;

  if (bootError) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg p-6 text-fg">
        <div className="w-full max-w-md rounded-2xl bg-surface p-6 text-center shadow-[0_0_0_1px_rgba(196,92,74,0.3)]">
          <h1 className="text-xl font-semibold text-due">راه‌اندازی انجام نشد</h1>
          <p className="mt-2 text-sm text-muted">{bootError}</p>
          <Button className="mt-5 w-full" onClick={() => void load()}>
            تلاش مجدد
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">MediReminder</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">یادآور دارو</h1>
              <p className="mt-1 text-sm text-muted">هشدار تکرار می‌شود تا مصرف را تأیید کنید.</p>
            </div>
            <span className="rounded-full bg-surface px-3 py-1 text-xs text-muted ring-1 ring-border">v{APP_VERSION}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setEditing(null);
                setShowAdd(true);
              }}
            >
              <Plus />
              افزودن دارو
            </Button>
            <Button variant="secondary" onClick={() => void exportJson()}>
              <Download />
              پشتیبان
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload />
              بازیابی
            </Button>
            {permission !== "granted" && permission !== "unavailable" ? (
              <Button variant="outline" onClick={() => void requestPermission()}>
                {permission === "denied" ? <BellOff /> : <Bell />}
                اعلان
              </Button>
            ) : null}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void importJson(file);
            }}
          />

          {permission !== "granted" ? (
            <p className="mt-3 rounded-xl bg-surface px-3 py-3 text-xs leading-relaxed text-muted ring-1 ring-border">
              {permission === "denied"
                ? "مجوز اعلان رد شده. از تنظیمات مرورگر آن را فعال کنید؛ در غیر این صورت فقط هشدار داخل برنامه کار می‌کند."
                : permission === "unavailable"
                  ? "اعلان مرورگر در این محیط در دسترس نیست. هشدار داخل برنامه و صدای آلارم همچنان کار می‌کند."
                  : "برای هشدار وقتی برنامه در پس‌زمینه است، مجوز اعلان را بدهید."}
            </p>
          ) : null}

          {dueCount > 0 ? (
            <p className="mt-3 rounded-xl bg-due/10 px-3 py-3 text-xs text-due-fg ring-1 ring-due/25">
              {dueCount} دارو منتظر تأیید است. بستن پنجره هشدار، مصرف را ثبت نمی‌کند.
            </p>
          ) : null}
        </header>

        {formVisible ? (
          <div className="mb-5">
            <MedicationForm
              initial={editing ?? undefined}
              onSubmit={(d) => {
                if (editing) void save(editing.id, d);
                else void add(d);
                setShowAdd(false);
                setEditing(null);
              }}
              onCancel={() => {
                setShowAdd(false);
                setEditing(null);
              }}
            />
          </div>
        ) : null}

        <div className="space-y-4">
          {medications.length === 0 ? (
            <EmptyState
              onAdd={() => setShowAdd(true)}
              onDemo={() => void addDemo()}
            />
          ) : (
            medications.map((m, i) => (
              <MedicationCard
                key={m.id}
                medication={m}
                now={now}
                index={i + 1}
                onToggle={() => void toggle(m.id)}
                onReset={() => void reset(m.id)}
                onDelete={() => setConfirmId(m.id)}
                onEdit={() => {
                  setShowAdd(false);
                  setEditing(m);
                }}
                onReport={() => setReport(m)}
                onTake={() => void take(m.id)}
                onSnooze={() => void snooze(m.id, 10)}
                onSkip={() => void skip(m.id)}
              />
            ))
          )}
        </div>

        <footer className="mt-10 space-y-2 text-center text-xs text-subtle">
          <p>داده‌ها فقط روی همین دستگاه، در IndexedDB ذخیره می‌شوند. سروری در کار نیست.</p>
          <p>ابزار یادآوری است — جایگزین توصیهٔ پزشک نیست.</p>
        </footer>
      </div>

      {alertMed ? (
        <DoseAlert
          medication={alertMed}
          onTake={() => void take(alertMed.id)}
          onSnooze={(minutes) => void snooze(alertMed.id, minutes)}
          onLater={dismissAlert}
        />
      ) : null}

      {report ? <ReportSheet medication={report} onClose={() => setReport(null)} /> : null}

      {confirmMed ? (
        <ConfirmDelete
          name={confirmMed.name}
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            void remove(confirmMed.id);
            setConfirmId(null);
            if (editing?.id === confirmMed.id) setEditing(null);
          }}
        />
      ) : null}
    </main>
  );
}

function EmptyState({ onAdd, onDemo }: { onAdd: () => void; onDemo: () => void }) {
  return (
    <div className="rounded-2xl bg-surface px-6 py-12 text-center shadow-[0_0_0_1px_rgba(238,243,240,0.08)]">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
        <Plus className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">هنوز دارویی ثبت نشده</h2>
      <p className="mt-2 text-sm text-muted">اولین دارو را اضافه کنید. تایمر از همین لحظه شروع می‌شود و تا تأیید مصرف تکرار می‌کند.</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={onAdd}>افزودن دارو</Button>
        <Button variant="secondary" onClick={onDemo}>
          نمونهٔ ۲ دقیقه‌ای
        </Button>
      </div>
    </div>
  );
}

function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="del-title"
        className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(238,243,240,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="del-title" className="text-lg font-semibold">
          حذف دارو
        </h2>
        <p className="mt-2 text-sm text-muted">«{name}» و تاریخچهٔ مصرف آن از این دستگاه پاک می‌شود.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="danger" className="flex-1" onClick={onConfirm}>
            حذف
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
}
