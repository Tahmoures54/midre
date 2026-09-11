import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, type MessageKey } from "@/lib/i18n";
import type { MedDraft } from "@/lib/med/store";
import type { AccentId, Medication, ScheduleKind } from "@/lib/med/types";
import { ACCENTS } from "@/lib/med/types";
import { normalizeTimes } from "@/lib/med/schedule";
import { cn } from "@/lib/utils";

const HOUR_PRESETS = [4, 6, 8, 12, 24, 48, 72];
const TIME_PRESETS: { key: MessageKey; times: string[] }[] = [
  { key: "presetMorning", times: ["08:00"] },
  { key: "presetTwice", times: ["08:00", "20:00"] },
  { key: "presetThrice", times: ["08:00", "14:00", "20:00"] },
  { key: "presetFour", times: ["08:00", "12:00", "16:00", "20:00"] },
];

const ACCENT_DOT: Record<AccentId, string> = {
  sage: "bg-primary",
  terra: "bg-terracotta",
  olive: "bg-olive",
  slate: "bg-slate",
};

const ACCENT_KEY: Record<AccentId, MessageKey> = {
  sage: "accentSage",
  terra: "accentTerra",
  olive: "accentOlive",
  slate: "accentSlate",
};

interface Props {
  initial?: Medication;
  onSubmit: (data: MedDraft) => void;
  onCancel: () => void;
}

