import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        "bg-surface-2 text-muted ring-1 ring-border",
        className,
      )}
      {...props}
    />
  );
}
