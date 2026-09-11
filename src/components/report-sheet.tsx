import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { dateLocale, statusMessageKey, t, useI18n, type Locale, type MessageKey } from "@/lib/i18n";
import { adherenceScore, formatFaDateTime } from "@/lib/med/medication";
import { completionRate, lastNDays, streakDays } from "@/lib/med/stats";
import type { HistoryRecord, Medication } from "@/lib/med/types";
import { cn } from "@/lib/utils";

interface Props {
  medication: Medication;
  onClose: () => void;
}

export function ReportSheet({ medication, onClose }: Props) {
  const { t, locale, dir } = useI18n();
  const history = useMemo(
    () => [...(medication.history || [])].sort((a, b) => b.takenAt - a.takenAt),
    [medication.history],
  );
  const recent = history.slice(0, 10);
  const onTime = adherenceScore(history);
  const done = completionRate(history);
  const streak = streakDays(history);
  const chart = lastNDays(history, 7, Date.now(), dateLocale(locale));
  const counts = {
    onTime: history.filter((h) => h.status === "on-time").length,
    early: history.filter((h) => h.status === "early").length,
    late: history.filter((h) => h.status === "late").length,
    missed: history.filter((h) => h.status === "missed" || h.status === "skipped").length,
  };
  const [fingerprint, setFingerprint] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const reportText = useMemo(
    () => buildReport(medication, history, onTime, done, streak, counts, locale),
    [medication, history, onTime, done, streak, counts, locale],
  );

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
    const body = `${reportText}\n\n${t("fingerprintLabel")}:\n${fingerprint}`;
    try {
      await navigator.clipboard.writeText(body);
      setNote(t("reportCopied"));
    } catch {
      setNote(t("reportCopyFail"));
    }
  };

  const download = () => {
    const body = `${reportText}\n\n${t("fingerprintLabel")}:\n${fingerprint}`;
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = t("reportFile", { name: medication.name });
    a.click();
    URL.revokeObjectURL(url);
    setNote(t("reportSaved"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-5 shadow-ring"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="report-title" className="text-lg font-semibold">
              {t("reportTitle", { name: medication.name })}
            </h2>
            <p className="mt-1 text-xs text-muted">{t("reportHint")}</p>
          </div>
          <Button variant="ghost" size="icon" className="size-10" onClick={onClose} aria-label={t("close")}>
            <X />
          </Button>
        </div>

        {note ? <p className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{note}</p> : null}

        <div className="mb-4 grid grid-cols-3 gap-2">
          <ScoreBox label={t("onTime")} value={history.length ? t("percent", { n: onTime }) : "—"} tone={onTime >= 80 ? "ok" : "warn"} />
          <ScoreBox label={t("takeRate")} value={history.length ? t("percent", { n: done }) : "—"} tone="neutral" />
          <ScoreBox label={t("streak")} value={streak ? `${streak}` : "—"} tone="neutral" />
        </div>

        <div className="mb-4 rounded-xl bg-bg px-2 py-3" dir="ltr">
          <p className="mb-2 px-2 text-start text-sm font-medium text-fg" dir={dir}>
            {t("last7")}
          </p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barGap={2}>
                <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(238,243,240,0.04)" }}
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-fg)",
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [value as number, name === "taken" ? t("chartTaken") : t("chartSkipped")]}
                />
                <Bar dataKey="taken" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="skipped" fill="var(--color-due)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
          {[
            [t("onTime"), counts.onTime],
            [t("early"), counts.early],
            [t("late"), counts.late],
            [t("missedShort"), counts.missed],
          ].map(([label, n]) => (
            <div key={String(label)} className="rounded-xl bg-bg px-2 py-3">
              <p className="text-muted">{label}</p>
              <p className="mt-1 text-lg font-medium tabular-nums">{n}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-xl bg-bg px-4 py-3">
          <p className="mb-2 text-sm font-medium">{t("recentDoses")}</p>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">{t("noDoses")}</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((record) => (
                <HistoryRow key={record.id} record={record} />
              ))}
            </ul>
          )}
        </div>

        <p className="mb-4 break-all font-mono text-[10px] leading-relaxed text-subtle">
          {t("fingerprint")}
          <br />
          {fingerprint || "…"}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => void copy()}>
            {t("copy")}
          </Button>
          <Button variant="secondary" onClick={download}>
            {t("download")}
          </Button>
        </div>
        <Button variant="ghost" className="mt-2 w-full" onClick={onClose}>
          {t("close")}
        </Button>
      </div>
    </div>
  );
}

function ScoreBox({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "neutral" }) {
  return (
    <div className="rounded-xl bg-bg px-3 py-3 text-center">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("mt-1 text-xl font-medium tabular-nums", tone === "ok" && "text-primary", tone === "warn" && "text-due")}>
        {value}
      </p>
    </div>
  );
}

function HistoryRow({ record }: { record: HistoryRecord }) {
  const { t, locale } = useI18n();
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="text-muted">{formatFaDateTime(record.takenAt, locale)}</span>
      <span className="text-fg">{t(statusMessageKey(record.status))}</span>
    </li>
  );
}

function buildReport(
  medication: Medication,
  history: HistoryRecord[],
  onTime: number,
  done: number,
  streak: number,
  counts: { onTime: number; early: number; late: number; missed: number },
  locale: Locale,
) {
  const tr = (key: MessageKey, vars?: Record<string, string | number>) => t(key, vars, locale);
  const last = history[0] ? formatFaDateTime(history[0].takenAt, locale) : "—";
  const lines = history
    .slice(0, 5)
    .map((h) => `- ${formatFaDateTime(h.takenAt, locale)} — ${tr(statusMessageKey(h.status))}`);
  const pct = (n: number) => (history.length ? tr("percent", { n }) : tr("noData"));
  return `${tr("reportDocTitle")}
${tr("reportName")}: ${medication.name}
${tr("reportCondition")}: ${medication.condition || tr("unspecified")}
${tr("reportDose")}: ${medication.dosage}
${tr("reportNotes")}: ${medication.notes || "—"}
${tr("reportOnTime")}: ${pct(onTime)}
${tr("reportTakeRate")}: ${pct(done)}
${tr("reportStreak")}: ${streak || "—"}
${tr("reportLogged")}: ${history.length}
${tr("onTime")}: ${counts.onTime} · ${tr("early")}: ${counts.early} · ${tr("late")}: ${counts.late} · ${tr("missedShort")}: ${counts.missed}
${tr("reportLast")}: ${last}

${tr("recentDoses")}:
${lines.length ? lines.join("\n") : tr("noDoseLine")}`;
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
