const KEY = "medireminder-settings-v1";

export interface AppSettings {
  sound: boolean;
  vibrate: boolean;
  nagSeconds: number;
}

export const NAG_OPTIONS = [30, 45, 60, 120, 300] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  sound: true,
  vibrate: true,
  nagSeconds: 45,
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const nag = Number(parsed.nagSeconds);
    return {
      sound: parsed.sound !== false,
      vibrate: parsed.vibrate !== false,
      nagSeconds: NAG_OPTIONS.some((value) => value === nag) ? nag : DEFAULT_SETTINGS.nagSeconds,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(settings));
}
