import {
  Award,
  CheckCircle2,
  ChevronRight,
  Lock,
  Play,
  Trophy,
  UserCog,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BADGES, MISSIONS } from '../data/curriculum';
import type { LearnerProfile, MissionNumber, MissionProgress, ScreenView } from '../types';

interface MissionMapProps {
  profile: LearnerProfile;
  progress: MissionProgress;
  onSelectMission: (mission: MissionNumber) => void;
  onOpenFinalDelivery: () => void;
  onEditProfile: () => void;
  onToggleSound: () => void;
  onNavigate: (screen: ScreenView) => void;
}

export function MissionMap({
  profile,
  progress,
  onSelectMission,
  onOpenFinalDelivery,
  onEditProfile,
  onToggleSound,
}: MissionMapProps) {
  const completedCount = progress.completedMissions.length;
  const percent = Math.round((completedCount / 6) * 100);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Learner HUD */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0B1221] p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold tracking-wider text-emerald-400">
            YOUR LEARNING JOURNEY
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
            Mapa de Misiones
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Aprendiz: <span className="font-medium text-slate-200">{profile.fullName}</span> · Ficha{' '}
            <span className="font-mono-num text-sky-300">{profile.trainingGroup}</span> ·{' '}
            <span className="font-mono-num text-emerald-400">{progress.xp} XP</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggleSound}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-700 bg-[#111B30] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-sky-500/40 cursor-pointer"
            title={progress.soundEnabled ? 'Silenciar efectos' : 'Activar efectos de sonido'}
          >
            {progress.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-400" />
            )}
            <span>{progress.soundEnabled ? 'Sonido activo' : 'Sonido apagado'}</span>
          </button>

          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-700 bg-[#111B30] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-sky-500/40 cursor-pointer"
          >
            <UserCog className="h-4 w-4 text-sky-400" />
            <span>Editar datos</span>
          </button>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-6 rounded-xl border border-slate-800/80 bg-[#0B1221] px-5 py-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-300">Avance de la evidencia</span>
          <span className="font-mono-num font-semibold text-emerald-400">
            {completedCount} de 6 misiones completadas · {percent}%
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 transition-all duration-500"
            style={{ width: `${Math.max(percent, 3)}%` }}
          />
        </div>
      </div>

      {/* Interactive 6-Mission Path + Badges Column */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: 6 Mission Nodes */}
        <div className="space-y-4 lg:col-span-8">
          {MISSIONS.map((mission, idx) => {
            const isCompleted = progress.completedMissions.includes(mission.number);
            const isUnlocked = mission.number <= progress.unlockedUpTo || isCompleted;
            const isCurrent = isUnlocked && !isCompleted;

            return (
              <motion.div
                key={mission.number}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className={`rounded-2xl border p-5 transition-all ${
                  isCompleted
                    ? 'border-emerald-500/35 bg-[#0B1221]'
                    : isCurrent
                      ? 'border-sky-400/50 bg-[#0D172B] shadow-md shadow-sky-950/30'
                      : 'border-slate-800/80 bg-[#080E1C] opacity-75'
                }`}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono-num text-base font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCurrent
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : isUnlocked ? (
                        <span>0{mission.number}</span>
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono-num font-semibold text-sky-400">
                          {mission.code}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span className="font-mono-num text-amber-400">+{mission.xpReward} XP</span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span
                          className={
                            isCompleted
                              ? 'text-emerald-400'
                              : isCurrent
                                ? 'text-sky-300'
                                : 'text-slate-500'
                          }
                        >
                          {isCompleted ? 'Completada' : isCurrent ? 'Disponible ahora' : 'Bloqueada'}
                        </span>
                      </div>

                      <h2 className="font-display mt-1 text-lg font-bold text-slate-100">
                        {mission.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">{mission.subtitleEs}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => onSelectMission(mission.number)}
                        className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          isCompleted
                            ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <span>Repasar</span>
                            <ChevronRight className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Iniciar Misión</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Completa Misión {mission.number - 1}</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Final Delivery Node */}
          <div
            className={`rounded-2xl border p-5 transition-all ${
              progress.finalDeliveryUnlocked
                ? 'border-amber-400/50 bg-[#0E182B]'
                : 'border-slate-800/80 bg-[#080E1C] opacity-75'
            }`}
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    progress.finalDeliveryUnlocked
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-mono-num text-xs font-semibold text-amber-400">
                    FINAL DELIVERY · VERIFICACIÓN
                  </p>
                  <h2 className="font-display mt-1 text-lg font-bold text-slate-100">
                    CHECK YOUR EVIDENCE
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Lista de verificación final, descarga de guion/audio y desbloqueo de la insignia
                    GOLD AUDIO MASTER.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!progress.finalDeliveryUnlocked}
                onClick={onOpenFinalDelivery}
                className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap ${
                  progress.finalDeliveryUnlocked
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer'
                    : 'border border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                {progress.finalDeliveryUnlocked ? 'Verificar Entrega' : 'Completa las 6 misiones'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Badges & Achievements */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0B1221] p-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Award className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-bold text-slate-100">
                Insignias y Logros
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              {Object.values(BADGES).map((badge) => {
                const earned = progress.badges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-xl border p-3.5 transition-colors ${
                      earned
                        ? 'border-emerald-500/35 bg-[#111B30]'
                        : 'border-slate-800/70 bg-[#060B17]/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`font-display text-sm font-bold ${
                          earned
                            ? badge.id === 'gold-audio-master'
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {badge.title}
                      </p>
                      <span className="font-mono-num text-xs text-slate-400">
                        {earned ? 'Desbloqueada' : `+${badge.xpBonus} XP`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {badge.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
