import { useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocaleToggle({ size = "sm" }: { size?: "sm" | "md" }) {
  const { locale, setLocale, t } = useI18n();
  const options: { id: Locale; short: string }[] = [
    { id: "fa", short: "فا" },
    { id: "en", short: "EN" },
  ];

  return (
    <div
      role="group"
      aria-label={t("language")}
      dir="ltr"
      className={cn(
        "inline-flex rounded-full bg-surface p-0.5 ring-1 ring-border",
        size === "md" ? "h-11" : "h-9",
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          aria-pressed={locale === opt.id}
          onClick={() => setLocale(opt.id)}
          className={cn(
            "rounded-full px-2.5 text-xs tracking-wide",
            size === "md" ? "h-10 min-w-12" : "h-8 min-w-10",
            locale === opt.id ? "bg-primary font-medium text-primary-fg" : "text-muted",
          )}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
}
