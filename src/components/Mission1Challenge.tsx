import { ArrowLeft, CheckCircle2, FileText, Headphones, Layers, Mic } from 'lucide-react';

interface Mission1ChallengeProps {
  isCompleted: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const TOPICS_REQUIRED = [
  {
    en: 'Academic and professional background',
    es: 'Qué estudias actualmente, por qué elegiste tu programa y qué habilidades has adquirido.',
  },
  {
    en: 'Personal and professional plans',
    es: 'Tus metas académicas, laborales y dónde te gustaría trabajar en el futuro.',
  },
  {
    en: 'Actions and decisions',
    es: 'Qué decisiones tomas hoy para mejorar y qué harás si mejoras tu perfil profesional.',
  },
  {
    en: 'Possible problems and solutions',
    es: 'Dificultades reales que has encontrado en tu formación y cómo las solucionas.',
  },
  {
    en: 'Leadership and professional responsibility',
    es: 'Cómo asumes tus responsabilidades, apoyas a tu equipo y tomas decisiones éticas.',
  },
  {
    en: 'Flexibility and adaptability',
    es: 'Tu disposición para aprender nuevas habilidades y adaptarte a distintos retos.',
  },
];

const DELIVERY_RULES = [
  'Audio de 2 a 5 minutos de duración.',
  'Formato MP3 o enlace público de reproducción (por ejemplo, Spreaker o Podbean).',
  'Guion escrito en Word (DOCX) o PDF.',
  'Todo el audio debe estar hablado en inglés.',
  'Debe iniciar con una presentación personal (nombre, ID, ficha, instructor y actividad).',
  'Debe incluir planes, acciones, decisiones, soluciones, liderazgo y adaptabilidad.',
];

export function Mission1Challenge({
  isCompleted,
  onComplete,
  onBack,
}: Mission1ChallengeProps) {
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
            MISSION 1 · +100 XP · Insignia FIRST STEP
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
            UNDERSTAND THE CHALLENGE
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Antes de escribir o grabar, necesitas tener claro qué solicita exactamente la evidencia{' '}
            <span className="font-semibold text-sky-300">GA3-240202501-AA2-EV02 – AUDIO</span>.
            Aquí tienes el mapa exacto en español sencillo.
          </p>
        </div>

        {/* 6 Required Topics */}
        <div className="mt-6">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-emerald-400" />
            <h2 className="font-display text-lg font-bold text-slate-100">
              1. ¿Sobre qué debes hablar en tu audio en inglés?
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TOPICS_REQUIRED.map((topic, idx) => (
              <div
                key={topic.en}
                className="rounded-xl border border-slate-800 bg-[#111B30] p-4"
              >
                <p className="font-mono-num text-xs font-semibold text-sky-400">
                  Tema 0{idx + 1}
                </p>
                <h3 className="mt-1 font-display text-base font-bold text-slate-100">
                  {topic.en}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{topic.es}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="mt-8">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-sky-400" />
            <h2 className="font-display text-lg font-bold text-slate-100">
              2. Requisitos obligatorios de entrega
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DELIVERY_RULES.map((rule) => (
              <div
                key={rule}
                className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-[#060B17]/70 px-4 py-3 text-sm text-slate-200"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Section: FINAL DELIVERY */}
        <div className="mt-8 rounded-2xl border border-violet-500/30 bg-[#10182C] p-5 sm:p-6">
          <p className="font-mono-num text-xs font-semibold tracking-wider text-violet-300">
            FINAL DELIVERY
          </p>
          <h2 className="font-display mt-1 text-xl font-bold text-slate-50">
            Productos que entregarás al finalizar las misiones
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Esta aplicación te guiará para construir ambos archivos paso a paso:
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-xl border border-slate-700/80 bg-[#0B1221] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-100">
                  1. Guion escrito (Word o PDF)
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Incluye tu portada con datos del aprendiz, Parte 1 (Presentación personal) y Parte
                  2 (Reflexión académica y profesional).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-slate-700/80 bg-[#0B1221] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-100">
                  2. Audio en inglés (MP3 o Enlace)
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Grabación de 2 a 5 minutos descargada en MP3 o publicada en Spreaker/Podbean con
                  enlace público.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Mission CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Headphones className="h-4 w-4 text-sky-400" />
            <span>Al completar esta misión desbloquearás la Misión 2: Build Your Introduction.</span>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isCompleted ? 'Misión Completada · Ir a Misión 2' : 'COMPLETE MISSION'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
