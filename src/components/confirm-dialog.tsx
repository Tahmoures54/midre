import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, body, confirmLabel, danger, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-ring"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        <div className="mt-5 flex gap-2">
          <Button variant={danger ? "danger" : "default"} className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
}
