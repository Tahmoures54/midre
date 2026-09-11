import { useEffect, useId } from "react";
import { Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Medication } from "@/lib/med/types";

interface Props {
  medication: Medication;
  queueLength?: number;
  onTake: () => void;
  onSnooze: (minutes: number) => void;
  onSkip: () => void;
  onLater: () => void;
}

export function DoseAlert({ medication, queueLength = 1, onTake, onSnooze, onSkip, onLater }: Props) {
  const titleId = useId();
  const descId = useId();
  const empty = medication.quantity <= 0;

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
        className="w-full max-w-md origin-center rounded-2xl bg-surface p-6 shadow-ring-due animate-in"
      >
        <div className="mb-4 flex justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-due/15 text-due">
            <Pill className="size-7" strokeWidth={1.6} />
          </span>
        </div>
        {queueLength > 1 ? (
          <p className="mb-2 text-center text-xs text-muted">{queueLength} دارو منتظر تأیید</p>
        ) : null}
        <h2 id={titleId} className="text-center text-2xl font-semibold tracking-tight text-fg">
          زمان مصرف {medication.name}
        </h2>
        <p id={descId} className="mt-2 text-center text-sm leading-relaxed text-muted text-pretty">
          دوز {medication.dosage} فرا رسیده است.
          {medication.notes ? ` ${medication.notes}.` : ""} هشدار تا تأیید یا اسنوز ادامه می‌یابد.
        </p>
        {empty ? (
          <p className="mt-3 rounded-xl bg-due/10 px-3 py-2 text-center text-xs text-due">
            موجودی صفر است. بعد از تهیه دارو، موجودی را شارژ کنید — مصرف را همچنان می‌توانید ثبت کنید.
          </p>
        ) : null}
        {medication.snoozeCount >= 3 ? (
          <p className="mt-3 text-center text-xs text-terracotta">چند بار به تعویق رفته. بهتر است الان مصرف شود.</p>
        ) : null}
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
          <Button variant="outline" className="h-11 text-muted" onClick={onSkip}>
            این دوز را رد کن
          </Button>
          <Button variant="ghost" className="h-11 text-muted" onClick={onLater}>
            بعداً
          </Button>
        </div>
      </div>
    </div>
  );
}
