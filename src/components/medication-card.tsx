import { BarChart3, Pause, Pencil, Play, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { formatCountdown, formatFaTime, formatInterval, formatTimesLabel, remainingSeconds, progressDenominator } from "@/lib/med/medication";
import type { AccentId, Medication } from "@/lib/med/types";
import { cn } from "@/lib/utils";

const RAIL: Record<AccentId, string> = {
  sage: "bg-primary",
  terra: "bg-terracotta",
  olive: "bg-olive",
  slate: "bg-slate",
};

interface Props {
  medication: Medication;
  now: number;
  index: number;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReport: () => void;
  onTake: () => void;
  onSnooze: () => void;
  onSkip: () => void;
  onRefill: () => void;
}

export function MedicationCard({
  medication: m,
  now,
  index,
  onToggle,
  onReset,
  onDelete,
  onEdit,
  onReport,
  onTake,
  onSnooze,
  onSkip,
  onRefill,
}: Props) {
  const { t, locale } = useI18n();
  const due = m.pendingDose;
  const running = m.running && !due;
  const remaining = remainingSeconds(m, now);
  const denom = progressDenominator(m);
  const progress = due ? 100 : running ? Math.min(100, Math.max(0, ((denom - remaining) / denom) * 100)) : 0;
  const empty = m.quantity <= 0;
  const low = !empty && m.quantity <= 5;
  const clock = formatCountdown(remaining, locale);
  const scheduleLabel =
    m.scheduleKind === "times" ? formatTimesLabel(m.times, locale) : t("every", { interval: formatInterval(m.interval, locale) });

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl bg-surface p-4 shadow-ring",
        "transition-[box-shadow,transform] duration-200 ease-out",
        due && "shadow-ring-due",
        running && "shadow-ring-ok",
      )}
    >
      <span className={cn("absolute inset-y-0 start-0 w-1", RAIL[m.accent] ?? RAIL.sage)} aria-hidden />
      <header className="flex items-start justify-between gap-3 ps-2">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>#{index}</Badge>
            <Badge
              className={cn(
                due && "bg-due/15 text-due-fg ring-due/30",
                running && "bg-primary/12 text-primary ring-primary/25",
              )}
            >
              <span className={cn("size-1.5 rounded-full", due ? "bg-due" : running ? "bg-primary" : "bg-subtle")} />
              {due ? t("waiting") : running ? t("counting") : t("paused")}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-fg text-balance">{m.name}</h3>
          {m.condition ? <p className="mt-1 truncate text-sm text-muted">{m.condition}</p> : null}
          {m.notes ? <p className="mt-1 truncate text-xs text-subtle">{m.notes}</p> : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" className="size-10" onClick={onEdit} aria-label={t("edit")}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" className="size-10" onClick={onReport} aria-label={t("report")}>
            <BarChart3 />
          </Button>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap gap-2 ps-2 text-xs text-muted">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border">{m.dosage}</span>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border">{scheduleLabel}</span>
        <span
          className={cn(
            "rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border",
            empty && "text-due ring-due/30",
            low && !empty && "text-terracotta ring-terracotta/30",
          )}
        >
          {t("pills", { n: m.quantity })}
          {empty ? t("pillsEmpty") : low ? t("pillsLow") : ""}
        </span>
      </div>

      <div className={cn("mt-4 rounded-xl bg-bg px-4 py-5 text-center", due && "bg-due/10")}>
        {due ? (
          <>
            <p className="text-2xl font-semibold tracking-tight text-due">{t("timeToTake")}</p>
            <p className="mt-1 text-sm text-muted">{t("confirmAfter")}</p>
          </>
        ) : (
          <>
            <p
              className={cn("font-display text-5xl font-medium tabular-nums tracking-tight", running ? "text-primary" : "text-subtle")}
              role="timer"
              aria-label={t("remaining", { clock })}
            >
              {clock}
            </p>
            <p className="mt-1 text-xs text-muted">
              {running ? t("nextAround", { time: formatFaTime(m.nextDoseAt, locale) }) : t("timerStopped")}
            </p>
          </>
        )}
      </div>

      <Progress value={progress} className="mt-4" barClassName={due ? "bg-due" : running ? "bg-primary" : "bg-subtle"} />

      {due ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={onTake} className="h-12">
            {t("tookIt")}
          </Button>
          <Button variant="secondary" onClick={onSnooze} className="h-12">
            {t("snooze10")}
          </Button>
          <Button variant="outline" onClick={onSkip} className="col-span-2 h-11 text-muted">
            {t("skipDose")}
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
          <Button variant={running ? "secondary" : "default"} onClick={onToggle} className="h-12">
            {running ? <Pause /> : <Play />}
            {running ? t("pause") : t("start")}
          </Button>
          <Button variant="secondary" size="icon" className="size-12" onClick={onReset} aria-label={t("reset")}>
            <RotateCcw />
          </Button>
          <Button variant="ghost" size="icon" className="size-12 text-due" onClick={onDelete} aria-label={t("delete")}>
            <Trash2 />
          </Button>
        </div>
      )}

      {low || empty ? (
        <Button variant="outline" className="mt-2 h-11 w-full" onClick={onRefill}>
          {t("refill")}
        </Button>
      ) : null}
    </article>
  );
}
