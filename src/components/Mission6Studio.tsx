import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react';
import type { LearnerProfile, RecordingMetadata, ScriptState } from '../types';
import { loadRecordingBlob, saveRecordingBlob } from '../utils/audioStorage';
import { downloadBlob } from '../utils/exportDocs';
import { convertAudioBlobToMp3, detectNativeExtension } from '../utils/mp3Converter';
import { playSuccessSound } from '../utils/sound';

interface Mission6StudioProps {
  profile: LearnerProfile;
  script: ScriptState;
  recordingMeta: RecordingMetadata | null;
  soundEnabled: boolean;
  isCompleted: boolean;
  onSaveRecording: (meta: RecordingMetadata, blob: Blob | null) => void;
  onUpdatePublicUrl: (url: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

type RecordStatus = 'idle' | 'recording' | 'paused' | 'recorded';

export function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function Mission6Studio({
  profile,
  script,
  recordingMeta,
  soundEnabled,
  isCompleted,
  onSaveRecording,
  onUpdatePublicUrl,
  onComplete,
  onBack,
}: Mission6StudioProps) {
  const [status, setStatus] = useState<RecordStatus>(recordingMeta ? 'recorded' : 'idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    recordingMeta?.durationSeconds || 0
  );
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isConvertingMp3, setIsConvertingMp3] = useState(false);
  const [conversionNote, setConversionNote] = useState('');
  const [micError, setMicError] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [publicUrl, setPublicUrl] = useState(recordingMeta?.publicAudioUrl || '');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(recordingMeta?.durationSeconds || 0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyserCtxRef = useRef<AudioContext | null>(null);

  // Load persisted recording from IndexedDB on mount
  useEffect(() => {
    let active = true;
    loadRecordingBlob()
      .then((blob) => {
        if (!active || !blob) return;
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus('recorded');
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Cleanup media streams & object URLs
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (analyserCtxRef.current) {
        analyserCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const fullScriptBlocks = useMemo(() => {
    return [
      { title: 'PART 1 – PERSONAL INTRODUCTION', text: script.part1 },
      { title: '1. MY ACADEMIC JOURNEY', text: script.part2.journey },
      { title: '2. WHY I CHOSE MY TRAINING PROGRAM', text: script.part2.whyProgram },
      { title: '3. SKILLS AND KNOWLEDGE', text: script.part2.skillsAndKnowledge },
      { title: '4. MY FUTURE PLANS AND PROFESSIONAL GOALS', text: script.part2.futurePlans },
      { title: '5. MY PROFESSIONAL FUTURE', text: script.part2.professionalFuture },
      { title: '6. CHALLENGES AND SOLUTIONS', text: script.part2.challengesAndSolutions },
      { title: 'CONCLUSION', text: script.conclusion || '' },
    ].filter((b) => b.text.trim().length > 0);
  }, [script]);

  const startWaveformVisualizer = (stream: MediaStream) => {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass || !canvasRef.current) return;

    const audioCtx = new AudioContextClass();
    analyserCtxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 40;
      const barWidth = Math.max(3, (width - barCount * 3) / barCount);
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i % bufferLength] || 0;
        const barHeight = Math.max(4, (value / 255) * (height - 10));
        const x = i * (barWidth + 3);
        const y = (height - barHeight) / 2;
        ctx.fillStyle = i % 3 === 0 ? '#10B981' : i % 3 === 1 ? '#38BDF8' : '#8B5CF6';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }
    };
    draw();
  };

  const stopVisualizerAndStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (analyserCtxRef.current) {
      analyserCtxRef.current.close().catch(() => {});
      analyserCtxRef.current = null;
    }
  };

  const startTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSeconds(elapsedRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    setMicError('');
    setConversionNote('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicError(
        'Tu navegador no soporta la grabación directa con micrófono (MediaRecorder API). Puedes grabar externamente y subir tu enlace de Spreaker/Podbean abajo.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];
      const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stopTimer();
        stopVisualizerAndStream();
        const rawType = recorder.mimeType || 'audio/webm';
        const rawBlob = new Blob(chunksRef.current, { type: rawType });

        setRecordedBlob(rawBlob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(rawBlob));
        setStatus('recorded');

        const meta: RecordingMetadata = {
          durationSeconds: elapsedRef.current,
          recordedAt: new Date().toISOString(),
          format: detectNativeExtension(rawType),
          publicAudioUrl: publicUrl,
        };
        await saveRecordingBlob(rawBlob).catch(() => {});
        onSaveRecording(meta, rawBlob);
        playSuccessSound(soundEnabled);
      };

      elapsedRef.current = 0;
      setElapsedSeconds(0);
      recorder.start(250);
      setStatus('recording');
      startTimer();
      startWaveformVisualizer(stream);
    } catch (err) {
      const msg = err instanceof Error ? err.name : '';
      if (msg === 'NotAllowedError' || msg === 'PermissionDeniedError') {
        setMicError(
          'Permiso de micrófono denegado. Haz clic en el icono de candado junto a la URL del navegador y permite el acceso al micrófono.'
        );
      } else if (msg === 'NotFoundError') {
        setMicError('No se detectó ningún micrófono conectado en tu dispositivo.');
      } else {
        setMicError('No fue posible iniciar la grabación de audio.');
      }
    }
  };

  const handlePause = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      stopTimer();
      setStatus('paused');
    }
  };

  const handleResume = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTimer();
      setStatus('recording');
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleResetRecording = () => {
    setStatus('idle');
    elapsedRef.current = 0;
    setElapsedSeconds(0);
    setConversionNote('');
  };

  const handleDownloadMp3 = async () => {
    if (!recordedBlob) return;
    setIsConvertingMp3(true);
    setConversionNote('');

    const result = await convertAudioBlobToMp3(recordedBlob);
    setIsConvertingMp3(false);

    if (result.note) {
      setConversionNote(result.note);
    }

    const safeName = (profile.fullName || 'Aprendiz_SENA').trim().replace(/\s+/g, '_');
    downloadBlob(
      result.blob,
      `Audio_GA3-240202501-AA2-EV02_${safeName}.${result.format}`
    );

    if (recordingMeta) {
      onSaveRecording({ ...recordingMeta, format: result.format }, result.blob);
    }
    playSuccessSound(soundEnabled);
  };

  const durationFeedback =
    elapsedSeconds === 0
      ? null
      : elapsedSeconds < 120
        ? {
            ok: false,
            label: 'Audio demasiado corto (mínimo 2:00 minutos)',
          }
        : elapsedSeconds <= 300
          ? {
              ok: true,
              label: 'Duración correcta (entre 2 y 5 minutos)',
            }
          : {
              ok: false,
              label: 'Audio demasiado largo (máximo 5:00 minutos)',
            };

  const canComplete = Boolean(recordedBlob) || publicUrl.trim().length > 8;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-100 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Mapa</span>
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Teleprompter Script */}
        <div className="rounded-2xl border border-slate-800 bg-[#0B1221] p-5 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <p className="font-mono-num text-xs font-semibold text-sky-400">TELEPROMPTER</p>
              <h2 className="font-display text-lg font-bold text-slate-100">
                Lee tu guion mientras grabas
              </h2>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-[#060B17] p-1">
              {(['sm', 'base', 'lg'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFontSize(sz)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    fontSize === sz
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sz === 'sm' ? 'A-' : sz === 'base' ? 'A' : 'A+'}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`mt-4 max-h-[520px] space-y-5 overflow-y-auto pr-2 leading-relaxed text-slate-200 ${
              fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'
            }`}
          >
            {fullScriptBlocks.length === 0 ? (
              <p className="text-sm text-slate-400">
                Aún no has redactado tu guion en la Misión 5. Vuelve a Misión 5 para generarlo.
              </p>
            ) : (
              fullScriptBlocks.map((block) => (
                <div key={block.title}>
                  <p className="text-xs font-bold tracking-wide text-emerald-400">
                    {block.title}
                  </p>
                  <p className="mt-1 whitespace-pre-line">{block.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Podcast Recording Console */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0B1221] p-6 lg:col-span-6">
          <div>
            <p className="font-mono-num text-xs font-semibold text-emerald-400">
              MISSION 6 · +350 XP · PODCAST STUDIO
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-slate-50">
              RECORD YOUR VOICE
            </h1>

            {/* Timer & Acoustic Waveform */}
            <div className="mt-5 rounded-2xl border border-slate-800 bg-[#060B17] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {status === 'recording'
                    ? 'Grabando en vivo'
                    : status === 'paused'
                      ? 'Grabación en pausa'
                      : status === 'recorded'
                        ? 'Grabación completada'
                        : 'Listo para grabar'}
                </span>
                <span className="font-mono-num text-3xl font-bold text-slate-50">
                  {formatSeconds(elapsedSeconds)}
                </span>
              </div>

              <div className="mt-4 h-20 w-full overflow-hidden rounded-xl bg-[#0B1221] p-2">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={64}
                  className="h-full w-full"
                />
              </div>

              {/* Duration Validation Banner */}
              {durationFeedback && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                    durationFeedback.ok
                      ? 'bg-emerald-950/60 text-emerald-300'
                      : 'bg-amber-950/60 text-amber-200'
                  }`}
                >
                  {durationFeedback.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  )}
                  <span>{durationFeedback.label}</span>
                </div>
              )}
            </div>

            {micError && (
              <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs leading-relaxed text-rose-200">
                {micError}
              </p>
            )}

            {/* Studio Controls */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {status === 'idle' && (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                >
                  <Mic className="h-4 w-4" />
                  <span>START RECORDING</span>
                </button>
              )}

              {status === 'recording' && (
                <>
                  <button
                    type="button"
                    onClick={handlePause}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
                  >
                    <Pause className="h-4 w-4" />
                    <span>PAUSE</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-xs font-bold text-white hover:bg-rose-400 cursor-pointer"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    <span>STOP</span>
                  </button>
                </>
              )}

              {status === 'paused' && (
                <>
                  <button
                    type="button"
                    onClick={handleResume}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-sky-400 cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>RESUME</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-xs font-bold text-white hover:bg-rose-400 cursor-pointer"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    <span>STOP</span>
                  </button>
                </>
              )}

              {status === 'recorded' && (
                <>
                  <button
                    type="button"
                    disabled={isConvertingMp3}
                    onClick={handleDownloadMp3}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 cursor-pointer"
                  >
                    {isConvertingMp3 ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Codificando MP3...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Descargar Audio MP3</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetRecording}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-slate-700 bg-[#111B30] px-4 py-3 text-xs font-bold text-slate-200 hover:border-sky-400/50 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Volver a grabar</span>
                  </button>
                </>
              )}
            </div>

            {conversionNote && (
              <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-200">
                {conversionNote}
              </p>
            )}

            {/* Playback Player */}
            {audioUrl && status === 'recorded' && (
              <div className="mt-5 rounded-xl border border-slate-800 bg-[#111B30] p-4">
                <p className="mb-2 text-xs font-semibold text-sky-300">
                  Escucha tu grabación antes de descargar:
                </p>
                <audio controls src={audioUrl} className="w-full" />
              </div>
            )}

            {/* Public Podcast Platforms Section */}
            <div className="mt-6 rounded-2xl border border-slate-800 bg-[#111B30] p-4">
              <p className="text-xs font-bold text-slate-100">
                ¿Prefieres entregar un enlace público?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                También puedes subir tu archivo de audio a Spreaker o Podbean para obtener un enlace
                público de reproducción y pegarlo aquí:
              </p>

              <div className="mt-3 flex flex-wrap gap-2.5">
                <a
                  href="https://www.spreaker.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2 text-xs font-bold text-sky-300 hover:border-sky-400 cursor-pointer"
                >
                  <span>Ir a Spreaker</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://www.podbean.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2 text-xs font-bold text-emerald-300 hover:border-emerald-400 cursor-pointer"
                >
                  <span>Ir a Podbean</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <input
                type="url"
                value={publicUrl}
                onChange={(e) => {
                  setPublicUrl(e.target.value);
                  onUpdatePublicUrl(e.target.value);
                }}
                placeholder="Pega aquí tu enlace público (opcional, ej: https://www.spreaker.com/...)"
                className="mt-3 w-full rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-800 pt-5">
            <p className="text-xs text-slate-400">
              {!canComplete
                ? 'Graba tu audio o pega tu enlace público para completar la misión.'
                : '¡Audio preparado! Continúa a la verificación final.'}
            </p>
            <button
              type="button"
              disabled={!canComplete}
              onClick={onComplete}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isCompleted ? 'Ir a Entrega Final' : 'COMPLETE MISSION'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
