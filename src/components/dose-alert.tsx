import { useEffect, useId } from "react";
import { Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();
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
          <p className="mb-2 text-center text-xs text-muted">{t("alertQueue", { n: queueLength })}</p>
        ) : null}
        <h2 id={titleId} className="text-center text-2xl font-semibold tracking-tight text-fg">
          {t("alertTitle", { name: medication.name })}
        </h2>
        <p id={descId} className="mt-2 text-center text-sm leading-relaxed text-muted text-pretty">
          {t("alertBody", { dose: medication.dosage })}
          {medication.notes ? ` ${medication.notes}.` : ""} {t("alertNag")}
        </p>
        {empty ? (
          <p className="mt-3 rounded-xl bg-due/10 px-3 py-2 text-center text-xs text-due">{t("alertEmpty")}</p>
        ) : null}
        {medication.snoozeCount >= 3 ? (
          <p className="mt-3 text-center text-xs text-terracotta">{t("alertSnoozed")}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <Button autoFocus onClick={onTake} className="h-12">
            {t("tookIt")}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="h-11" onClick={() => onSnooze(10)}>
              {t("snooze10")}
            </Button>
            <Button variant="secondary" className="h-11" onClick={() => onSnooze(30)}>
              {t("snooze30")}
            </Button>
          </div>
          <Button variant="outline" className="h-11 text-muted" onClick={onSkip}>
            {t("skipDose")}
          </Button>
          <Button variant="ghost" className="h-11 text-muted" onClick={onLater}>
            {t("later")}
          </Button>
        </div>
      </div>
    </div>
  );
}
