import { useEffect, useId } from "react";
import { Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Medication } from "@/lib/med/types";

interface Props {
  medication: Medication;
  onTake: () => void;
  onSnooze: (minutes: number) => void;
  onLater: () => void;
}

export function DoseAlert({ medication, onTake, onSnooze, onLater }: Props) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onLater();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onLater]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-md origin-center rounded-2xl bg-surface p-6 shadow-[0_0_0_1px_rgba(196,92,74,0.35)] animate-in"
      >
        <div className="mb-4 flex justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-due/15 text-due">
            <Pill className="size-7" strokeWidth={1.6} />
          </span>
        </div>
        <h2 id={titleId} className="text-center text-2xl font-semibold tracking-tight text-fg">
          زمان مصرف {medication.name}
        </h2>
        <p id={descId} className="mt-2 text-center text-sm leading-relaxed text-muted text-pretty">
          دوز {medication.dosage} فرا رسیده است. هشدار تا تأیید مصرف یا اسنوز ادامه می‌یابد. «بعداً» فقط این پنجره را می‌بندد.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button autoFocus onClick={onTake} className="h-12">
            مصرف کردم
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="h-11" onClick={() => onSnooze(10)}>
              ۱۰ دقیقه
            </Button>
            <Button variant="secondary" className="h-11" onClick={() => onSnooze(30)}>
              ۳۰ دقیقه
            </Button>
          </div>
          <Button variant="ghost" className="h-11 text-muted" onClick={onLater}>
            بعداً
          </Button>
        </div>
      </div>
    </div>
  );
}
