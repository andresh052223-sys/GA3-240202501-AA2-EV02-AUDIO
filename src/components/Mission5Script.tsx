import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  RotateCcw,
  Square,
  Volume2,
  Wand2,
} from 'lucide-react';
import type {
  JourneyQuestionAnswer,
  LearnerProfile,
  ScriptState,
} from '../types';
import { exportScriptToDocx, exportScriptToPdf } from '../utils/exportDocs';
import {
  buildFullPart2FromJourney,
  DEFAULT_CONCLUSION,
  DEFAULT_CONDITIONALS_USED,
  PART2_SECTION_META,
  polishEnglishScriptLocally,
} from '../utils/scriptBuilder';
import { playSuccessSound } from '../utils/sound';
import { speakEnglish, stopSpeech } from '../utils/tts';

interface Mission5ScriptProps {
  profile: LearnerProfile;
  customIntroduction: string;
  journeyAnswers: JourneyQuestionAnswer[];
  script: ScriptState;
  soundEnabled: boolean;
  isCompleted: boolean;
  onUpdateScript: (script: ScriptState) => void;
  onGoToMission3: () => void;
  onComplete: () => void;
  onBack: () => void;
}

export function countScriptWords(script: ScriptState): number {
  const full = [
    script.part1,
    script.part2.journey,
    script.part2.whyProgram,
    script.part2.skillsAndKnowledge,
    script.part2.futurePlans,
    script.part2.professionalFuture,
    script.part2.challengesAndSolutions,
    script.conclusion || '',
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
  onGoToMission3,
  onComplete,
  onBack,
}: Mission5ScriptProps) {
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  // Automatically hydrate Part 1, Part 2, and Conclusion on entry if any built section is empty
  useEffect(() => {
    const builtPart2 = buildFullPart2FromJourney(journeyAnswers);
    const needsPart1 = !script.part1.trim() && customIntroduction.trim().length > 0;
    const needsConclusion = !(script.conclusion || '').trim();
    const needsAnyPart2 = PART2_SECTION_META.some(
      (meta) => !script.part2[meta.key]?.trim() && builtPart2[meta.key].trim().length > 0
    );

    if (needsPart1 || needsConclusion || needsAnyPart2) {
      onUpdateScript({
        ...script,
        part1: needsPart1 ? customIntroduction : script.part1,
        part2: {
          journey: script.part2.journey.trim() || builtPart2.journey,
          whyProgram: script.part2.whyProgram.trim() || builtPart2.whyProgram,
          skillsAndKnowledge:
            script.part2.skillsAndKnowledge.trim() || builtPart2.skillsAndKnowledge,
          futurePlans: script.part2.futurePlans.trim() || builtPart2.futurePlans,
          professionalFuture:
            script.part2.professionalFuture.trim() || builtPart2.professionalFuture,
          challengesAndSolutions:
            script.part2.challengesAndSolutions.trim() || builtPart2.challengesAndSolutions,
        },
        conclusion: (script.conclusion || '').trim() || DEFAULT_CONCLUSION,
        conditionalsUsed: script.conditionalsUsed || DEFAULT_CONDITIONALS_USED,
      });
    }
  }, [journeyAnswers, customIntroduction, script, onUpdateScript]);

  const missingQuestions = useMemo(() => {
    return journeyAnswers.filter((q) => !q.suggestedEnglish.trim());
  }, [journeyAnswers]);

  const wordCount = useMemo(() => countScriptWords(script), [script]);
  const estimatedSeconds = Math.round((wordCount / 125) * 60);
  const mins = Math.floor(estimatedSeconds / 60);
  const secs = estimatedSeconds % 60;

  const durationStatus =
    wordCount === 0
      ? 'Aún sin contenido'
      : estimatedSeconds < 120
        ? 'Por debajo de 2 min (completa las 6 preguntas en Misión 3 o añade detalle)'
        : estimatedSeconds <= 300
          ? 'Duración ideal para 2–5 minutos'
          : 'Mayor a 5 min (puedes resumirlo levemente)';

  const fullReadableText = useMemo(() => {
    return [
      script.part1,
      script.part2.journey,
      script.part2.whyProgram,
      script.part2.skillsAndKnowledge,
      script.part2.futurePlans,
      script.part2.professionalFuture,
      script.part2.challengesAndSolutions,
      script.conclusion || '',
    ]
      .filter((s) => s.trim().length > 0)
      .join('\n\n');
  }, [script]);

  const handleImproveLocally = () => {
    const polished = polishEnglishScriptLocally(script);
    onUpdateScript(polished);
    playSuccessSound(soundEnabled);
  };

  const handleRestoreFromMission3 = () => {
    const builtPart2 = buildFullPart2FromJourney(journeyAnswers);
    onUpdateScript({
      ...script,
      part1: customIntroduction || script.part1,
      part2: builtPart2,
      conclusion: DEFAULT_CONCLUSION,
      conditionalsUsed: DEFAULT_CONDITIONALS_USED,
      lastFeedbackEs:
        'Guion sincronizado automáticamente con tus datos personales y tus 6 respuestas de la Misión 3.',
    });
    playSuccessSound(soundEnabled);
  };

  const handleDownloadDocx = async () => {
    setExportError('');
    setIsExportingDocx(true);
    try {
      await exportScriptToDocx(profile, script);
      onUpdateScript({ ...script, exportedDocument: true });
      playSuccessSound(soundEnabled);
    } catch {
      setExportError('No se pudo generar el archivo Word (.docx).');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadPdf = () => {
    setExportError('');
    try {
      exportScriptToPdf(profile, script);
      onUpdateScript({ ...script, exportedDocument: true });
      playSuccessSound(soundEnabled);
    } catch {
      setExportError('No se pudo generar el archivo PDF.');
    }
  };

  const canComplete =
    script.part1.trim().length > 10 &&
    PART2_SECTION_META.every((sec) => script.part2[sec.key]?.trim().length > 10);

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
              Tu guion completo en inglés se construye automáticamente con tus datos y las 6
              respuestas elegidas en la Misión 3. Puedes editarlo, escucharlo y descargarlo en Word o
              PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRestoreFromMission3}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-[#111B30] px-4 py-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-sky-400/60 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-sky-400" />
              <span>Sincronizar Misión 3</span>
            </button>

            <button
              type="button"
              onClick={handleImproveLocally}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-violet-500 whitespace-nowrap cursor-pointer"
            >
              <Wand2 className="h-4 w-4" />
              <span>IMPROVE MY ENGLISH</span>
            </button>
          </div>
        </div>

        {/* Missing Mission 3 Answers Notice */}
        {missingQuestions.length > 0 && (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-amber-500/35 bg-amber-950/25 p-4 text-xs text-amber-200 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="font-bold">
                  Faltan {missingQuestions.length} pregunta(s) por responder en la Misión 3:
                </p>
                <p className="mt-1 text-amber-100/90">
                  {missingQuestions.map((q) => `0${q.id}. ${q.questionEs}`).join(' · ')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onGoToMission3}
              className="shrink-0 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap cursor-pointer"
            >
              Completar en Misión 3
            </button>
          </div>
        )}

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

        {exportError && (
          <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {exportError}
          </p>
        )}

        {script.lastFeedbackEs && (
          <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-950/25 px-4 py-3 text-xs leading-relaxed text-violet-200">
            <span className="font-bold">Estado del guion: </span>
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
            <p className="mt-1 text-xs text-slate-400">
              Datos incluidos: {profile.fullName} · ID {profile.idNumber} · Ficha{' '}
              {profile.trainingGroup} · Instructor {profile.instructorName} · {profile.activityName}
            </p>
            <textarea
              rows={4}
              value={script.part1}
              onChange={(e) => onUpdateScript({ ...script, part1: e.target.value })}
              className="mt-3 w-full rounded-xl border border-slate-700 bg-[#060B17] p-3.5 text-sm leading-relaxed text-slate-100 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* PART 2 – ACADEMIC AND PROFESSIONAL REFLECTION */}
          <div className="rounded-2xl border border-slate-800 bg-[#111B30] p-5">
            <h2 className="font-display text-base font-bold text-sky-400">
              PART 2 – ACADEMIC AND PROFESSIONAL REFLECTION
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Discurso generado automáticamente con tus 6 respuestas de la Misión 3, conectores en
              primera persona, condicionales, liderazgo y adaptabilidad. Todas las secciones son
              editables.
            </p>

            <div className="mt-4 space-y-4">
              {PART2_SECTION_META.map((sec) => {
                const sectionValue = script.part2[sec.key] || '';
                return (
                  <div key={sec.key}>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold tracking-wide text-slate-200">
                        {sec.title}
                      </label>
                      {sectionValue.trim() && (
                        <button
                          type="button"
                          onClick={() => speakEnglish(sectionValue, { rate: 0.92 })}
                          className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200 cursor-pointer"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>Escuchar</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={sectionValue}
                      onChange={(e) =>
                        onUpdateScript({
                          ...script,
                          part2: { ...script.part2, [sec.key]: e.target.value },
                        })
                      }
                      placeholder={`Selecciona una respuesta para la pregunta 0${sec.questionId} en la Misión 3...`}
                      className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] p-3 text-sm leading-relaxed text-slate-100 focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                );
              })}

              {/* Automatic Conclusion */}
              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold tracking-wide text-emerald-400">
                    CONCLUSION
                  </label>
                  {(script.conclusion || '').trim() && (
                    <button
                      type="button"
                      onClick={() => speakEnglish(script.conclusion || '', { rate: 0.92 })}
                      className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Escuchar</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={script.conclusion || ''}
                  onChange={(e) => onUpdateScript({ ...script, conclusion: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] p-3 text-sm leading-relaxed text-slate-100 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Conditionals Highlight Summary */}
          <div className="rounded-2xl border border-slate-800 bg-[#060B17] p-4 text-xs">
            <p className="font-semibold text-violet-300">
              Estructuras gramaticales integradas en tu discurso:
            </p>
            <ul className="mt-2 space-y-1.5 text-slate-300">
              <li>
                <span className="font-semibold text-sky-300">Zero Conditional:</span>{' '}
                {(script.conditionalsUsed || DEFAULT_CONDITIONALS_USED).zero}
              </li>
              <li>
                <span className="font-semibold text-emerald-300">First Conditional:</span>{' '}
                {(script.conditionalsUsed || DEFAULT_CONDITIONALS_USED).first}
              </li>
              <li>
                <span className="font-semibold text-violet-300">Second Conditional:</span>{' '}
                {(script.conditionalsUsed || DEFAULT_CONDITIONALS_USED).second}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Complete CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            {!canComplete
              ? 'Asegúrate de responder las 6 preguntas en Misión 3 para que tu guion quede completo.'
              : 'Guion completo y listo. ¡Continúa al estudio de grabación en la Misión 6!'}
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
