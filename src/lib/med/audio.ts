let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let beepInterval: ReturnType<typeof setInterval> | null = null;
let isAlarmPlaying = false;

const BEEP_FREQUENCY = 880;
const BEEP_ON_MS = 220;
const BEEP_OFF_MS = 160;
const BEEPS_PER_CYCLE = 4;
const GAP_AFTER_CYCLE_MS = 900;
const ALARM_VOLUME = 0.42;

function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  return new Ctor();
}

function clearAudioResources() {
  if (beepInterval !== null) {
    clearInterval(beepInterval);
    beepInterval = null;
  }
  if (oscillator) {
    try {
      oscillator.stop();
    } catch {
      /* already stopped */
    }
    try {
      oscillator.disconnect();
    } catch {
      /* ignore */
    }
    oscillator = null;
  }
  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch {
      /* ignore */
    }
    gainNode = null;
  }
  if (audioContext) {
    const ctx = audioContext;
    audioContext = null;
    void ctx.close().catch(() => {});
  }
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(0);
  }
}

export async function playAlarm() {
  if (isAlarmPlaying) return;
  isAlarmPlaying = true;
  clearAudioResources();
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([280, 80, 280, 80, 280]);
  }
  try {
    const ctx = createAudioContext();
    if (!ctx) {
      isAlarmPlaying = false;
      return;
    }
    audioContext = ctx;
    if (audioContext.state === "suspended") await audioContext.resume();
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(BEEP_FREQUENCY, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    const runCycle = () => {
      if (!isAlarmPlaying || !audioContext || !gainNode) return;
      let t = audioContext.currentTime;
      for (let i = 0; i < BEEPS_PER_CYCLE; i++) {
        const freq = BEEP_FREQUENCY + (i % 2 === 0 ? 0 : 60);
        oscillator?.frequency.setValueAtTime(freq, t);
        gainNode.gain.setValueAtTime(ALARM_VOLUME, t);
        gainNode.gain.setValueAtTime(0.0001, t + BEEP_ON_MS / 1000);
        t += (BEEP_ON_MS + BEEP_OFF_MS) / 1000;
      }
    };
    runCycle();
    const cycleMs = BEEPS_PER_CYCLE * (BEEP_ON_MS + BEEP_OFF_MS) + GAP_AFTER_CYCLE_MS;
    beepInterval = setInterval(runCycle, cycleMs);
  } catch {
    stopAlarm();
  }
}

export function stopAlarm() {
  isAlarmPlaying = false;
  clearAudioResources();
}

export function isPlaying() {
  return isAlarmPlaying;
}