export function MedicationForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useI18n();
  const isEdit = Boolean(initial?.id);
  const [name, setName] = useState(initial?.name ?? "");
  const [condition, setCondition] = useState(initial?.condition ?? "");
  const [dosage, setDosage] = useState(initial?.dosage ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : "");
  const [accent, setAccent] = useState<AccentId>(initial?.accent ?? "sage");
  const [kind, setKind] = useState<ScheduleKind>(initial?.scheduleKind ?? "times");
  const [hours, setHours] = useState<number | null>(
    initial && initial.scheduleKind !== "times"
      ? HOUR_PRESETS.includes(initial.intervalHours)
        ? initial.intervalHours
        : null
      : 8,
  );
  const [custom, setCustom] = useState(
    initial && initial.scheduleKind !== "times" && !HOUR_PRESETS.includes(initial.intervalHours)
      ? String(initial.intervalHours)
      : "",
  );
  const [times, setTimes] = useState<string[]>(initial?.scheduleKind === "times" ? initial.times : ["08:00", "20:00"]);
  const [newTime, setNewTime] = useState("08:00");
  const [startImmediately, setStartImmediately] = useState(!isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initial?.name ?? "");
    setCondition(initial?.condition ?? "");
    setDosage(initial?.dosage ?? "");
    setNotes(initial?.notes ?? "");
    setQuantity(initial ? String(initial.quantity) : "");
    setAccent(initial?.accent ?? "sage");
    const nextKind = initial?.scheduleKind ?? "times";
    setKind(nextKind);
    const h = initial?.intervalHours ?? 8;
    const preset = HOUR_PRESETS.includes(h);
    setHours(nextKind === "interval" ? (initial ? (preset ? h : null) : 8) : 8);
    setCustom(nextKind === "interval" && initial && !preset ? String(h) : "");
    setTimes(nextKind === "times" ? (initial?.times?.length ? initial.times : ["08:00", "20:00"]) : ["08:00", "20:00"]);
    setStartImmediately(!initial);
    setError("");
  }, [initial?.id]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return setError(t("formNeedNameDose"));
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0 || (!isEdit && qty <= 0)) {
      return setError(isEdit ? t("formQtyNeg") : t("formQtyZero"));
    }
    const cleanedTimes = normalizeTimes(times);
    if (kind === "times" && cleanedTimes.length === 0) return setError(t("formNeedTime"));
    const intervalHours = hours ?? Number(custom);
    if (kind === "interval" && (!Number.isFinite(intervalHours) || intervalHours <= 0)) {
      return setError(t("formBadInterval"));
    }
    onSubmit({
      name: name.trim(),
      condition: condition.trim(),
      dosage: dosage.trim(),
      notes: notes.trim(),
      accent,
      scheduleKind: kind,
      quantity: qty,
      intervalHours: kind === "interval" ? intervalHours : 24 / Math.max(1, cleanedTimes.length),
      times: kind === "times" ? cleanedTimes : [],
      startImmediately,
    });
  };

  const addTime = () => {
    const next = normalizeTimes([...times, newTime]);
    if (next.length > 8) return setError(t("formMaxTimes"));
    setTimes(next);
    setError("");
  };

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-ring">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{isEdit ? t("formEdit") : t("formAdd")}</h2>
        <Button variant="ghost" size="icon" className="size-10" onClick={onCancel} aria-label={t("close")}>
          <X />
        </Button>
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? (
          <p role="alert" className="rounded-lg bg-due/10 px-3 py-2 text-sm text-due">
            {error}
          </p>
        ) : null}
        <Field label={t("formName")} htmlFor="med-name">
          <Input id="med-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("formNamePh")} autoFocus />
        </Field>
        <Field label={t("formCondition")} htmlFor="med-condition">
          <Input id="med-condition" value={condition} onChange={(e) => setCondition(e.target.value)} placeholder={t("formConditionPh")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("formDose")} htmlFor="med-dosage">
            <Input id="med-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="500 mg" />
          </Field>
          <Field label={t("formQty")} htmlFor="med-quantity">
            <Input
              id="med-quantity"
              type="number"
              min={isEdit ? 0 : 1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="30"
            />
          </Field>
        </div>
        <Field label={t("formNotes")} htmlFor="med-notes">
          <Input id="med-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("formNotesPh")} />
        </Field>

        <div>
          <p className="mb-2 text-sm text-muted">{t("formColor")}</p>
          <div className="flex gap-2">
            {ACCENTS.map((id) => (
              <button
                key={id}
                type="button"
                aria-label={t(ACCENT_KEY[id])}
                aria-pressed={accent === id}
                onClick={() => setAccent(id)}
                className={cn(
                  "size-9 rounded-full ring-2 ring-offset-2 ring-offset-surface",
                  ACCENT_DOT[id],
                  accent === id ? "ring-fg" : "ring-transparent",
                )}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-muted">{t("formSchedule")}</p>
          <div className="grid grid-cols-2 gap-2">
            <KindBtn active={kind === "times"} onClick={() => setKind("times")} label={t("formTimes")} hint={t("formTimesHint")} />
            <KindBtn active={kind === "interval"} onClick={() => setKind("interval")} label={t("formInterval")} hint={t("formIntervalHint")} />
          </div>
        </div>

        {kind === "times" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setTimes(preset.times)}
                  className={cn(
                    "h-10 rounded-lg px-3 text-xs",
                    JSON.stringify(times) === JSON.stringify(preset.times)
                      ? "bg-primary font-medium text-primary-fg"
                      : "bg-surface-2 text-fg ring-1 ring-border",
                  )}
                >
                  {t(preset.key)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {times.map((clock) => (
                <button
                  key={clock}
                  type="button"
                  onClick={() => setTimes(times.filter((x) => x !== clock))}
                  className="rounded-full bg-bg px-3 py-1.5 text-xs text-fg ring-1 ring-border"
                  aria-label={t("removeTime", { t: clock })}
                >
                  {clock} ×
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="new-time"
                type="time"
                dir="ltr"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={addTime}>
                {t("addTime")}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-sm text-muted">{t("formHowOften")}</p>
            <div className="grid grid-cols-4 gap-2">
              {HOUR_PRESETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setHours(v)}
                  className={
                    hours === v
                      ? "h-11 rounded-lg bg-primary text-sm font-medium text-primary-fg"
                      : "h-11 rounded-lg bg-surface-2 text-sm text-fg ring-1 ring-border hover:bg-bg"
                  }
                >
                  {t("hoursShort", { n: v })}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setHours(null)}
                className={
                  hours === null
                    ? "h-11 rounded-lg bg-primary text-sm font-medium text-primary-fg"
                    : "h-11 rounded-lg bg-surface-2 text-sm text-fg ring-1 ring-dashed ring-border hover:bg-bg"
                }
              >
                {t("formCustom")}
              </button>
            </div>
            {hours === null ? (
              <div className="mt-3">
                <Field label={t("formCustomHours")} htmlFor="custom-hours">
                  <Input
                    id="custom-hours"
                    type="number"
                    min={0.02}
                    step={0.05}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder={t("formCustomPh")}
                  />
                </Field>
              </div>
            ) : null}
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-2 px-3 py-3 text-sm ring-1 ring-border">
          <input
            type="checkbox"
            checked={startImmediately}
            onChange={(e) => setStartImmediately(e.target.checked)}
            className="size-4 accent-primary"
          />
          {isEdit ? t("formStartSave") : t("formStartNow")}
        </label>
        <Button type="submit" className="h-12 w-full">
          {isEdit ? t("formSave") : t("formAdd")}
        </Button>
      </form>
    </section>
  );
}

function KindBtn({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-3 text-start ring-1",
        active ? "bg-primary/12 text-fg ring-primary/40" : "bg-surface-2 text-fg ring-border",
      )}
    >
      <span className="block text-sm font-medium">{label}</span>
      <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>
    </button>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
