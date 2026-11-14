import { useCallback, useEffect, useState } from 'react';
import { Award, Map, ShieldCheck, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AiCoachDrawer } from './components/AiCoachDrawer';
import { FinalDelivery } from './components/FinalDelivery';
import { Mission1Challenge } from './components/Mission1Challenge';
import { buildDefaultIntroText, Mission2Intro } from './components/Mission2Intro';
import { Mission3Journey } from './components/Mission3Journey';
import { Mission4Conditionals } from './components/Mission4Conditionals';
import { Mission5Script } from './components/Mission5Script';
import { Mission6Studio } from './components/Mission6Studio';
import { MissionMap } from './components/MissionMap';
import { RegistrationScreen } from './components/RegistrationScreen';
import { TopBar } from './components/TopBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BADGES, INITIAL_JOURNEY_QUESTIONS, MISSIONS } from './data/curriculum';
import type {
  AppState,
  BadgeId,
  ChecklistKey,
  CoachMessage,
  IntroFields,
  JourneyQuestionAnswer,
  LearnerProfile,
  MissionNumber,
  RecordingMetadata,
  ScreenView,
  ScriptState,
  StationCompletion,
} from './types';
import { playMissionCompleteSound } from './utils/sound';

const STORAGE_KEY = 'english_audio_mission_state_v1';

const DEFAULT_STATE: AppState = {
  profile: {
    fullName: '',
    idNumber: '',
    trainingGroup: '',
    instructorName: '',
    activityName: 'GA3-240202501-AA2-EV02 – AUDIO',
    trainingProgram: '',
  },
  isRegistered: false,
  introFields: {
    fullName: '',
    idNumber: '',
    trainingGroup: '',
    instructorName: '',
    activityName: 'GA3-240202501-AA2-EV02 – AUDIO',
  },
  customIntroduction: '',
  journeyAnswers: INITIAL_JOURNEY_QUESTIONS,
  stationProgress: {
    stationA: false,
    stationB: false,
    stationC: false,
    stationD: false,
  },
  script: {
    part1: '',
    part2: {
      journey: '',
      futurePlans: '',
      decisionsAndActions: '',
      problemsAndSolutions: '',
      leadership: '',
      adaptability: '',
    },
    exportedDocument: false,
  },
  recordingMeta: null,
  checklist: {
    introIncluded: false,
    journeyTalked: false,
    futurePlansExplained: false,
    decisionsAndSolutions: false,
    conditionalsUsed: false,
    leadershipResponsibility: false,
    flexibilityAdaptability: false,
    audioDurationValid: false,
    scriptExported: false,
    audioOrLinkReady: false,
  },
  progress: {
    completedMissions: [],
    unlockedUpTo: 1,
    finalDeliveryUnlocked: false,
    xp: 0,
    badges: [],
    soundEnabled: true,
  },
};

