function playTone(frequency: number, durationMs: number, volume = 0.12): void {
  if (typeof window === "undefined") return;

  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + durationMs / 1000);

    window.setTimeout(() => {
      void ctx.close();
    }, durationMs + 80);
  } catch {
    // Audio unsupported or blocked.
  }
}

export function playCheckInSuccess(): void {
  playTone(880, 100);
  window.setTimeout(() => playTone(1175, 90), 110);
}

export function playCheckInError(): void {
  playTone(220, 180);
}

export function vibrateCheckInSuccess(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(100);
  }
}

export function vibrateCheckInError(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([60, 40, 60]);
  }
}

export function notifyCheckInResult(ok: boolean): void {
  if (ok) {
    playCheckInSuccess();
    vibrateCheckInSuccess();
  } else {
    playCheckInError();
    vibrateCheckInError();
  }
}
