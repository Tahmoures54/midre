import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";
import { Toaster } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DoseAlert } from "@/components/dose-alert";
import { MedicationCard } from "@/components/medication-card";
import { MedicationForm } from "@/components/medication-form";
import { ReportSheet } from "@/components/report-sheet";
import { SettingsSheet } from "@/components/settings-sheet";
import { TodayBoard } from "@/components/today-board";
import { Button } from "@/components/ui/button";
import { APP_VERSION, type Medication } from "@/lib/med/types";
import { useMedStore } from "@/lib/med/store";
import { playAlarm } from "@/lib/med/audio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

type Filter = "all" | "due" | "active" | "low";

function Home() {
  const {
    medications,
    bootDone,
    bootError,
    permission,
    alertId,
    now,
    settings,
    load,
    add,
    save,
    remove,
    take,
    snooze,
    skip,
    toggle,
    reset,
    refill,
    tick,
    requestPermission,
    dismissAlert,
    exportJson,
    importJson,
    addDemo,
    updateSettings,
  } = useMedStore();

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [report, setReport] = useState<Medication | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [pendingImport, setPendingImport] = useState<File | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const nagRef = useRef<number | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    tick();
    const id = window.setInterval(() => tick(), 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tick]);

  useEffect(() => {
    if (nagRef.current != null) window.clearTimeout(nagRef.current);
    const pending = medications.filter((m) => m.pendingDose);
    if (!pending.length) return;
    nagRef.current = window.setTimeout(() => {
      const still = useMedStore.getState().medications.filter((m) => m.pendingDose);
      if (!still.length) return;
      const current = useMedStore.getState().alertId;
      const next = still.find((m) => m.id !== current) ?? still[0];
      useMedStore.setState({ alertId: next.id });
      void playAlarm();
    }, settings.nagSeconds * 1000);
    return () => {
      if (nagRef.current != null) window.clearTimeout(nagRef.current);
    };
  }, [medications, alertId, settings.nagSeconds]);

  const alertMed = medications.find((m) => m.id === alertId && m.pendingDose) ?? null;
  const dueCount = medications.filter((m) => m.pendingDose).length;
  const confirmMed = medications.find((m) => m.id === confirmId) ?? null;
  const formVisible = showAdd || editing !== null;

  const visible = useMemo(() => {
    if (filter === "due") return medications.filter((m) => m.pendingDose);
    if (filter === "active") return medications.filter((m) => m.running && !m.pendingDose);
    if (filter === "low") return medications.filter((m) => m.quantity <= 5);
    return medications;
  }, [medications, filter]);

  if (bootError) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg p-6 text-fg">
        <div className="w-full max-w-md rounded-2xl bg-surface p-6 text-center shadow-ring-due">
          <h1 className="text-xl font-semibold text-due">راه‌اندازی انجام نشد</h1>
          <p className="mt-2 text-sm text-muted">{bootError}</p>
          <Button className="mt-5 w-full" onClick={() => void load()}>
            تلاش مجدد
          </Button>
        </div>
        <Toaster dir="rtl" theme="dark" position="top-center" />
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
              <p className="mt-1 text-sm text-muted">ساعات روزانه یا فاصله زمانی — هشدار تا تأیید تکرار می‌شود.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="size-11" onClick={() => setSettingsOpen(true)} aria-label="تنظیمات">
                <Settings />
              </Button>
              <span className="rounded-full bg-surface px-3 py-1 text-xs text-muted ring-1 ring-border">v{APP_VERSION}</span>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => {
                setEditing(null);
                setShowAdd(true);
              }}
              className="h-12 w-full sm:w-auto"
            >
              <Plus />
              افزودن دارو
            </Button>
          </div>

          {dueCount > 0 ? (
            <p className="mt-3 rounded-xl bg-due/10 px-3 py-3 text-xs text-due-fg ring-1 ring-due/25">
              {dueCount} دارو منتظر تأیید است. بستن پنجره هشدار، مصرف را ثبت نمی‌کند.
            </p>
          ) : null}
        </header>

        {bootDone ? (
          <TodayBoard
            medications={medications}
            now={now}
            onOpen={(id) => {
              setHighlightId(id);
              const el = document.getElementById(`med-${id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
              window.setTimeout(() => setHighlightId((cur) => (cur === id ? null : cur)), 1800);
            }}
          />
        ) : null}

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

        {medications.length > 1 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["all", "همه"],
                ["due", "منتظر"],
                ["active", "فعال"],
                ["low", "کم‌موجودی"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs",
                  filter === id ? "bg-primary font-medium text-primary-fg" : "bg-surface text-muted ring-1 ring-border",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-4">
          {!bootDone ? (
            <div className="space-y-3">
              <div className="h-40 animate-pulse rounded-2xl bg-surface" />
              <div className="h-40 animate-pulse rounded-2xl bg-surface" />
            </div>
          ) : medications.length === 0 ? (
            <EmptyState
              onAdd={() => setShowAdd(true)}
              onDemo={() => void addDemo()}
            />
          ) : visible.length === 0 ? (
            <p className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-ring">در این فیلتر دارویی نیست.</p>
          ) : (
            visible.map((m, i) => (
              <div key={m.id} id={`med-${m.id}`} className={cn(highlightId === m.id && "rounded-2xl ring-2 ring-primary/40")}>
                <MedicationCard
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
                  onRefill={() => void refill(m.id, 30)}
                />
              </div>
            ))
          )}
        </div>

        <footer className="mt-10 space-y-2 text-center text-xs text-subtle">
          <p>داده‌ها فقط روی همین دستگاه ذخیره می‌شوند. سروری در کار نیست.</p>
          <p>ابزار یادآوری است — جایگزین توصیهٔ پزشک نیست.</p>
        </footer>
      </div>

      {alertMed ? (
        <DoseAlert
          medication={alertMed}
          queueLength={dueCount}
          onTake={() => void take(alertMed.id)}
          onSnooze={(minutes) => void snooze(alertMed.id, minutes)}
          onSkip={() => void skip(alertMed.id)}
          onLater={dismissAlert}
        />
      ) : null}

      {report ? <ReportSheet medication={report} onClose={() => setReport(null)} /> : null}

      {settingsOpen ? (
        <SettingsSheet
          settings={settings}
          permission={permission}
          onClose={() => setSettingsOpen(false)}
          onSettings={updateSettings}
          onRequestPermission={() => void requestPermission()}
          onExport={() => void exportJson()}
          onImport={(file) => setPendingImport(file)}
        />
      ) : null}

      {confirmMed ? (
        <ConfirmDialog
          title="حذف دارو"
          body={`«${confirmMed.name}» و تاریخچهٔ مصرف آن از این دستگاه پاک می‌شود.`}
          confirmLabel="حذف"
          danger
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            void remove(confirmMed.id);
            setConfirmId(null);
            if (editing?.id === confirmMed.id) setEditing(null);
          }}
        />
      ) : null}

      {pendingImport ? (
        <ConfirmDialog
          title="بازیابی پشتیبان"
          body="این فایل جایگزین همه داروهای فعلی می‌شود. این کار برگشت‌پذیر نیست مگر پشتیبان تازه‌ای گرفته باشید."
          confirmLabel="جایگزین کن"
          danger
          onCancel={() => setPendingImport(null)}
          onConfirm={() => {
            const file = pendingImport;
            setPendingImport(null);
            void importJson(file);
          }}
        />
      ) : null}

      <Toaster dir="rtl" theme="dark" position="top-center" />
    </main>
  );
}

function EmptyState({ onAdd, onDemo }: { onAdd: () => void; onDemo: () => void }) {
  return (
    <div className="rounded-2xl bg-surface px-6 py-12 text-center shadow-ring">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
        <Plus className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">هنوز دارویی ثبت نشده</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        ساعات مشخص روزانه بگذارید — مثل ۸ صبح و ۸ شب — یا فاصلهٔ زمانی. تایمر تا تأیید مصرف تکرار می‌کند.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={onAdd}>افزودن دارو</Button>
        <Button variant="secondary" onClick={onDemo}>
          نمونهٔ ۲ دقیقه‌ای
        </Button>
      </div>
    </div>
  );
}
