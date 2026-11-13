import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import type {
  ChecklistKey,
  EvidenceChecklist,
  LearnerProfile,
  MissionNumber,
  RecordingMetadata,
  ScriptState,
} from '../types';
import { loadRecordingBlob } from '../utils/audioStorage';
import { downloadBlob, exportScriptToDocx, exportScriptToPdf } from '../utils/exportDocs';
import { convertAudioBlobToMp3 } from '../utils/mp3Converter';
import { playVictoryFanfare } from '../utils/sound';
import { formatSeconds } from './Mission6Studio';

interface FinalDeliveryProps {
  profile: LearnerProfile;
  script: ScriptState;
  recordingMeta: RecordingMetadata | null;
  checklist: EvidenceChecklist;
  soundEnabled: boolean;
  hasGoldBadge: boolean;
  onToggleItem: (key: ChecklistKey) => void;
  onUnlockGoldMaster: () => void;
  onGoToMission: (mission: MissionNumber) => void;
  onBack: () => void;
}

interface ChecklistItemConfig {
  key: ChecklistKey;
  labelEn: string;
  helpEs: string;
  missionTarget: MissionNumber;
}

const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  {
    key: 'introIncluded',
    labelEn: 'My personal introduction is included.',
    helpEs: 'Incluye tu nombre, ID, ficha, instructor y evidencia en la Parte 1 (Misión 2 / 5).',
    missionTarget: 2,
  },
  {
    key: 'journeyTalked',
    labelEn: 'I talked about my academic and professional journey.',
    helpEs: 'Menciona qué estudias, por qué elegiste el programa y qué has aprendido (Misión 3 / 5).',
    missionTarget: 3,
  },
  {
    key: 'futurePlansExplained',
    labelEn: 'I explained my future plans.',
    helpEs: 'Describe tus metas académicas, profesionales y dónde te gustaría trabajar (Misión 3 / 5).',
    missionTarget: 3,
  },
  {
    key: 'decisionsAndSolutions',
    labelEn: 'I included decisions and possible solutions.',
    helpEs: 'Explica decisiones responsables y soluciones a dificultades reales (Misión 3 / 5).',
    missionTarget: 5,
  },
  {
    key: 'conditionalsUsed',
    labelEn: 'I used zero, first and second conditional.',
    helpEs: 'Verifica que tu guion incluya ejemplos reales de los 3 condicionales (Misión 4 / 5).',
    missionTarget: 4,
  },
  {
    key: 'leadershipResponsibility',
    labelEn: 'I talked about leadership and responsibility.',
    helpEs: 'Incluye expresiones de liderazgo y responsabilidad profesional (Misión 4 / 5).',
    missionTarget: 5,
  },
  {
    key: 'flexibilityAdaptability',
    labelEn: 'I mentioned flexibility and adaptability.',
    helpEs: 'Menciona cómo te adaptas a nuevas situaciones y trabajas en equipo (Misión 4 / 5).',
    missionTarget: 5,
  },
  {
    key: 'audioDurationValid',
    labelEn: 'My audio is between 2 and 5 minutes.',
    helpEs: 'Tu grabación debe durar entre 02:00 y 05:00 minutos (Misión 6).',
    missionTarget: 6,
  },
  {
    key: 'scriptExported',
    labelEn: 'My script is ready in Word or PDF.',
    helpEs: 'Descarga tu guion profesional en formato DOCX o PDF (Misión 5 o botones abajo).',
    missionTarget: 5,
  },
  {
    key: 'audioOrLinkReady',
    labelEn: 'My audio file or public link is ready.',
    helpEs: 'Descarga tu archivo MP3 o guarda tu enlace público de Spreaker/Podbean (Misión 6).',
    missionTarget: 6,
  },
];

