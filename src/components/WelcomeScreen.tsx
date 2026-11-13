import { useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Clock, Headphones, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import type { MissionProgress } from '../types';

interface WelcomeScreenProps {
  progress: MissionProgress;
  isRegistered: boolean;
  learnerName: string;
  onStartMission: () => void;
  onGoToMap: () => void;
}

export function WelcomeScreen({
  progress,
  isRegistered,
  learnerName,
  onStartMission,
  onGoToMap,
}: WelcomeScreenProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const completedCount = progress.completedMissions.length;
  const percent = Math.round((completedCount / 6) * 100);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Main 2-column hero split */}
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left: Mission Title & Central Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col justify-between lg:col-span-7"
        >
          <div>
            <p className="text-sm font-medium tracking-wide text-emerald-400">
              SENA · Evidencia Interactiva en Inglés
            </p>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl [text-wrap:balance]">
              ENGLISH AUDIO MISSION
            </h1>
            <p className="mt-2 text-lg font-medium text-sky-300">
              Your voice. Your future. Your mission.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
              Complete your English audio challenge by following each mission and creating your own
              professional audio presentation.
            </p>
          </div>

          {/* Central Mission Card */}
          <div className="mt-8 rounded-2xl border border-sky-500/25 bg-[#0B1221] p-6 shadow-lg shadow-sky-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <p className="font-mono-num text-xs font-semibold tracking-wider text-sky-400">
                  MISSION: GA3-240202501-AA2-EV02
                </p>
                <h2 className="font-display mt-1 text-xl font-bold text-slate-100">
                  AUDIO PRESENTATION
                </h2>
              </div>
              <div className="text-right">
                <span className="font-mono-num text-sm font-semibold text-emerald-400">
                  {progress.xp} XP
                </span>
                <p className="text-xs text-slate-400">Progreso actual</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-[#111B30] px-4 py-3">
                <Award className="h-5 w-5 shrink-0 text-violet-400" />
                <div>
                  <p className="text-xs text-slate-400">Dificultad</p>
                  <p className="text-sm font-semibold text-slate-100">Intermediate Challenge</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-[#111B30] px-4 py-3">
                <Clock className="h-5 w-5 shrink-0 text-sky-400" />
                <div>
                  <p className="text-xs text-slate-400">Duración requerida</p>
                  <p className="font-mono-num text-sm font-semibold text-slate-100">2–5 minutes</p>
                </div>
              </div>
            </div>

            {/* General Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">
                  Progreso general de la misión
                  {isRegistered && learnerName ? ` · ${learnerName}` : ''}
                </span>
                <span className="font-mono-num font-semibold text-emerald-400">
                  {completedCount}/6 misiones ({percent}%)
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${Math.max(percent, 4)}%` }}
                />
              </div>
            </div>

            {/* Primary CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStartMission}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 whitespace-nowrap cursor-pointer"
              >
                <span>{isRegistered ? 'CONTINUAR MISIONES' : 'START MISSION'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              {isRegistered && (
                <button
                  type="button"
                  onClick={onGoToMap}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-sky-500/50 hover:text-white whitespace-nowrap cursor-pointer"
                >
                  Ver Mapa de Misiones
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right: Studio Visual Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1221] lg:col-span-5"
        >
          <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-[#0C192C] to-slate-950 lg:h-full lg:min-h-[340px]">
            {!imgFailed ? (
              <img
                src="/src/assets/images/hero_audio_studio_1794605793464.jpg"
                alt="Estudio de grabación de audio profesional con micrófono condensador"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <Mic className="h-14 w-14 text-emerald-400" />
                <p className="mt-3 font-display text-lg font-semibold text-slate-200">
                  Audio Presentation Studio
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-[#0B1221]/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-xs font-medium text-emerald-300">
                Ruta guiada en 6 niveles
              </p>
              <p className="mt-1 text-sm font-medium text-slate-200">
                Desde tu presentación personal hasta tu grabación MP3 lista para entregar.
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800/80 p-5 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>Generación y mejora de guion en inglés sin inventar datos tuyos.</span>
            </div>
            <div className="flex items-start gap-3">
              <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <span>Práctica de pronunciación con voz en inglés y estudio de grabación MP3.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
