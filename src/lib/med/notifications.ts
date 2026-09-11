import { t } from "@/lib/i18n";
import type { Medication } from "./types";

export type PermissionState = NotificationPermission | "unavailable";

export function checkNotificationPermission(): PermissionState {
  if (typeof window === "undefined" || !window.isSecureContext || !("Notification" in window)) {
    return "unavailable";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unavailable";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export function notifyDue(med: Medication, followUp = false) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification(followUp ? t("notifyAgain") : t("notifyTitle"), {
      body: t("notifyBody", { name: med.name, dose: med.dosage }),
      tag: `med-${med.id}`,
      requireInteraction: true,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    /* browsers may block without a user gesture */
  }
}

export function closeDueNotification(id: number) {
  /* tag-based close is not always available from the page; no-op is fine */
  void id;
}
