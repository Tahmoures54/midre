import { formatFaTime } from "@/lib/med/medication";
import { todaysPlan, type TodayItem } from "@/lib/med/schedule";
import { emptyStockCount, lowStockCount, takenToday } from "@/lib/med/stats";
import type { Medication } from "@/lib/med/types";
import { cn } from "@/lib/utils";

const STATE_LABEL: Record<TodayItem["state"], string> = {
  due: "الان",
  upcoming: "بعدی",
  taken: "مصرف شد",
  skipped: "رد شد",
};

interface Props {
  medications: Medication[];
  now: number;
  onOpen: (id: number) => void;
}

export function TodayBoard({ medications, now, onOpen }: Props) {
  const plan = todaysPlan(medications, now);
  const due = medications.filter((m) => m.pendingDose).length;
  const taken = takenToday(medications, now);
  const low = lowStockCount(medications);
  const empty = emptyStockCount(medications);
  const dateLabel = new Date(now).toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (medications.length === 0) return null;

  return (
    <section className="mb-5 rounded-2xl bg-surface p-4 shadow-ring">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-fg">{dateLabel}</h2>
        <p className="text-xs text-muted">برنامه امروز</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="منتظر تأیید" value={due} warn={due > 0} />
        <Stat label="مصرف‌شده" value={taken} />
        <Stat label="کم‌موجودی" value={low + empty} warn={low + empty > 0} />
      </div>
      {plan.length > 0 ? (
        <ol className="mt-4 space-y-1.5">
          {plan.slice(0, 8).map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onOpen(item.medicationId)}
                className="flex w-full items-center gap-3 rounded-xl bg-bg px-3 py-2.5 text-right"
              >
                <span
                  className={cn(
                    "w-14 shrink-0 text-xs tabular-nums text-muted",
                    item.state === "due" && "font-medium text-due",
                  )}
                >
                  {formatFaTime(item.at)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-fg">{item.name}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px]",
                    item.state === "due" && "bg-due/15 text-due",
                    item.state === "upcoming" && "bg-primary/12 text-primary",
                    item.state === "taken" && "text-muted",
                    item.state === "skipped" && "text-subtle",
                  )}
                >
                  {STATE_LABEL[item.state]}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-muted">برای امروز نوبتی ثبت نشده. تایمر را روشن کنید یا ساعات روزانه بگذارید.</p>
      )}
    </section>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-bg px-2 py-3">
      <p className={cn("text-lg font-medium tabular-nums", warn ? "text-due" : "text-fg")}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  );
}
