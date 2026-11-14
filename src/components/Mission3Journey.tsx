import { CheckCircle2, ArrowLeft, Volume2 } from 'lucide-react';
import { JOURNEY_OPTIONS_BY_QUESTION } from '../data/curriculum';
import type { JourneyQuestionAnswer, QuestionOption } from '../types';
import { playSuccessSound } from '../utils/sound';
import { speakEnglish } from '../utils/tts';

interface Mission3JourneyProps {
  answers: JourneyQuestionAnswer[];
  soundEnabled: boolean;
  isCompleted: boolean;
  onUpdateAnswers: (answers: JourneyQuestionAnswer[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function Mission3Journey({
  answers,
  soundEnabled,
  isCompleted,
  onUpdateAnswers,
  onComplete,
  onBack,
}: Mission3JourneyProps) {
  const readyCount = answers.filter((a) => a.suggestedEnglish.trim().length > 0).length;
  const progressPercent = Math.round((readyCount / answers.length) * 100);
  const allAnswered = readyCount === answers.length;

  const handleSelectOption = (questionId: number, option: QuestionOption) => {
    const next = answers.map((item) =>
      item.id === questionId
        ? {
            ...item,
            selectedOptionId: option.id,
            userInput: option.es,
            suggestedEnglish: option.en,
            spanishTranslation: option.es,
          }
        : item
    );
    onUpdateAnswers(next);
    playSuccessSound(soundEnabled);
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
              Elige una de las 5 respuestas predeterminadas en cada una de las 6 preguntas guía.
              Puedes escuchar la pronunciación en inglés y cambiar tu elección en cualquier momento.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="font-mono-num text-lg font-bold text-emerald-400">
              {readyCount}/6
            </span>
            <p className="text-xs text-slate-400">Preguntas respondidas</p>
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
            const options = JOURNEY_OPTIONS_BY_QUESTION[item.id] || [];
            const isQuestionAnswered = item.suggestedEnglish.trim().length > 0;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-[#111B30] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono-num text-xs font-semibold text-sky-400">
                      QUESTION 0{item.id}
                    </p>
                    <h2 className="font-display mt-1 text-base font-bold text-slate-100 sm:text-lg">
                      {item.questionEs}
                    </h2>
                    <p className="text-sm font-medium text-sky-300">{item.questionEn}</p>
                  </div>

                  {isQuestionAnswered && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Seleccionada</span>
                    </span>
                  )}
                </div>

                {/* Choose your answer header */}
                <div className="mt-4 border-t border-slate-800/80 pt-4">
                  <p className="text-sm font-bold text-slate-100">Choose your answer:</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Selecciona la respuesta que mejor describa tu situación.
                  </p>
                </div>

                {/* 5 Predetermined Option Cards */}
                <div className="mt-3 space-y-2.5">
                  {options.map((option) => {
                    const isSelected =
                      item.selectedOptionId === option.id ||
                      (!item.selectedOptionId && item.suggestedEnglish === option.en);

                    return (
                      <div
                        key={option.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() => handleSelectOption(item.id, option)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectOption(item.id, option);
                          }
                        }}
                        className={`group flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.18)]'
                            : 'border-slate-800 bg-[#0B1221] hover:border-sky-500/45 hover:bg-[#0E172A]'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono-num text-xs font-bold transition-colors ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-sky-300 group-hover:bg-slate-700'
                            }`}
                          >
                            {option.number}
                          </span>
                          <div>
                            <p
                              className={`text-sm font-semibold leading-snug ${
                                isSelected ? 'text-emerald-200' : 'text-slate-100'
                              }`}
                            >
                              {option.en}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">
                              {option.es}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakEnglish(option.en, { rate: 0.92 });
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300 transition-colors hover:bg-sky-500/25 cursor-pointer"
                            title="Escuchar pronunciación en inglés"
                            aria-label={`Escuchar opción ${option.number}`}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>

                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                                : 'border-slate-700 bg-transparent text-transparent'
                            }`}
                            aria-hidden="true"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Complete CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            {!allAnswered
              ? `Selecciona una respuesta en cada una de las 6 preguntas (${readyCount}/6) para continuar.`
              : '¡Excelente! Tus 6 respuestas han sido guardadas para construir tu guion en la Misión 5.'}
          </p>

          <button
            type="button"
            disabled={!allAnswered}
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
