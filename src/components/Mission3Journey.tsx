import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type { JourneyQuestionAnswer } from '../types';
import { postJson } from '../utils/apiClient';
import { playErrorSound, playSuccessSound } from '../utils/sound';
import { speakEnglish } from '../utils/tts';

interface Mission3JourneyProps {
  answers: JourneyQuestionAnswer[];
  trainingProgram: string;
  soundEnabled: boolean;
  isCompleted: boolean;
  onUpdateAnswers: (answers: JourneyQuestionAnswer[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

interface TransformIdeaResponse {
  needsMoreDetail?: boolean;
  clarificationEs?: string;
  englishSentence?: string;
  spanishTranslation?: string;
  grammarNote?: string;
}

export function Mission3Journey({
  answers,
  trainingProgram,
  soundEnabled,
  isCompleted,
  onUpdateAnswers,
  onComplete,
  onBack,
}: Mission3JourneyProps) {
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [clarifications, setClarifications] = useState<Record<number, string>>({});

  const readyCount = answers.filter((a) => a.suggestedEnglish.trim().length > 0).length;
  const progressPercent = Math.round((readyCount / answers.length) * 100);

  const handleInputChange = (id: number, userInput: string) => {
    const next = answers.map((item) => (item.id === id ? { ...item, userInput } : item));
    onUpdateAnswers(next);
    if (clarifications[id]) {
      setClarifications((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleEnglishChange = (id: number, suggestedEnglish: string) => {
    const next = answers.map((item) => (item.id === id ? { ...item, suggestedEnglish } : item));
    onUpdateAnswers(next);
  };

  const transformSingle = async (item: JourneyQuestionAnswer) => {
    if (loadingIds.includes(item.id)) return;

    if (!item.userInput.trim()) {
      setErrors((prev) => ({
        ...prev,
        [item.id]: 'Escribe primero tu idea en español o inglés antes de transformarla.',
      }));
      playErrorSound(soundEnabled);
      return;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });
    setClarifications((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });
    setLoadingIds((prev) => [...prev, item.id]);

    try {
      const data = await postJson<TransformIdeaResponse>('/api/ai/transform-idea', {
        questionEs: item.questionEs,
        questionEn: item.questionEn,
        userInput: item.userInput,
        trainingProgram,
      });

      if (data.needsMoreDetail) {
        setClarifications((prev) => ({
          ...prev,
          [item.id]:
            data.clarificationEs ||
            'Tu respuesta es muy corta o ambigua. Por favor amplía un poco más tu idea para no inventar información.',
        }));
        playErrorSound(soundEnabled);
        return;
      }

      if (!data.englishSentence || !data.englishSentence.trim()) {
        throw new Error('No se recibió una oración en inglés válida. Por favor intenta de nuevo.');
      }

      const next = answers.map((q) =>
        q.id === item.id
          ? {
              ...q,
              suggestedEnglish: data.englishSentence || '',
              spanishTranslation: data.spanishTranslation || '',
              grammarNote: data.grammarNote || '',
            }
          : q
      );
      onUpdateAnswers(next);
      playSuccessSound(soundEnabled);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el asistente. Intenta de nuevo.';
      console.error('[Mission3 Transform Error]', { questionId: item.id, err });
      setErrors((prev) => ({ ...prev, [item.id]: msg }));
      playErrorSound(soundEnabled);
    } finally {
      setLoadingIds((prev) => prev.filter((x) => x !== item.id));
    }
  };

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
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono-num text-xs font-semibold text-sky-400">
              MISSION 3 · +200 XP · Insignia GRAMMAR MASTER
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
              TALK ABOUT YOUR JOURNEY
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Responde las 6 preguntas guía en español o inglés con tu información real. Nuestro
              asistente convertirá tus ideas en oraciones naturales sin inventar experiencias.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="font-mono-num text-lg font-bold text-emerald-400">
              {readyCount}/6
            </span>
            <p className="text-xs text-slate-400">Respuestas en inglés listas</p>
          </div>
        </div>

        {/* Progress Bar for the 6 guiding questions */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.max(progressPercent, 2)}%` }}
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {answers.map((item) => {
            const isLoading = loadingIds.includes(item.id);
            const hasSuggestion = item.suggestedEnglish.trim().length > 0;
            const errMsg = errors[item.id];
            const clarificationMsg = clarifications[item.id];

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-[#111B30] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono-num text-xs font-semibold text-sky-400">
                      Pregunta 0{item.id}
                    </p>
                    <h2 className="font-display mt-1 text-base font-bold text-slate-100 sm:text-lg">
                      {item.questionEs}
                    </h2>
                    <p className="text-sm font-medium text-sky-300">{item.questionEn}</p>
                  </div>

                  {hasSuggestion && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Lista</span>
                    </span>
                  )}
                </div>

                {/* User Original Idea Input */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-300">
                    My original idea (escribe en español o inglés):
                  </label>
                  <div className="mt-1.5 flex flex-col gap-3 sm:flex-row">
                    <textarea
                      rows={2}
                      value={item.userInput}
                      disabled={isLoading}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      placeholder={item.placeholderEs}
                      className="w-full rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none disabled:opacity-70"
                    />
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => transformSingle(item)}
                      className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-violet-500 disabled:cursor-wait disabled:opacity-65 whitespace-nowrap cursor-pointer sm:self-end"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>AI IS THINKING...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Convertir a inglés</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isLoading && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-950/30 px-3.5 py-2 text-xs font-semibold text-violet-200">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-300" />
                    <span>AI IS THINKING... Analizando tu idea sin inventar información.</span>
                  </div>
                )}

                {clarificationMsg && (
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/35 bg-amber-950/30 px-3.5 py-2.5 text-xs leading-relaxed text-amber-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <span>{clarificationMsg}</span>
                  </div>
                )}

                {errMsg && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-500/35 bg-rose-950/35 px-3.5 py-2.5 text-xs text-rose-200">
                    <span>{errMsg}</span>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => transformSingle(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-400/40 bg-rose-500/15 px-2.5 py-1 font-semibold text-rose-100 hover:bg-rose-500/25 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Reintentar</span>
                    </button>
                  </div>
                )}

                {/* Result Panel: My idea in English + Original + Traducción */}
                {hasSuggestion && (
                  <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                    <div className="rounded-xl border border-emerald-500/30 bg-[#060B17] p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-emerald-400">
                          My idea in English (puedes editarla):
                        </span>
                        <button
                          type="button"
                          onClick={() => speakEnglish(item.suggestedEnglish, { rate: 0.92 })}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-500/25 cursor-pointer"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>Escuchar</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={item.suggestedEnglish}
                        onChange={(e) => handleEnglishChange(item.id, e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-800 bg-[#0B1221] px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-[#0B1221] p-3">
                        <p className="font-semibold text-slate-400">My original idea:</p>
                        <p className="mt-1 text-slate-200">{item.userInput}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-[#0B1221] p-3">
                        <p className="font-semibold text-sky-400">Traducción:</p>
                        <p className="mt-1 text-slate-200">{item.spanishTranslation}</p>
                      </div>
                    </div>

                    {item.grammarNote && (
                      <p className="text-xs text-violet-300">
                        Nota del coach: {item.grammarNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Complete CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            {readyCount < 4
              ? `Convierte al menos 4 preguntas (${readyCount}/4 mínimo, recomendado 6/6) para continuar.`
              : '¡Excelente trabajo! Tus ideas están listas para construir tu guion.'}
          </p>

          <button
            type="button"
            disabled={readyCount < 4}
            onClick={onComplete}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isCompleted ? 'Guardar y continuar a Misión 4' : 'COMPLETE MISSION'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
