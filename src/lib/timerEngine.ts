// SpeakBand — Drift-Free Timestamp Timer Engine

export interface TimerInstance {
  start: () => void;
  pause: () => void;
  reset: (newDurationSeconds?: number) => void;
  getTimeRemaining: () => number;
  getElapsedSeconds: () => number;
  destroy: () => void;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface CreateTimerOptions {
  durationSeconds: number;
  onTick?: (remaining: number, elapsed: number) => void;
  onComplete?: () => void;
  intervalMs?: number;
}

/**
 * Creates an exact timestamp-based timer that prevents JavaScript interval drift.
 * Uses Date.now() / performance.now() epoch targets.
 */
export function createTimestampTimer(options: CreateTimerOptions): TimerInstance {
  const { durationSeconds, onTick, onComplete, intervalMs = 250 } = options;

  let startEpoch: number | null = null;
  let targetEpoch: number | null = null;
  let remainingMs = durationSeconds * 1000;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isRunning = false;
  let isFinished = false;

  const tick = () => {
    if (!isRunning || targetEpoch === null || startEpoch === null) return;

    const now = Date.now();
    const diff = targetEpoch - now;

    if (diff <= 0) {
      isFinished = true;
      isRunning = false;
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      if (onTick) onTick(0, durationSeconds);
      if (onComplete) onComplete();
      return;
    }

    const remainingSec = Math.ceil(diff / 1000);
    const elapsedSec = Math.floor((now - startEpoch) / 1000);

    if (onTick) {
      onTick(remainingSec, elapsedSec);
    }
  };

  const start = () => {
    if (isRunning || isFinished) return;
    isRunning = true;
    startEpoch = Date.now() - (durationSeconds * 1000 - remainingMs);
    targetEpoch = Date.now() + remainingMs;

    tick();
    intervalId = setInterval(tick, intervalMs);
  };

  const pause = () => {
    if (!isRunning) return;
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (targetEpoch) {
      remainingMs = Math.max(0, targetEpoch - Date.now());
    }
  };

  const reset = (newDurationSeconds?: number) => {
    pause();
    const duration = newDurationSeconds !== undefined ? newDurationSeconds : durationSeconds;
    remainingMs = duration * 1000;
    startEpoch = null;
    targetEpoch = null;
    isFinished = false;
    if (onTick) onTick(duration, 0);
  };

  const getTimeRemaining = (): number => {
    if (targetEpoch === null) return Math.ceil(remainingMs / 1000);
    return Math.max(0, Math.ceil((targetEpoch - Date.now()) / 1000));
  };

  const getElapsedSeconds = (): number => {
    if (startEpoch === null) return 0;
    return Math.max(0, Math.floor((Date.now() - startEpoch) / 1000));
  };

  const destroy = () => {
    pause();
    startEpoch = null;
    targetEpoch = null;
  };

  return {
    start,
    pause,
    reset,
    getTimeRemaining,
    getElapsedSeconds,
    destroy,
  };
}
