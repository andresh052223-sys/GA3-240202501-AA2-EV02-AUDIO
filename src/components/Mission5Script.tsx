import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Square,
  Volume2,
  Wand2,
} from 'lucide-react';
import type {
  JourneyQuestionAnswer,
  LearnerProfile,
  ScriptPart2,
  ScriptState,
} from '../types';
import { exportScriptToDocx, exportScriptToPdf } from '../utils/exportDocs';
import { playErrorSound, playSuccessSound } from '../utils/sound';
import { speakEnglish, stopSpeech } from '../utils/tts';

interface Mission5ScriptProps {
  profile: LearnerProfile;
  customIntroduction: string;
  journeyAnswers: JourneyQuestionAnswer[];
  script: ScriptState;
  soundEnabled: boolean;
  isCompleted: boolean;
  onUpdateScript: (script: ScriptState) => void;
  onComplete: () => void;
  onBack: () => void;
}

const SECTION_LABELS: Array<{ key: keyof ScriptPart2; label: string }> = [
  { key: 'journey', label: '1. My academic and professional journey' },
  { key: 'futurePlans', label: '2. My future plans and goals' },
  { key: 'decisionsAndActions', label: '3. My decisions and actions' },
  { key: 'problemsAndSolutions', label: '4. Possible problems and solutions' },
  { key: 'leadership', label: '5. Leadership and professional responsibility' },
  { key: 'adaptability', label: '6. Flexibility and adaptability' },
];

export function countScriptWords(script: ScriptState): number {
  const full = [
    script.part1,
    script.part2.journey,
    script.part2.futurePlans,
    script.part2.decisionsAndActions,
    script.part2.problemsAndSolutions,
    script.part2.leadership,
    script.part2.adaptability,
  ]
    .join(' ')
    .trim();
  if (!full) return 0;
  return full.split(/\s+/).length;
}