export function FinalDelivery({
  profile,
  script,
  recordingMeta,
  checklist,
  soundEnabled,
  hasGoldBadge,
  onToggleItem,
  onUnlockGoldMaster,
  onGoToMission,
  onBack,
}: FinalDeliveryProps) {
  const [badgeImgFailed, setBadgeImgFailed] = useState(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState('');

  const checkedCount = CHECKLIST_ITEMS.filter((i) => checklist[i.key]).length;
  const percent = Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100);
  const allCompleted = checkedCount === CHECKLIST_ITEMS.length;
  const missingItems = CHECKLIST_ITEMS.filter((i) => !checklist[i.key]);

  useEffect(() => {
    if (allCompleted && !hasGoldBadge) {
      onUnlockGoldMaster();
      playVictoryFanfare(soundEnabled);
    }
  }, [allCompleted, hasGoldBadge, onUnlockGoldMaster, soundEnabled]);

  const handleDownloadAudio = async () => {
    setIsDownloadingAudio(true);
    try {
      const blob = await loadRecordingBlob();
      if (!blob) {
        setCopiedMsg('No hay grabación guardada en el estudio. Ve a la Misión 6 para grabar.');
        return;
      }
      const res = await convertAudioBlobToMp3(blob);
      const safeName = (profile.fullName || 'Aprendiz_SENA').trim().replace(/\s+/g, '_');
      downloadBlob(
        res.blob,
        `Audio_GA3-240202501-AA2-EV02_${safeName}.${res.format}`
      );
    } finally {
      setIsDownloadingAudio(false);
    }
  };

  const handleCopyAudioLink = async () => {
    const link = recordingMeta?.publicAudioUrl?.trim();
    if (!link) {
      setCopiedMsg(
        'Aún no has pegado un enlace público de Spreaker o Podbean en la Misión 6.'
      );
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiedMsg('Enlace del audio copiado al portapapeles.');
    } catch {
      setCopiedMsg(`Copia manualmente tu enlace: ${link}`);
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

      {/* Celebration Banner when 100% completed */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="mb-8 rounded-2xl border border-amber-400/50 bg-gradient-to-br from-[#0F1B33] via-[#0B1221] to-[#131C2E] p-6 sm:p-8"
        >
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-amber-400/40 bg-[#060B17]">
              {!badgeImgFailed ? (
                <img
                  src="/src/assets/images/badge_gold_master_1794605793404.jpg"
                  alt="Insignia Gold Audio Master"
                  referrerPolicy="no-referrer"
                  onError={() => setBadgeImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-amber-400">
                  <Award className="h-14 w-14" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-amber-300">
                <Sparkles className="h-4 w-4" />
                <span>INSIGNIA DESBLOQUEADA: GOLD AUDIO MASTER</span>
              </div>
              <h1 className="font-display mt-1 text-3xl font-extrabold text-slate-50">
                MISSION COMPLETED!
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                ¡Felicitaciones, <span className="font-semibold text-white">{profile.fullName}</span>!
                Has completado toda la preparación de tu evidencia{' '}
                <span className="font-mono-num text-sky-300">{profile.activityName}</span>.
              </p>

              {/* Evidence Summary */}
              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-300 md:justify-start">
                <span>Ficha: {profile.trainingGroup}</span>
                <span aria-hidden="true">·</span>
                <span>Instructor: {profile.instructorName}</span>
                {recordingMeta && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num text-emerald-300">
                      Audio: {formatSeconds(recordingMeta.durationSeconds)}
                    </span>
                  </>
                )}
              </div>

              {/* Direct Final Export Actions */}
              <div className="mt-5 flex flex-wrap justify-center gap-2.5 md:justify-start">
                <button
                  type="button"
                  onClick={() => exportScriptToDocx(profile, script)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Guion DOCX</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportScriptToPdf(profile, script)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-500/15 px-4 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/25 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Guion PDF</span>
                </button>
                <button
                  type="button"
                  disabled={isDownloadingAudio}
                  onClick={handleDownloadAudio}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 cursor-pointer"
                >
                  {isDownloadingAudio ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>Descargar Audio</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyAudioLink}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-700 bg-[#060B17] px-4 py-2 text-xs font-bold text-slate-200 hover:border-amber-400/60 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar Enlace</span>
                </button>
              </div>

              {copiedMsg && (
                <p className="mt-2.5 text-xs font-medium text-amber-300">{copiedMsg}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Checklist Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B1221] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono-num text-xs font-semibold text-amber-400">
              FINAL DELIVERY – CHECK YOUR EVIDENCE
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold text-slate-50">
              Lista de Verificación Final
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Marca cada requisito verificado en tu guion y grabación para desbloquear tu insignia
              final.
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono-num text-2xl font-bold text-emerald-400">{percent}%</span>
            <p className="text-xs text-slate-400">
              {checkedCount} de {CHECKLIST_ITEMS.length} requisitos
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-400 transition-all duration-500"
            style={{ width: `${Math.max(percent, 2)}%` }}
          />
        </div>

        {/* Missing Items Guidance */}
        {missingItems.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-950/25 p-4 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>Faltan {missingItems.length} requisitos por confirmar:</span>
            </div>
            <ul className="mt-2 space-y-1.5 pl-6 list-disc text-amber-100/90">
              {missingItems.map((m) => (
                <li key={m.key}>
                  <span className="font-semibold">{m.labelEn}</span> — {m.helpEs}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactive Checklist */}
        <div className="mt-6 space-y-3">
          {CHECKLIST_ITEMS.map((item) => {
            const checked = checklist[item.key];
            return (
              <div
                key={item.key}
                className={`flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center ${
                  checked
                    ? 'border-emerald-500/35 bg-[#111B30]'
                    : 'border-slate-800 bg-[#060B17]/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleItem(item.key)}
                  className="flex flex-1 items-start gap-3 text-left cursor-pointer"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      checked
                        ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </span>
                  <span>
                    <span
                      className={`block text-sm font-semibold ${
                        checked ? 'text-slate-100' : 'text-slate-300'
                      }`}
                    >
                      {item.labelEn}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">{item.helpEs}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onGoToMission(item.missionTarget)}
                  className="self-start rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:border-sky-400 sm:self-center whitespace-nowrap cursor-pointer"
                >
                  Ir a Misión {item.missionTarget}
                </button>
              </div>
            );
          })}
        </div>

        {/* Important Academic Disclaimer */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-800 bg-[#060B17] p-4 text-xs leading-relaxed text-slate-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
          <p>
            <strong className="text-slate-200">Importante:</strong> completar las misiones de esta
            aplicación no significa que la evidencia haya sido aprobada oficialmente por el
            instructor. La aplicación únicamente orienta y verifica los requisitos de preparación
            antes de subir tus archivos a la plataforma del SENA.
          </p>
        </div>
      </div>
    </section>
  );
}
