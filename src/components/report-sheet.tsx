import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adherenceScore, formatFaDateTime } from "@/lib/med/medication";
import type { DoseStatus, HistoryRecord, Medication } from "@/lib/med/types";
import { cn } from "@/lib/utils";

interface Props {
  medication: Medication;
  onClose: () => void;
}

const STATUS_LABEL: Record<DoseStatus, string> = {
  "on-time": "به‌موقع",
  early: "زودتر",
  late: "دیرتر",
  missed: "از دست رفته",
  snoozed: "اسنوز",
  skipped: "رد شده",
};

export function ReportSheet({ medication, onClose }: Props) {
  const history = useMemo(
    () => [...(medication.history || [])].sort((a, b) => b.takenAt - a.takenAt),
    [medication.history],
  );
  const recent = history.slice(0, 8);
  const score = adherenceScore(history);
  const counts = {
    onTime: history.filter((h) => h.status === "on-time").length,
    early: history.filter((h) => h.status === "early").length,
    late: history.filter((h) => h.status === "late").length,
    missed: history.filter((h) => h.status === "missed" || h.status === "skipped").length,
  };
  const [fingerprint, setFingerprint] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const reportText = useMemo(() => buildReport(medication, history, score, counts), [medication, history, score, counts]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    void sha256(reportText).then(setFingerprint);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, reportText]);

  const copy = async () => {
    const body = `${reportText}\n\nاثر انگشت متن:\n${fingerprint}`;
    try {
      await navigator.clipboard.writeText(body);
      setNote("گزارش کپی شد.");
    } catch {
      setNote("کپی در دسترس نبود.");
    }
  };

  const download = () => {
    const body = `${reportText}\n\nاثر انگشت متن:\n${fingerprint}`;
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${medication.name}-گزارش.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setNote("فایل ذخیره شد.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(238,243,240,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="report-title" className="text-lg font-semibold">
              گزارش {medication.name}
            </h2>
            <p className="mt-1 text-xs text-muted">خلاصه برای پزشک یا مراقب — داده روی همین دستگاه است</p>
          </div>
          <Button variant="ghost" size="icon" className="size-10" onClick={onClose} aria-label="بستن">
            <X />
          </Button>
        </div>

        {note ? <p className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{note}</p> : null}

        <div className="mb-4 flex items-center justify-between rounded-xl bg-bg px-4 py-3">
          <div>
            <p className="text-xs text-muted">پایبندی به‌موقع</p>
            <p className="text-sm text-fg">{history.length === 0 ? "هنوز داده‌ای نیست" : score >= 80 ? "عالی" : score >= 50 ? "قابل قبول" : "نیاز به توجه"}</p>
          </div>
          <p className={cn("text-3xl font-medium tabular-nums", history.length === 0 ? "text-subtle" : score >= 80 ? "text-primary" : "text-due")}>
            {history.length ? `${score}٪` : "—"}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
          {[
            ["به‌موقع", counts.onTime],
            ["زودتر", counts.early],
            ["دیرتر", counts.late],
            ["از دست", counts.missed],
          ].map(([label, n]) => (
            <div key={label} className="rounded-xl bg-bg px-2 py-3">
              <p className="text-muted">{label}</p>
              <p className="mt-1 text-lg font-medium tabular-nums">{n}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-xl bg-bg px-4 py-3">
          <p className="mb-2 text-sm font-medium">دوزهای اخیر</p>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">هنوز دوزی ثبت نشده.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((record) => (
                <HistoryRow key={record.id} record={record} />
              ))}
            </ul>
          )}
        </div>

        <p className="mb-4 break-all font-mono text-[10px] leading-relaxed text-subtle">
          اثر انگشت متن (SHA-256) — امضا نیست، فقط برای مقایسهٔ دو نسخه از همین متن:
          <br />
          {fingerprint || "…"}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => void copy()}>
            کپی
          </Button>
          <Button variant="secondary" onClick={download}>
            دانلود
          </Button>
        </div>
        <Button variant="ghost" className="mt-2 w-full" onClick={onClose}>
          بستن
        </Button>
      </div>
    </div>
  );
}

function HistoryRow({ record }: { record: HistoryRecord }) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="text-muted">{formatFaDateTime(record.takenAt)}</span>
      <span className="text-fg">{STATUS_LABEL[record.status]}</span>
    </li>
  );
}

function buildReport(
  medication: Medication,
  history: HistoryRecord[],
  score: number,
  counts: { onTime: number; early: number; late: number; missed: number },
) {
  const last = history[0] ? formatFaDateTime(history[0].takenAt) : "—";
  const lines = history.slice(0, 5).map((h) => `- ${formatFaDateTime(h.takenAt)} — ${STATUS_LABEL[h.status]}`);
  return `گزارش مصرف دارو
نام: ${medication.name}
بیماری: ${medication.condition || "مشخص نشده"}
دوز: ${medication.dosage}
پایبندی به‌موقع: ${history.length ? `${score}٪` : "بدون داده"}
ثبت‌شده: ${history.length}
به‌موقع: ${counts.onTime} · زودتر: ${counts.early} · دیرتر: ${counts.late} · از دست: ${counts.missed}
آخرین دوز: ${last}

دوزهای اخیر:
${lines.length ? lines.join("\n") : "- هنوز دوزی ثبت نشده"}`;
}

async function sha256(text: string): Promise<string> {
  try {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "unavailable";
  }
}