export function Mission5Script({
  profile,
  customIntroduction,
  journeyAnswers,
  script,
  soundEnabled,
  isCompleted,
  onUpdateScript,
  onComplete,
  onBack,
}: Mission5ScriptProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const wordCount = useMemo(() => countScriptWords(script), [script]);
  const estimatedSeconds = Math.round((wordCount / 125) * 60);
  const mins = Math.floor(estimatedSeconds / 60);
  const secs = estimatedSeconds % 60;

  const durationStatus =
    wordCount === 0
      ? 'Aún sin contenido'
      : estimatedSeconds < 120
        ? 'Por debajo de 2 min (agrega un poco más de detalle)'
        : estimatedSeconds <= 300
          ? 'Duración ideal para 2–5 minutos'
          : 'Mayor a 5 min (puedes resumirlo levemente)';

  const fullReadableText = useMemo(() => {
    return [
      script.part1,
      script.part2.journey,
      script.part2.futurePlans,
      script.part2.decisionsAndActions,
      script.part2.problemsAndSolutions,
      script.part2.leadership,
      script.part2.adaptability,
    ]
      .filter((s) => s.trim().length > 0)
      .join('\n\n');
  }, [script]);

  const handleGenerate = async () => {
    setError('');
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          customIntroduction,
          journeyAnswers: journeyAnswers.map((a) => ({
            questionEs: a.questionEs,
            questionEn: a.questionEn,
            userInput: a.userInput,
            suggestedEnglish: a.suggestedEnglish,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo generar el guion.');

      onUpdateScript({
        ...script,
        part1: data.part1 || customIntroduction,
        part2: data.part2 || script.part2,
        conditionalsUsed: data.conditionalsUsed,
        lastFeedbackEs:
          'Guion generado con tus datos reales, conectores naturales y los 3 condicionales.',
      });
      playSuccessSound(soundEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el guion.');
      playErrorSound(soundEnabled);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async () => {
    if (wordCount < 20) {
      setError('Primero genera o escribe tu guion antes de mejorarlo.');
      return;
    }
    setError('');
    setIsImproving(true);
    try {
      const res = await fetch('/api/ai/improve-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part1: script.part1,
          part2: script.part2,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo mejorar el guion.');

      onUpdateScript({
        ...script,
        part1: data.part1 || script.part1,
        part2: data.part2 || script.part2,
        lastFeedbackEs: data.feedbackEs || 'Gramática y coherencia mejoradas.',
      });
      playSuccessSound(soundEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al mejorar el inglés.');
      playErrorSound(soundEnabled);
    } finally {
      setIsImproving(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportScriptToDocx(profile, script);
      onUpdateScript({ ...script, exportedDocument: true });
      playSuccessSound(soundEnabled);
    } catch {
      setError('No se pudo generar el archivo Word (.docx).');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadPdf = () => {
    try {
      exportScriptToPdf(profile, script);
      onUpdateScript({ ...script, exportedDocument: true });
      playSuccessSound(soundEnabled);
    } catch {
      setError('No se pudo generar el archivo PDF.');
    }
  };

  const canComplete =
    script.part1.trim().length > 10 &&
    Object.values(script.part2).every((val) => val.trim().length > 10);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-100 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Mapa</span>
      </button>

      <div className="rounded-2xl border border-slate-800 bg-[#0B1221] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center">
          <div>
            <p className="font-mono-num text-xs font-semibold text-sky-400">
              MISSION 5 · +300 XP · Insignia SCRIPT CREATOR
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
              BUILD YOUR AUDIO SCRIPT
            </h1>
            <p className="mt-1.5 text-sm text-slate-300">
              Construye tu guion oficial con tus respuestas anteriores, perfícelo en inglés
              intermedio y descárgalo en Word o PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isGenerating || isImproving}
              onClick={handleGenerate}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>GENERATE MY SCRIPT</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isGenerating || isImproving}
              onClick={handleImprove}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-violet-500 disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Revisando...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>IMPROVE MY ENGLISH</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metrics & Export Bar */}
        <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-[#111B30] p-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-sky-400" />
            <div>
              <p className="text-xs text-slate-400">Duración estimada de lectura</p>
              <p className="font-mono-num text-sm font-bold text-slate-100">
                ~{mins}:{secs.toString().padStart(2, '0')} min ({wordCount} palabras)
              </p>
              <p
                className={`text-xs ${
                  estimatedSeconds >= 120 && estimatedSeconds <= 300
                    ? 'text-emerald-400'
                    : 'text-amber-300'
                }`}
              >
                {durationStatus}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:justify-center">
            {!isSpeaking ? (
              <button
                type="button"
                disabled={!fullReadableText}
                onClick={() =>
                  speakEnglish(fullReadableText, {
                    rate: 0.92,
                    onStart: () => setIsSpeaking(true),
                    onEnd: () => setIsSpeaking(false),
                  })
                }
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/15 px-4 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/25 disabled:opacity-40 cursor-pointer"
              >
                <Volume2 className="h-4 w-4" />
                <span>Escuchar guion completo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setIsSpeaking(false);
                }}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Detener lectura</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              disabled={!fullReadableText || isExportingDocx}
              onClick={handleDownloadDocx}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-sky-400/60 disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-sky-400" />
              <span>DOCX</span>
            </button>
            <button
              type="button"
              disabled={!fullReadableText}
              onClick={handleDownloadPdf}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-emerald-400/60 disabled:opacity-40 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {script.lastFeedbackEs && (
          <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-950/25 px-4 py-3 text-xs leading-relaxed text-violet-200">
            <span className="font-bold">Revisión del asistente: </span>
            {script.lastFeedbackEs}
          </div>
        )}

        {/* PART 1 – PERSONAL INTRODUCTION */}
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111B30] p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-emerald-400">
                PART 1 – PERSONAL INTRODUCTION
              </h2>
              <button
                type="button"
                onClick={() => speakEnglish(script.part1, { rate: 0.92 })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-sky-200 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Escuchar</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={script.part1}
              onChange={(e) => onUpdateScript({ ...script, part1: e.target.value })}
              placeholder="Haz clic en GENERATE MY SCRIPT o edita aquí tu presentación personal..."
              className="mt-3 w-full rounded-xl border border-slate-700 bg-[#060B17] p-3.5 text-sm leading-relaxed text-slate-100 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* PART 2 – ACADEMIC AND PROFESSIONAL REFLECTION */}
          <div className="rounded-2xl border border-slate-800 bg-[#111B30] p-5">
            <h2 className="font-display text-base font-bold text-sky-400">
              PART 2 – ACADEMIC AND PROFESSIONAL REFLECTION
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Todas las secciones son editables manualmente para que reflejen exactamente tu voz.
            </p>

            <div className="mt-4 space-y-4">
              {SECTION_LABELS.map((sec) => (
                <div key={sec.key}>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-200">{sec.label}</label>
                    {script.part2[sec.key].trim() && (
                      <button
                        type="button"
                        onClick={() => speakEnglish(script.part2[sec.key], { rate: 0.92 })}
                        className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200 cursor-pointer"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Escuchar</span>
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={script.part2[sec.key]}
                    onChange={(e) =>
                      onUpdateScript({
                        ...script,
                        part2: { ...script.part2, [sec.key]: e.target.value },
                      })
                    }
                    placeholder="Se completará automáticamente al pulsar GENERATE MY SCRIPT..."
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] p-3 text-sm leading-relaxed text-slate-100 focus:border-sky-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Conditionals Highlight Summary */}
          {script.conditionalsUsed && (
            <div className="rounded-2xl border border-slate-800 bg-[#060B17] p-4 text-xs">
              <p className="font-semibold text-violet-300">
                Condicionales verificados dentro de tu guion:
              </p>
              <ul className="mt-2 space-y-1.5 text-slate-300">
                <li>
                  <span className="font-semibold text-sky-300">Zero:</span>{' '}
                  {script.conditionalsUsed.zero}
                </li>
                <li>
                  <span className="font-semibold text-emerald-300">First:</span>{' '}
                  {script.conditionalsUsed.first}
                </li>
                <li>
                  <span className="font-semibold text-violet-300">Second:</span>{' '}
                  {script.conditionalsUsed.second}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Complete CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            {!canComplete
              ? 'Pulsa GENERATE MY SCRIPT o completa todas las secciones para pasar al estudio de grabación.'
              : 'Guion completo. ¡Ya estás listo para grabar tu voz en la Misión 6!'}
          </p>

          <button
            type="button"
            disabled={!canComplete}
            onClick={onComplete}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isCompleted ? 'Continuar a Misión 6' : 'COMPLETE MISSION'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