function loadInitialState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
      introFields: { ...DEFAULT_STATE.introFields, ...(parsed.introFields || {}) },
      stationProgress: { ...DEFAULT_STATE.stationProgress, ...(parsed.stationProgress || {}) },
      script: {
        ...DEFAULT_STATE.script,
        ...(parsed.script || {}),
        part2: { ...DEFAULT_STATE.script.part2, ...(parsed.script?.part2 || {}) },
      },
      checklist: { ...DEFAULT_STATE.checklist, ...(parsed.checklist || {}) },
      progress: { ...DEFAULT_STATE.progress, ...(parsed.progress || {}) },
      journeyAnswers:
        Array.isArray(parsed.journeyAnswers) && parsed.journeyAnswers.length === 6
          ? parsed.journeyAnswers
          : DEFAULT_STATE.journeyAnswers,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function App() {
  const [state, setState] = useState<AppState>(loadInitialState);
  const [screen, setScreen] = useState<ScreenView>('welcome');
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
  const [rewardToast, setRewardToast] = useState<{
    title: string;
    xp: number;
    badgeTitle?: string;
  } | null>(null);

  // Persist all progress automatically in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues
    }
  }, [state]);

  // Auto-hide toast
  useEffect(() => {
    if (!rewardToast) return;
    const t = window.setTimeout(() => setRewardToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [rewardToast]);

  const showMissionReward = useCallback(
    (missionNumber: MissionNumber, badgeId: BadgeId, xpReward: number) => {
      const badge = BADGES[badgeId];
      setRewardToast({
        title: `¡Misión ${missionNumber} completada!`,
        xp: xpReward,
        badgeTitle: badge?.title,
      });
    },
    []
  );

  const handleSaveProfile = (profile: LearnerProfile) => {
    const introFields: IntroFields = {
      fullName: profile.fullName,
      idNumber: profile.idNumber,
      trainingGroup: profile.trainingGroup,
      instructorName: profile.instructorName,
      activityName: profile.activityName,
    };
    const nextIntro = state.customIntroduction.trim()
      ? state.customIntroduction
      : buildDefaultIntroText(introFields);

    setState((prev) => ({
      ...prev,
      profile,
      isRegistered: true,
      introFields,
      customIntroduction: nextIntro,
      script: {
        ...prev.script,
        part1: prev.script.part1.trim() ? prev.script.part1 : nextIntro,
      },
    }));
    setScreen('map');
  };

  const completeMission = (missionNumber: MissionNumber, nextScreen: ScreenView) => {
    const def = MISSIONS.find((m) => m.number === missionNumber);
    if (!def) return;

    setState((prev) => {
      const alreadyDone = prev.progress.completedMissions.includes(missionNumber);
      const completedMissions = alreadyDone
        ? prev.progress.completedMissions
        : [...prev.progress.completedMissions, missionNumber];
      const nextUnlocked = Math.min(6, Math.max(prev.progress.unlockedUpTo, missionNumber + 1)) as MissionNumber;
      const finalDeliveryUnlocked =
        prev.progress.finalDeliveryUnlocked || missionNumber === 6;

      const badges = prev.progress.badges.includes(def.badgeId)
        ? prev.progress.badges
        : [...prev.progress.badges, def.badgeId];

      const xp = alreadyDone ? prev.progress.xp : prev.progress.xp + def.xpReward;

      // Sync smart checklist defaults based on mission completed
      const nextChecklist = { ...prev.checklist };
      if (missionNumber === 2) nextChecklist.introIncluded = true;
      if (missionNumber === 3) {
        nextChecklist.journeyTalked = true;
        nextChecklist.futurePlansExplained = true;
      }
      if (missionNumber === 4) {
        nextChecklist.conditionalsUsed = true;
        nextChecklist.leadershipResponsibility = true;
        nextChecklist.flexibilityAdaptability = true;
      }
      if (missionNumber === 5) {
        nextChecklist.decisionsAndSolutions = true;
        if (prev.script.exportedDocument) nextChecklist.scriptExported = true;
      }
      if (missionNumber === 6 && prev.recordingMeta) {
        const dur = prev.recordingMeta.durationSeconds;
        if (dur >= 120 && dur <= 300) nextChecklist.audioDurationValid = true;
        if (prev.recordingMeta.publicAudioUrl.trim() || dur > 0) {
          nextChecklist.audioOrLinkReady = true;
        }
      }

      return {
        ...prev,
        checklist: nextChecklist,
        progress: {
          ...prev.progress,
          completedMissions,
          unlockedUpTo: nextUnlocked,
          finalDeliveryUnlocked,
          xp,
          badges,
        },
      };
    });

    if (!state.progress.completedMissions.includes(missionNumber)) {
      playMissionCompleteSound(state.progress.soundEnabled);
      showMissionReward(missionNumber, def.badgeId, def.xpReward);
    }

    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMission = (mission: MissionNumber) => {
    setScreen(`mission-${mission}` as ScreenView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateIntro = (introFields: IntroFields, customIntroduction: string) => {
    setState((prev) => ({
      ...prev,
      introFields,
      customIntroduction,
      script: {
        ...prev.script,
        part1: customIntroduction,
      },
    }));
  };

  const handleUpdateJourney = (journeyAnswers: JourneyQuestionAnswer[]) => {
    setState((prev) => ({ ...prev, journeyAnswers }));
  };

  const handleUpdateStations = (stationProgress: StationCompletion) => {
    setState((prev) => ({ ...prev, stationProgress }));
  };

  const handleUpdateScript = (script: ScriptState) => {
    setState((prev) => ({
      ...prev,
      script,
      checklist: {
        ...prev.checklist,
        scriptExported: prev.checklist.scriptExported || script.exportedDocument,
      },
    }));
  };

  const handleSaveRecording = (meta: RecordingMetadata) => {
    setState((prev) => ({
      ...prev,
      recordingMeta: meta,
      checklist: {
        ...prev.checklist,
        audioDurationValid: meta.durationSeconds >= 120 && meta.durationSeconds <= 300,
        audioOrLinkReady: true,
      },
    }));
  };

  const handleUpdatePublicUrl = (publicAudioUrl: string) => {
    setState((prev) => ({
      ...prev,
      recordingMeta: prev.recordingMeta
        ? { ...prev.recordingMeta, publicAudioUrl }
        : {
            durationSeconds: 0,
            recordedAt: new Date().toISOString(),
            format: 'mp3',
            publicAudioUrl,
          },
      checklist: {
        ...prev.checklist,
        audioOrLinkReady:
          prev.checklist.audioOrLinkReady || publicAudioUrl.trim().length > 8,
      },
    }));
  };

  const handleToggleChecklist = (key: ChecklistKey) => {
    setState((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key],
      },
    }));
  };

  const handleUnlockGoldMaster = useCallback(() => {
    setState((prev) => {
      if (prev.progress.badges.includes('gold-audio-master')) return prev;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          xp: prev.progress.xp + BADGES['gold-audio-master'].xpBonus,
          badges: [...prev.progress.badges, 'gold-audio-master'],
        },
      };
    });
  }, []);

  const currentMissionLabel =
    screen === 'welcome'
      ? 'Inicio'
      : screen === 'registration'
        ? 'Registro del Aprendiz'
        : screen === 'map'
          ? 'Mapa de Misiones'
          : screen === 'final-delivery'
            ? 'Entrega Final'
            : screen.replace('mission-', 'Misión ');

  return (
    <div className="min-h-screen bg-[#060B17] text-slate-100 flex flex-col">
      <TopBar
        currentScreen={screen}
        isRegistered={state.isRegistered}
        finalDeliveryUnlocked={state.progress.finalDeliveryUnlocked}
        onNavigate={(next) => {
          setScreen(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCoach={() => setCoachOpen(true)}
      />

      {/* Compact Mobile Navigation Strip (only on <md viewports, compact < 52px) */}
      <div className="flex items-center justify-around border-b border-slate-800/80 bg-[#0B1221] px-2 py-2 text-xs font-medium text-slate-300 md:hidden">
        <button
          type="button"
          onClick={() => setScreen('welcome')}
          className={`px-2 py-1 ${screen === 'welcome' ? 'text-emerald-400 font-bold' : ''}`}
        >
          Inicio
        </button>
        <button
          type="button"
          onClick={() => setScreen(state.isRegistered ? 'map' : 'registration')}
          className={`px-2 py-1 ${
            screen === 'map' || screen.startsWith('mission-') ? 'text-sky-400 font-bold' : ''
          }`}
        >
          Mapa
        </button>
        <button
          type="button"
          onClick={() => setScreen('registration')}
          className={`px-2 py-1 ${screen === 'registration' ? 'text-sky-400 font-bold' : ''}`}
        >
          Aprendiz
        </button>
        <button
          type="button"
          onClick={() =>
            setScreen(
              state.progress.finalDeliveryUnlocked
                ? 'final-delivery'
                : state.isRegistered
                  ? 'map'
                  : 'registration'
            )
          }
          className={`px-2 py-1 ${screen === 'final-delivery' ? 'text-amber-300 font-bold' : ''}`}
        >
          Entrega
        </button>
      </div>

      {/* Reward Toast on Mission Complete */}
      <AnimatePresence>
        {rewardToast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed left-1/2 top-20 z-40 w-[90%] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-400/50 bg-[#0D1A2D] px-5 py-3.5 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-slate-50">{rewardToast.title}</p>
                <p className="text-xs text-emerald-300">
                  <span className="font-mono-num font-bold">+{rewardToast.xp} XP</span>
                  {rewardToast.badgeTitle && ` · Insignia ${rewardToast.badgeTitle}`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        {screen === 'welcome' && (
          <WelcomeScreen
            progress={state.progress}
            isRegistered={state.isRegistered}
            learnerName={state.profile.fullName}
            onStartMission={() =>
              setScreen(state.isRegistered ? 'map' : 'registration')
            }
            onGoToMap={() => setScreen('map')}
          />
        )}

        {screen === 'registration' && (
          <RegistrationScreen
            profile={state.profile}
            isRegistered={state.isRegistered}
            onSave={handleSaveProfile}
            onBack={() => setScreen(state.isRegistered ? 'map' : 'welcome')}
          />
        )}

        {screen === 'map' && (
          <MissionMap
            profile={state.profile}
            progress={state.progress}
            onSelectMission={handleOpenMission}
            onOpenFinalDelivery={() => setScreen('final-delivery')}
            onEditProfile={() => setScreen('registration')}
            onToggleSound={() =>
              setState((prev) => ({
                ...prev,
                progress: {
                  ...prev.progress,
                  soundEnabled: !prev.progress.soundEnabled,
                },
              }))
            }
            onNavigate={setScreen}
          />
        )}

        {screen === 'mission-1' && (
          <Mission1Challenge
            isCompleted={state.progress.completedMissions.includes(1)}
            onComplete={() => completeMission(1, 'mission-2')}
            onBack={() => setScreen('map')}
          />
        )}

        {screen === 'mission-2' && (
          <Mission2Intro
            introFields={state.introFields}
            customIntroduction={state.customIntroduction}
            isCompleted={state.progress.completedMissions.includes(2)}
            onUpdateIntro={handleUpdateIntro}
            onComplete={() => completeMission(2, 'mission-3')}
            onBack={() => setScreen('map')}
          />
        )}

        {screen === 'mission-3' && (
          <Mission3Journey
            answers={state.journeyAnswers}
            soundEnabled={state.progress.soundEnabled}
            isCompleted={state.progress.completedMissions.includes(3)}
            onUpdateAnswers={handleUpdateJourney}
            onComplete={() => completeMission(3, 'mission-4')}
            onBack={() => setScreen('map')}
          />
        )}

        {screen === 'mission-4' && (
          <Mission4Conditionals
            stationProgress={state.stationProgress}
            soundEnabled={state.progress.soundEnabled}
            isCompleted={state.progress.completedMissions.includes(4)}
            onUpdateStations={handleUpdateStations}
            onComplete={() => completeMission(4, 'mission-5')}
            onBack={() => setScreen('map')}
          />
        )}

        {screen === 'mission-5' && (
          <Mission5Script
            profile={state.profile}
            customIntroduction={state.customIntroduction}
            journeyAnswers={state.journeyAnswers}
            script={state.script}
            soundEnabled={state.progress.soundEnabled}
            isCompleted={state.progress.completedMissions.includes(5)}
            onUpdateScript={handleUpdateScript}
            onComplete={() => completeMission(5, 'mission-6')}
            onBack={() => setScreen('map')}
          />
        )}

        {screen === 'mission-6' && (
          <Mission6Studio
            profile={state.profile}
            script={state.script}
            recordingMeta={state.recordingMeta}
            soundEnabled={state.progress.soundEnabled}
            isCompleted={state.progress.completedMissions.includes(6)}
            onSaveRecording={(meta) => handleSaveRecording(meta)}
            onUpdatePublicUrl={handleUpdatePublicUrl}
            onComplete={() => completeMission(6, 'final-delivery')}
            onBack={() => setScreen('map')}
          />
        )}

        {screen === 'final-delivery' && (
          <FinalDelivery
            profile={state.profile}
            script={state.script}
            recordingMeta={state.recordingMeta}
            checklist={state.checklist}
            soundEnabled={state.progress.soundEnabled}
            hasGoldBadge={state.progress.badges.includes('gold-audio-master')}
            onToggleItem={handleToggleChecklist}
            onUnlockGoldMaster={handleUnlockGoldMaster}
            onGoToMission={handleOpenMission}
            onBack={() => setScreen('map')}
          />
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-800/70 bg-[#060B17] py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>
              ENGLISH AUDIO MISSION · Evidencia GA3-240202501-AA2-EV02 – AUDIO
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Map className="h-3.5 w-3.5" />
              <span>{state.progress.completedMissions.length}/6 Misiones</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono-num text-amber-400/90">
              <Award className="h-3.5 w-3.5" />
              <span>{state.progress.xp} XP</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Persistent AI English Coach Drawer */}
      <AiCoachDrawer
        isOpen={coachOpen}
        onClose={() => setCoachOpen(false)}
        currentMissionLabel={currentMissionLabel}
        profile={state.profile}
        messages={coachMessages}
        onAddMessages={(u, a) => setCoachMessages((prev) => [...prev, u, a])}
      />
    </div>
  );
}
