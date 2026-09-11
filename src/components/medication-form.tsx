import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MedDraft } from "@/lib/med/store";
import type { AccentId, Medication, ScheduleKind } from "@/lib/med/types";
import { ACCENTS } from "@/lib/med/types";
import { normalizeTimes } from "@/lib/med/schedule";
import { cn } from "@/lib/utils";

const HOUR_PRESETS = [4, 6, 8, 12, 24, 48, 72];
const TIME_PRESETS: { label: string; times: string[] }[] = [
  { label: "صبح", times: ["08:00"] },
  { label: "صبح و شب", times: ["08:00", "20:00"] },
  { label: "سه‌بار", times: ["08:00", "14:00", "20:00"] },
  { label: "چهاربار", times: ["08:00", "12:00", "16:00", "20:00"] },
];

const ACCENT_DOT: Record<AccentId, string> = {
  sage: "bg-primary",
  terra: "bg-terracotta",
  olive: "bg-olive",
  slate: "bg-slate",
};

const ACCENT_LABEL: Record<AccentId, string> = {
  sage: "سبز",
  terra: "خاکی",
  olive: "زیتونی",
  slate: "سنگی",
};

interface Props {
  initial?: Medication;
  onSubmit: (data: MedDraft) => void;
  onCancel: () => void;
}

export function MedicationForm({ initial, onSubmit, onCancel }: Props) {
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
    if (!name.trim() || !dosage.trim()) return setError("نام دارو و دوز را وارد کنید.");
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0 || (!isEdit && qty <= 0)) {
      return setError(isEdit ? "تعداد نمی‌تواند منفی باشد." : "تعداد باید بیشتر از صفر باشد.");
    }
    const cleanedTimes = normalizeTimes(times);
    if (kind === "times" && cleanedTimes.length === 0) return setError("حداقل یک ساعت مصرف اضافه کنید.");
    const intervalHours = hours ?? Number(custom);
    if (kind === "interval" && (!Number.isFinite(intervalHours) || intervalHours <= 0)) {
      return setError("بازه یادآوری معتبر نیست.");
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
    if (next.length > 8) return setError("حداکثر ۸ نوبت در روز.");
    setTimes(next);
    setError("");
  };

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-ring">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{isEdit ? "ویرایش دارو" : "افزودن دارو"}</h2>
        <Button variant="ghost" size="icon" className="size-10" onClick={onCancel} aria-label="بستن">
          <X />
        </Button>
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? (
          <p role="alert" className="rounded-lg bg-due/10 px-3 py-2 text-sm text-due">
            {error}
          </p>
        ) : null}
        <Field label="نام دارو" htmlFor="med-name">
          <Input id="med-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً آموکسی‌سیلین" autoFocus />
        </Field>
        <Field label="بیماری مرتبط (اختیاری)" htmlFor="med-condition">
          <Input id="med-condition" value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="مثلاً فشار خون" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="دوز" htmlFor="med-dosage">
            <Input id="med-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="۵۰۰ mg" />
          </Field>
          <Field label="تعداد" htmlFor="med-quantity">
            <Input
              id="med-quantity"
              type="number"
              min={isEdit ? 0 : 1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="۳۰"
            />
          </Field>
        </div>
        <Field label="یادداشت مصرف (اختیاری)" htmlFor="med-notes">
          <Input id="med-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="با غذا · ناشتا · قبل خواب" />
        </Field>

        <div>
          <p className="mb-2 text-sm text-muted">رنگ کارت</p>
          <div className="flex gap-2">
            {ACCENTS.map((id) => (
              <button
                key={id}
                type="button"
                aria-label={ACCENT_LABEL[id]}
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
          <p className="mb-2 text-sm text-muted">زمان‌بندی</p>
          <div className="grid grid-cols-2 gap-2">
            <KindBtn active={kind === "times"} onClick={() => setKind("times")} label="ساعات روزانه" hint="مثل ۸ صبح و ۸ شب" />
            <KindBtn active={kind === "interval"} onClick={() => setKind("interval")} label="هر چند ساعت" hint="از لحظه شروع" />
          </div>
        </div>

        {kind === "times" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTimes(preset.times)}
                  className={cn(
                    "h-10 rounded-lg px-3 text-xs",
                    JSON.stringify(times) === JSON.stringify(preset.times)
                      ? "bg-primary font-medium text-primary-fg"
                      : "bg-surface-2 text-fg ring-1 ring-border",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {times.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimes(times.filter((x) => x !== t))}
                  className="rounded-full bg-bg px-3 py-1.5 text-xs text-fg ring-1 ring-border"
                  aria-label={`حذف ${t}`}
                >
                  {t} ×
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
                افزودن ساعت
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-sm text-muted">یادآوری هر چند ساعت؟</p>
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
                  {v}س
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
                سفارشی
              </button>
            </div>
            {hours === null ? (
              <div className="mt-3">
                <Field label="بازه سفارشی (ساعت)" htmlFor="custom-hours">
                  <Input
                    id="custom-hours"
                    type="number"
                    min={0.02}
                    step={0.05}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="۰٫۰۵ یعنی ۳ دقیقه"
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
          {isEdit ? "شروع تایمر با ذخیره" : "شروع شمارش بلافاصله"}
        </label>
        <Button type="submit" className="h-12 w-full">
          {isEdit ? "ذخیره تغییرات" : "افزودن دارو"}
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
        "rounded-xl px-3 py-3 text-right ring-1",
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
