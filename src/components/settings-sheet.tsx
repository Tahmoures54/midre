import { useRef, type ReactNode } from "react";
import { Bell, BellOff, Download, Upload, Volume2, VolumeX, Vibrate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/med/types";
import { NAG_OPTIONS, type AppSettings } from "@/lib/med/settings";
import type { PermissionState } from "@/lib/med/notifications";
import { cn } from "@/lib/utils";

interface Props {
  settings: AppSettings;
  permission: PermissionState;
  onClose: () => void;
  onSettings: (patch: Partial<AppSettings>) => void;
  onRequestPermission: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function SettingsSheet({
  settings,
  permission,
  onClose,
  onSettings,
  onRequestPermission,
  onExport,
  onImport,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-5 shadow-ring"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-semibold">
            تنظیمات
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            بستن
          </Button>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">هشدار</h3>
          <ToggleRow
            icon={settings.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            label="صدای آلارم"
            on={settings.sound}
            onClick={() => onSettings({ sound: !settings.sound })}
          />
          <ToggleRow
            icon={<Vibrate className="size-4" />}
            label="لرزش دستگاه"
            on={settings.vibrate}
            onClick={() => onSettings({ vibrate: !settings.vibrate })}
          />

          <div className="rounded-xl bg-bg px-3 py-3">
            <p className="mb-2 text-sm text-fg">تکرار هشدار تا تأیید</p>
            <div className="flex flex-wrap gap-2">
              {NAG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSettings({ nagSeconds: opt.value })}
                  className={cn(
                    "h-10 rounded-lg px-3 text-xs",
                    settings.nagSeconds === opt.value
                      ? "bg-primary font-medium text-primary-fg"
                      : "bg-surface-2 text-fg ring-1 ring-border",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-bg px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-fg">اعلان مرورگر</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {permission === "granted"
                    ? "فعال است — اگر برنامه در پس‌زمینه باشد هم خبر می‌دهد."
                    : permission === "denied"
                      ? "رد شده. از تنظیمات مرورگر فعال کنید."
                      : permission === "unavailable"
                        ? "در این محیط در دسترس نیست. هشدار داخل برنامه کار می‌کند."
                        : "برای هشدار پس‌زمینه، مجوز بدهید."}
                </p>
              </div>
              {permission !== "granted" && permission !== "unavailable" ? (
                <Button variant="outline" size="sm" onClick={onRequestPermission}>
                  {permission === "denied" ? <BellOff /> : <Bell />}
                  اعلان
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">داده</h3>
          <p className="text-xs leading-relaxed text-muted">
            همه چیز فقط روی همین دستگاه، در IndexedDB ذخیره می‌شود. بازیابی جایگزین فهرست فعلی می‌شود.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onExport}>
              <Download />
              پشتیبان
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload />
              بازیابی
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onImport(file);
            }}
          />
        </section>

        <p className="mt-6 text-center text-xs text-subtle">نسخه {APP_VERSION} · جایگزین توصیه پزشک نیست</p>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  on,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="flex w-full items-center justify-between rounded-xl bg-bg px-3 py-3 text-sm"
    >
      <span className="flex items-center gap-2 text-fg">
        {icon}
        {label}
      </span>
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-surface-2 ring-1 ring-border")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-fg transition-[inset-inline-start]", on ? "start-[22px]" : "start-0.5")} />
      </span>
    </button>
  );
}
