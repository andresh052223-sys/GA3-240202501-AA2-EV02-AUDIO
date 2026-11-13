// Synthesized lightweight UI & game feedback chimes using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  startOffset = 0,
  type: OscillatorType = 'sine',
  gainValue = 0.08
) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playSuccessSound(enabled: boolean) {
  if (!enabled) return;
  playTone(523.25, 0.14, 0, 'triangle', 0.07); // C5
  playTone(659.25, 0.18, 0.09, 'triangle', 0.08); // E5
}

export function playErrorSound(enabled: boolean) {
  if (!enabled) return;
  playTone(240, 0.16, 0, 'sine', 0.06);
  playTone(195, 0.2, 0.1, 'sine', 0.06);
}

export function playMissionCompleteSound(enabled: boolean) {
  if (!enabled) return;
  playTone(523.25, 0.14, 0, 'triangle', 0.08); // C5
  playTone(659.25, 0.14, 0.1, 'triangle', 0.08); // E5
  playTone(783.99, 0.16, 0.2, 'triangle', 0.09); // G5
  playTone(1046.5, 0.34, 0.31, 'triangle', 0.1); // C6
}

export function playVictoryFanfare(enabled: boolean) {
  if (!enabled) return;
  const notes = [
    { f: 523.25, t: 0, d: 0.14 },
    { f: 659.25, t: 0.11, d: 0.14 },
    { f: 783.99, t: 0.22, d: 0.14 },
    { f: 1046.5, t: 0.34, d: 0.24 },
    { f: 783.99, t: 0.56, d: 0.14 },
    { f: 1046.5, t: 0.7, d: 0.45 },
  ];
  for (const n of notes) {
    playTone(n.f, n.d, n.t, 'triangle', 0.09);
  }
}
