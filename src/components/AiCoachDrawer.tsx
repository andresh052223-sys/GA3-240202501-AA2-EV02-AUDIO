import { useState } from 'react';
import { Bot, Loader2, Send, Volume2, X } from 'lucide-react';
import type { CoachMessage, LearnerProfile } from '../types';
import { speakEnglish } from '../utils/tts';

interface AiCoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentMissionLabel: string;
  profile: LearnerProfile;
  messages: CoachMessage[];
  onAddMessages: (userMsg: CoachMessage, assistantMsg: CoachMessage) => void;
}

const QUICK_PROMPTS = [
  '¿Cómo traduzco una idea al inglés?',
  'Explícame los 3 condicionales con ejemplos',
  'Vocabulario útil para mi programa de formación',
  '¿Cómo simplifico una frase difícil para pronunciarla?',
  'Consejos para grabar mi audio de 2 a 5 minutos',
];

export function AiCoachDrawer({
  isOpen,
  onClose,
  currentMissionLabel,
  profile,
  messages,
  onAddMessages,
}: AiCoachDrawerProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setError('');
    setInput('');
    setIsLoading(true);

    const userMsg: CoachMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          currentMission: currentMissionLabel,
          trainingProgram: profile.trainingProgram,
          learnerName: profile.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al consultar al AI English Coach.');

      const assistantMsg: CoachMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.replyEs || 'Aquí tienes una guía para ayudarte con tu misión.',
        englishExamples: Array.isArray(data.englishExamples) ? data.englishExamples : [],
        timestamp: Date.now(),
      };
      onAddMessages(userMsg, assistantMsg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con el coach.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-[#0B1221] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-300">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-50">AI ENGLISH COACH</h2>
              <p className="text-xs text-slate-400">Tutor bilingüe · {currentMissionLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
            aria-label="Cerrar AI English Coach"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#111B30] p-4 text-xs leading-relaxed text-slate-300">
              <p className="font-semibold text-violet-300">
                ¡Hola{profile.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}! Soy tu AI
                English Coach.
              </p>
              <p className="mt-1.5">
                Puedo traducir tus ideas del español al inglés, corregir frases, explicarte los
                condicionales o sugerir vocabulario para tu programa de formación.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-lg border border-slate-700 bg-[#060B17] px-3 py-1.5 text-left text-xs text-sky-300 transition-colors hover:border-violet-400 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'ml-8 border border-sky-500/30 bg-sky-500/10 text-slate-100'
                  : 'mr-4 border border-slate-800 bg-[#111B30] text-slate-200'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {msg.englishExamples && msg.englishExamples.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-emerald-400">Ejemplos en inglés:</p>
                  {msg.englishExamples.map((example, idx) => (
                    <div
                      key={`${msg.id}-ex-${idx}`}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#060B17] px-3 py-2 text-xs text-slate-100"
                    >
                      <span>{example}</span>
                      <button
                        type="button"
                        onClick={() => speakEnglish(example, { rate: 0.92 })}
                        className="shrink-0 rounded-md bg-sky-500/15 p-1.5 text-sky-300 hover:bg-sky-500/25 cursor-pointer"
                        title="Escuchar pronunciación"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-violet-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI English Coach está preparando tu respuesta...</span>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="border-t border-slate-800 p-4"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu duda en español o inglés..."
              className="flex-1 rounded-xl border border-slate-700 bg-[#060B17] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-violet-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 cursor-pointer"
              aria-label="Enviar consulta"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
