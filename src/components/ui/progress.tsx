import { cn } from "@/lib/utils";

export function Progress({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("h-1.5 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-border", className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full bg-primary transition-[width] duration-700 ease-out", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
