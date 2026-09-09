import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MedDraft } from "@/lib/med/store";
import type { Medication } from "@/lib/med/types";

const PRESETS = [4, 6, 8, 12, 24, 48, 72];

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
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : "");
  const [hours, setHours] = useState<number | null>(
    initial ? (PRESETS.includes(initial.intervalHours) ? initial.intervalHours : null) : 8,
  );
  const [custom, setCustom] = useState(
    initial && !PRESETS.includes(initial.intervalHours) ? String(initial.intervalHours) : "",
  );
  const [startImmediately, setStartImmediately] = useState(!isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initial?.name ?? "");
    setCondition(initial?.condition ?? "");
    setDosage(initial?.dosage ?? "");
    setQuantity(initial ? String(initial.quantity) : "");
    const h = initial?.intervalHours ?? 8;
    const preset = PRESETS.includes(h);
    setHours(initial ? (preset ? h : null) : 8);
    setCustom(initial && !preset ? String(h) : "");
    setStartImmediately(!initial);
    setError("");
  }, [initial?.id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return setError("نام دارو و دوز را وارد کنید.");
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0 || (!isEdit && qty <= 0)) {
      return setError(isEdit ? "تعداد نمی‌تواند منفی باشد." : "تعداد باید بیشتر از صفر باشد.");
    }
    const intervalHours = hours ?? Number(custom);
    if (!Number.isFinite(intervalHours) || intervalHours <= 0) return setError("بازه یادآوری معتبر نیست.");
    onSubmit({
      name: name.trim(),
      condition: condition.trim(),
      dosage: dosage.trim(),
      quantity: qty,
      intervalHours,
      startImmediately,
    });
  };

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(238,243,240,0.08)]">
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
        <Field label="دوز" htmlFor="med-dosage">
          <Input id="med-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="۵۰۰ mg" />
        </Field>
        <Field label="تعداد" htmlFor="med-quantity">
          <Input id="med-quantity" type="number" min={isEdit ? 0 : 1} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="۳۰" />
        </Field>
        <div>
          <p className="mb-2 text-sm text-muted">یادآوری هر چند ساعت؟</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((v) => (
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
        </div>
        {hours === null ? (
          <Field label="بازه سفارشی (ساعت)" htmlFor="custom-hours">
            <Input id="custom-hours" type="number" min={0.02} step={0.05} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="مثلاً 0.05 برای ۳ دقیقه" />
          </Field>
        ) : null}
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

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
