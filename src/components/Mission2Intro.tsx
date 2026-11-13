import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, Square, Volume2 } from 'lucide-react';
import type { IntroFields } from '../types';
import { isTtsSupported, speakEnglish, stopSpeech } from '../utils/tts';

interface Mission2IntroProps {
  introFields: IntroFields;
  customIntroduction: string;
  isCompleted: boolean;
  onUpdateIntro: (fields: IntroFields, customText: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function buildDefaultIntroText(fields: IntroFields): string {
  const name = fields.fullName.trim() || 'your name';
  const id = fields.idNumber.trim() || 'your ID number';
  const group = fields.trainingGroup.trim() || 'your training group';
  const instructor = fields.instructorName.trim() || 'your instructor';
  const activity = fields.activityName.trim() || 'GA3-240202501-AA2-EV02';

  return `Hello! My name is ${name}. My identification number is ${id}. My training group is ${group}. My instructor is ${instructor}. Today, I am presenting my audio evidence ${activity}.`;
}

export function Mission2Intro({
  introFields,
  customIntroduction,
  isCompleted,
  onUpdateIntro,
  onComplete,
  onBack,
}: Mission2IntroProps) {
  const [fields, setFields] = useState<IntroFields>(introFields);
  const [introText, setIntroText] = useState<string>(
    customIntroduction.trim() ? customIntroduction : buildDefaultIntroText(introFields)
  );
  const [hasManuallyEdited, setHasManuallyEdited] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.92);
  const [ttsError, setTtsError] = useState('');

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleFieldChange = (key: keyof IntroFields, value: string) => {
    const nextFields = { ...fields, [key]: value };
    setFields(nextFields);
    const nextText = hasManuallyEdited ? introText : buildDefaultIntroText(nextFields);
    if (!hasManuallyEdited) {
      setIntroText(nextText);
    }
    onUpdateIntro(nextFields, nextText);
  };

  const handleTextChange = (value: string) => {
    setHasManuallyEdited(true);
    setIntroText(value);
    onUpdateIntro(fields, value);
  };

  const handleResetTemplate = () => {
    setHasManuallyEdited(false);
    const generated = buildDefaultIntroText(fields);
    setIntroText(generated);
    onUpdateIntro(fields, generated);
  };

  const handleListen = () => {
    setTtsError('');
    speakEnglish(introText, {
      rate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (msg) => {
        setIsSpeaking(false);
        setTtsError(msg);
      },
    });
  };

  const handleStop = () => {
    stopSpeech();
    setIsSpeaking(false);
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
        <div className="border-b border-slate-800 pb-5">
          <p className="font-mono-num text-xs font-semibold text-sky-400">
            MISSION 2 · +150 XP · Insignia ENGLISH EXPLORER
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
            BUILD YOUR INTRODUCTION
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Completa o ajusta tus datos para construir tu presentación personal en inglés. Luego
            escúchala y practica su pronunciación antes de avanzar.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Structured Sentence Builder Fields */}
          <div className="space-y-4 lg:col-span-6">
            <h2 className="font-display text-base font-bold text-slate-100">
              Constructor de presentación personal
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                My full name is...
              </label>
              <input
                type="text"
                value={fields.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2.5 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                My identification number is...
              </label>
              <input
                type="text"
                value={fields.idNumber}
                onChange={(e) => handleFieldChange('idNumber', e.target.value)}
                className="font-mono-num mt-1 w-full rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2.5 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                My training group is...
              </label>
              <input
                type="text"
                value={fields.trainingGroup}
                onChange={(e) => handleFieldChange('trainingGroup', e.target.value)}
                className="font-mono-num mt-1 w-full rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2.5 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                My instructor is...
              </label>
              <input
                type="text"
                value={fields.instructorName}
                onChange={(e) => handleFieldChange('instructorName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2.5 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                The name of my activity is...
              </label>
              <input
                type="text"
                value={fields.activityName}
                onChange={(e) => handleFieldChange('activityName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2.5 text-sm text-sky-300 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Right: Editable English Result + TTS Practice */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#111B30] p-5 lg:col-span-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-emerald-300">
                  Tu presentación en inglés (editable)
                </h2>
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restaurar plantilla</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={introText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-700 bg-[#060B17] p-4 text-sm leading-relaxed text-slate-100 focus:border-sky-400 focus:outline-none"
              />

              <p className="mt-2 text-xs text-slate-400">
                Puedes añadir un saludo adicional o mencionar tu programa si deseas personalizarla aún
                más.
              </p>
            </div>

            {/* TTS Pronunciation Studio */}
            <div className="mt-5 border-t border-slate-800 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-300">
                  Practicar pronunciación (Text-to-Speech)
                </span>
                <div className="flex items-center gap-1 rounded-lg bg-[#060B17] p-1">
                  <button
                    type="button"
                    onClick={() => setSpeechRate(0.8)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      speechRate === 0.8
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    0.8x Lento
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeechRate(0.95)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      speechRate === 0.95
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1.0x Normal
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {!isSpeaking ? (
                  <button
                    type="button"
                    disabled={!isTtsSupported() || !introText.trim()}
                    onClick={handleListen}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-sky-400 disabled:opacity-50 cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Escuchar en inglés</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-400 cursor-pointer"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                    <span>Detener voz</span>
                  </button>
                )}

                {isSpeaking && (
                  <span className="text-xs font-medium text-sky-300">
                    Reproduciendo pronunciación en inglés...
                  </span>
                )}
              </div>

              {ttsError && <p className="mt-2 text-xs text-rose-400">{ttsError}</p>}
            </div>
          </div>
        </div>

        {/* Complete Mission Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            Tu presentación quedará guardada automáticamente para la Misión 5 (Guion Final).
          </p>
          <button
            type="button"
            disabled={!introText.trim()}
            onClick={() => {
              onUpdateIntro(fields, introText);
              onComplete();
            }}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isCompleted ? 'Guardar cambios y continuar' : 'COMPLETE MISSION'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
