// Browser Text-to-Speech helper for English pronunciation practice

export interface TtsOptions {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech(): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.cancel();
}

function selectEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isTtsSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred =
    voices.find((v) => v.lang === 'en-US' && v.localService) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en-GB')) ||
    voices.find((v) => v.lang.startsWith('en'));

  return preferred ?? null;
}

export function speakEnglish(text: string, options: TtsOptions = {}): void {
  if (!isTtsSupported()) {
    options.onError?.('Tu navegador no soporta síntesis de voz (Text-to-Speech).');
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    options.onError?.('No hay texto en inglés para reproducir.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = 'en-US';
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = 1;

  const voice = selectEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = (event) => {
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      options.onError?.('No se pudo reproducir el audio de voz.');
    }
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}
