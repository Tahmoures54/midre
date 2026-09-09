import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg bg-surface-2 px-3 text-sm text-fg ring-1 ring-border",
        "placeholder:text-subtle",
        "transition-[box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
