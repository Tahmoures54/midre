import { BarChart3, Pause, Pencil, Play, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCountdown, formatFaTime, remainingSeconds } from "@/lib/med/medication";
import type { Medication } from "@/lib/med/types";
import { cn } from "@/lib/utils";

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
}: Props) {
  const due = m.pendingDose;
  const running = m.running && !due;
  const remaining = remainingSeconds(m, now);
  const progress = due ? 100 : Math.min(100, Math.max(0, (remaining / Math.max(1, m.interval)) * 100));
  const empty = m.quantity <= 0;
  const low = !empty && m.quantity <= 5;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(238,243,240,0.08)]",
        "transition-[box-shadow,transform] duration-200 ease-out",
        due && "shadow-[0_0_0_1px_rgba(196,92,74,0.45)]",
        running && "shadow-[0_0_0_1px_rgba(126,201,168,0.28)]",
      )}
    >
      <header className="flex items-start justify-between gap-3">
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
              {due ? "منتظر تأیید" : running ? "در حال شمارش" : "متوقف"}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-fg text-balance">{m.name}</h3>
          {m.condition ? <p className="mt-1 truncate text-sm text-muted">{m.condition}</p> : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" className="size-10" onClick={onEdit} aria-label="ویرایش">
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" className="size-10" onClick={onReport} aria-label="گزارش">
            <BarChart3 />
          </Button>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border">{m.dosage}</span>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border">هر {formatInterval(m.interval)}</span>
        <span
          className={cn(
            "rounded-full bg-surface-2 px-2.5 py-1 ring-1 ring-border",
            empty && "text-due ring-due/30",
            low && !empty && "text-terracotta ring-terracotta/30",
          )}
        >
          {m.quantity} عدد{empty ? " · تمام" : low ? " · کم" : ""}
        </span>
      </div>

      <div className={cn("mt-4 rounded-xl bg-bg px-4 py-5 text-center", due && "bg-due/10")}>
        {due ? (
          <>
            <p className="text-2xl font-semibold tracking-tight text-due">زمان مصرف</p>
            <p className="mt-1 text-sm text-muted">پس از مصرف، تأیید کنید. بستن هشدار به معنی مصرف نیست.</p>
          </>
        ) : (
          <>
            <p
              className={cn("font-display text-5xl font-medium tabular-nums tracking-tight", running ? "text-primary" : "text-subtle")}
              role="timer"
              aria-label={`${formatCountdown(remaining)} باقی‌مانده`}
            >
              {formatCountdown(remaining)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {running ? `دوز بعدی حدود ${formatFaTime(m.nextDoseAt)}` : "تایمر متوقف است"}
            </p>
          </>
        )}
      </div>

      <Progress
        value={progress}
        className="mt-4"
        barClassName={due ? "bg-due" : running ? "bg-primary" : "bg-subtle"}
      />

      {due ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={onTake} className="h-12">
            مصرف کردم
          </Button>
          <Button variant="secondary" onClick={onSnooze} className="h-12">
            ۱۰ دقیقه
          </Button>
          <Button variant="outline" onClick={onSkip} className="col-span-2 h-11 text-muted">
            این دوز را رد کن
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
          <Button variant={running ? "secondary" : "default"} onClick={onToggle} className="h-12">
            {running ? <Pause /> : <Play />}
            {running ? "توقف" : "شروع"}
          </Button>
          <Button variant="secondary" size="icon" className="size-12" onClick={onReset} aria-label="ریست">
            <RotateCcw />
          </Button>
          <Button variant="ghost" size="icon" className="size-12 text-due" onClick={onDelete} aria-label="حذف">
            <Trash2 />
          </Button>
        </div>
      )}
    </article>
  );
}

function formatInterval(seconds: number): string {
  if (seconds < 3600) {
    const m = Math.max(1, Math.round(seconds / 60));
    return `${m} دقیقه`;
  }
  const h = seconds / 3600;
  if (Number.isInteger(h)) return `${h} ساعت`;
  return `${h.toFixed(1)} ساعت`;
}
