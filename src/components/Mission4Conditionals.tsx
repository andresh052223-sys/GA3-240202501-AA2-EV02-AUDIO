import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  CONDITIONAL_STATIONS,
  LEADERSHIP_EXPRESSIONS,
  STATION_D_MATCHING,
} from '../data/curriculum';
import type { StationCompletion } from '../types';
import { playErrorSound, playSuccessSound } from '../utils/sound';
import { speakEnglish } from '../utils/tts';

interface Mission4ConditionalsProps {
  stationProgress: StationCompletion;
  soundEnabled: boolean;
  isCompleted: boolean;
  onUpdateStations: (next: StationCompletion) => void;
  onComplete: () => void;
  onBack: () => void;
}

type StationTab = 'stationA' | 'stationB' | 'stationC' | 'stationD';

export function Mission4Conditionals({
  stationProgress,
  soundEnabled,
  isCompleted,
  onUpdateStations,
  onComplete,
  onBack,
}: Mission4ConditionalsProps) {
  const [activeTab, setActiveTab] = useState<StationTab>('stationA');
  const [choiceAnswers, setChoiceAnswers] = useState<Record<string, number>>({});
  const [fillInputs, setFillInputs] = useState<Record<string, string>>({});
  const [fillChecked, setFillChecked] = useState<Record<string, boolean>>({});

  // Station D matching state
  const [selectedEnglishId, setSelectedEnglishId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchingFeedback, setMatchingFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const shuffledSpanishOptions = useMemo(() => {
    return [
      STATION_D_MATCHING[2],
      STATION_D_MATCHING[0],
      STATION_D_MATCHING[3],
      STATION_D_MATCHING[1],
    ];
  }, []);

  const allStationsDone =
    stationProgress.stationA &&
    stationProgress.stationB &&
    stationProgress.stationC &&
    stationProgress.stationD;

  const activeConditional = CONDITIONAL_STATIONS.find((s) => s.id === activeTab);

  const checkConditionalStationCompletion = (
    stationId: 'stationA' | 'stationB' | 'stationC',
    nextChoices: Record<string, number>,
    nextFillChecked: Record<string, boolean>
  ) => {
    const station = CONDITIONAL_STATIONS.find((s) => s.id === stationId);
    if (!station) return;

    const allSolved = station.exercises.every((ex) => {
      if (ex.type === 'choice') {
        return nextChoices[ex.id] === ex.correctIndex;
      }
      return nextFillChecked[ex.id] === true;
    });

    if (allSolved && !stationProgress[stationId]) {
      onUpdateStations({ ...stationProgress, [stationId]: true });
    }
  };

  const handleSelectChoice = (
    stationId: 'stationA' | 'stationB' | 'stationC',
    exId: string,
    optionIdx: number,
    correctIndex: number
  ) => {
    const nextChoices = { ...choiceAnswers, [exId]: optionIdx };
    setChoiceAnswers(nextChoices);
    if (optionIdx === correctIndex) {
      playSuccessSound(soundEnabled);
    } else {
      playErrorSound(soundEnabled);
    }
    checkConditionalStationCompletion(stationId, nextChoices, fillChecked);
  };

  const handleCheckFill = (
    stationId: 'stationA' | 'stationB' | 'stationC',
    exId: string,
    accepted: string[]
  ) => {
    const val = (fillInputs[exId] || '').trim().toLowerCase();
    const isOk = accepted.map((a) => a.toLowerCase()).includes(val);
    const nextFill = { ...fillChecked, [exId]: isOk };
    setFillChecked(nextFill);
    if (isOk) {
      playSuccessSound(soundEnabled);
    } else {
      playErrorSound(soundEnabled);
    }
    checkConditionalStationCompletion(stationId, choiceAnswers, nextFill);
  };

  const handleMatchSpanish = (spanishItemId: string) => {
    if (!selectedEnglishId) {
      setMatchingFeedback({
        ok: false,
        message: 'Primero selecciona una expresión en inglés de la columna izquierda.',
      });
      return;
    }

    if (selectedEnglishId === spanishItemId) {
      const nextMatched = matchedIds.includes(spanishItemId)
        ? matchedIds
        : [...matchedIds, spanishItemId];
      setMatchedIds(nextMatched);
      setSelectedEnglishId(null);
      setMatchingFeedback({
        ok: true,
        message: '¡Correcto! Relacionaste la expresión con su significado profesional.',
      });
      playSuccessSound(soundEnabled);

      if (nextMatched.length === STATION_D_MATCHING.length && !stationProgress.stationD) {
        onUpdateStations({ ...stationProgress, stationD: true });
      }
    } else {
      setMatchingFeedback({
        ok: false,
        message: 'Ese significado no corresponde a la frase seleccionada. Intenta de nuevo.',
      });
      playErrorSound(soundEnabled);
    }
  };

  const stationTabs: Array<{ id: StationTab; label: string; done: boolean }> = [
    { id: 'stationA', label: 'Station A · Zero', done: stationProgress.stationA },
    { id: 'stationB', label: 'Station B · First', done: stationProgress.stationB },
    { id: 'stationC', label: 'Station C · Second', done: stationProgress.stationC },
    { id: 'stationD', label: 'Station D · Leadership', done: stationProgress.stationD },
  ];

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
        <div className="border-b border-slate-800 pb-5">
          <p className="font-mono-num text-xs font-semibold text-sky-400">
            MISSION 4 · +250 XP · Insignia DECISION MAKER
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
            MAKE DECISIONS LIKE A PROFESSIONAL
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Supera las 4 estaciones para dominar los condicionales y el vocabulario de liderazgo,
            responsabilidad y adaptabilidad exigido en la evidencia.
          </p>
        </div>

        {/* Interactive Station Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 rounded-xl bg-[#060B17] p-1.5">
          {stationTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-sky-500 text-slate-950'
                    : tab.done
                      ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {tab.done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stations A, B, C Content */}
        {activeConditional && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-sky-500/25 bg-[#111B30] p-5">
              <p className="font-mono-num text-xs font-semibold text-sky-400">
                {activeConditional.title}
              </p>
              <h2 className="font-display mt-1 text-lg font-bold text-slate-50">
                {activeConditional.subtitleEs}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {activeConditional.usageEs}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-[#060B17] p-4">
                  <p className="text-xs font-semibold text-violet-300">Estructura</p>
                  <p className="font-mono-num mt-1.5 text-sm font-bold text-slate-100">
                    {activeConditional.formula}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#060B17] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-emerald-400">Ejemplo modelo</p>
                    <button
                      type="button"
                      onClick={() => speakEnglish(activeConditional.exampleEn, { rate: 0.92 })}
                      className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-2 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Escuchar</span>
                    </button>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-slate-100">
                    {activeConditional.exampleEn}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{activeConditional.exampleEs}</p>
                </div>
              </div>
            </div>

            {/* Interactive Exercises */}
            <div className="space-y-4">
              {activeConditional.exercises.map((ex, idx) => {
                if (ex.type === 'choice') {
                  const selected = choiceAnswers[ex.id];
                  const answered = selected !== undefined;
                  const isCorrect = selected === ex.correctIndex;

                  return (
                    <div
                      key={ex.id}
                      className="rounded-2xl border border-slate-800 bg-[#111B30] p-5"
                    >
                      <p className="text-xs font-semibold text-sky-400">
                        Práctica {idx + 1} · Selección múltiple
                      </p>
                      <p className="mt-1 text-sm text-slate-200">{ex.promptEs}</p>
                      <p className="mt-3 rounded-xl bg-[#060B17] px-4 py-3 font-medium text-slate-100">
                        {ex.sentence}
                      </p>

                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {ex.options.map((opt, optIdx) => {
                          const isThisSelected = selected === optIdx;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                handleSelectChoice(
                                  activeConditional.id,
                                  ex.id,
                                  optIdx,
                                  ex.correctIndex
                                )
                              }
                              className={`min-h-[42px] rounded-xl border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                                isThisSelected
                                  ? optIdx === ex.correctIndex
                                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                                    : 'border-rose-400 bg-rose-500/20 text-rose-200'
                                  : 'border-slate-700 bg-[#060B17] text-slate-200 hover:border-sky-400/50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          className={`mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-xs ${
                            isCorrect
                              ? 'bg-emerald-950/60 text-emerald-200'
                              : 'bg-rose-950/60 text-rose-200'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                          )}
                          <span>
                            {isCorrect ? ex.feedbackCorrectEs : ex.feedbackWrongEs}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                // Fill-in-the-blank exercise
                const isFillOk = fillChecked[ex.id];
                const hasChecked = ex.id in fillChecked;

                return (
                  <div
                    key={ex.id}
                    className="rounded-2xl border border-slate-800 bg-[#111B30] p-5"
                  >
                    <p className="text-xs font-semibold text-sky-400">
                      Práctica {idx + 1} · Completar oración
                    </p>
                    <p className="mt-1 text-sm text-slate-200">{ex.promptEs}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[#060B17] p-4 text-sm text-slate-100">
                      <span>{ex.beforeBlank}</span>
                      <input
                        type="text"
                        value={fillInputs[ex.id] || ''}
                        onChange={(e) =>
                          setFillInputs((prev) => ({ ...prev, [ex.id]: e.target.value }))
                        }
                        placeholder="escribe aquí..."
                        className="w-32 rounded-lg border border-sky-500/50 bg-[#0B1221] px-3 py-1.5 text-center font-semibold text-sky-300 focus:border-emerald-400 focus:outline-none"
                      />
                      <span>{ex.afterBlank}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <HelpCircle className="h-3.5 w-3.5 text-violet-400" />
                        <span>{ex.hintEs}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCheckFill(activeConditional.id, ex.id, ex.acceptedAnswers)
                        }
                        className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 cursor-pointer"
                      >
                        Comprobar respuesta
                      </button>
                    </div>

                    {hasChecked && (
                      <div
                        className={`mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-xs ${
                          isFillOk
                            ? 'bg-emerald-950/60 text-emerald-200'
                            : 'bg-rose-950/60 text-rose-200'
                        }`}
                      >
                        {isFillOk ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        )}
                        <span>
                          {isFillOk ? ex.feedbackCorrectEs : ex.feedbackWrongEs}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Station D Content: Leadership, Responsibility & Adaptability */}
        {activeTab === 'stationD' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-violet-500/25 bg-[#111B30] p-5">
              <p className="font-mono-num text-xs font-semibold text-violet-300">
                STATION D – LEADERSHIP, RESPONSIBILITY AND ADAPTABILITY
              </p>
              <h2 className="font-display mt-1 text-lg font-bold text-slate-50">
                Expresiones clave para tu audio profesional
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Escucha cada expresión y úsala como referencia para hablar de tu liderazgo y
                capacidad de adaptación.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {LEADERSHIP_EXPRESSIONS.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#060B17] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{exp.english}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{exp.spanish}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakEnglish(exp.english, { rate: 0.92 })}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 cursor-pointer"
                      title="Escuchar pronunciación"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Matching Exercise */}
            <div className="rounded-2xl border border-slate-800 bg-[#111B30] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-sky-400">
                    Práctica interactiva · Relacionar expresiones con su significado
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    1) Selecciona una frase en inglés. 2) Haz clic en su significado equivalente en
                    español.
                  </p>
                </div>
                <span className="font-mono-num text-xs font-bold text-emerald-400">
                  {matchedIds.length}/{STATION_D_MATCHING.length} emparejadas
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2.5">
                  {STATION_D_MATCHING.map((pair) => {
                    const matched = matchedIds.includes(pair.id);
                    const selected = selectedEnglishId === pair.id;
                    return (
                      <button
                        key={pair.id}
                        type="button"
                        disabled={matched}
                        onClick={() => setSelectedEnglishId(pair.id)}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                          matched
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 cursor-default'
                            : selected
                              ? 'border-sky-400 bg-sky-500/20 text-sky-100 cursor-pointer'
                              : 'border-slate-700 bg-[#060B17] text-slate-200 hover:border-sky-500/50 cursor-pointer'
                        }`}
                      >
                        {pair.english}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2.5">
                  {shuffledSpanishOptions.map((pair) => {
                    const matched = matchedIds.includes(pair.id);
                    return (
                      <button
                        key={pair.id}
                        type="button"
                        disabled={matched}
                        onClick={() => handleMatchSpanish(pair.id)}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                          matched
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 cursor-default'
                            : 'border-slate-700 bg-[#060B17] text-slate-300 hover:border-violet-400/60 hover:text-white cursor-pointer'
                        }`}
                      >
                        {pair.spanish}
                      </button>
                    );
                  })}
                </div>
              </div>

              {matchingFeedback && (
                <p
                  className={`mt-3 rounded-xl px-4 py-2.5 text-xs ${
                    matchingFeedback.ok
                      ? 'bg-emerald-950/60 text-emerald-200'
                      : 'bg-rose-950/60 text-rose-200'
                  }`}
                >
                  {matchingFeedback.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <div className="text-xs text-slate-400">
            Estaciones completadas:{' '}
            <span className="font-mono-num font-semibold text-emerald-400">
              {Object.values(stationProgress).filter(Boolean).length}/4
            </span>
            {!allStationsDone && ' · Completa las 4 estaciones para desbloquear la Misión 5.'}
          </div>

          <button
            type="button"
            disabled={!allStationsDone}
            onClick={onComplete}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isCompleted ? 'Continuar a Misión 5' : 'COMPLETE MISSION'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
