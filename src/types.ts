export type ScreenView =
  | 'welcome'
  | 'registration'
  | 'map'
  | 'mission-1'
  | 'mission-2'
  | 'mission-3'
  | 'mission-4'
  | 'mission-5'
  | 'mission-6'
  | 'final-delivery';

export type MissionNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type BadgeId =
  | 'first-step'
  | 'english-explorer'
  | 'grammar-master'
  | 'decision-maker'
  | 'script-creator'
  | 'audio-master'
  | 'gold-audio-master';

export interface BadgeInfo {
  id: BadgeId;
  title: string;
  description: string;
  xpBonus: number;
}

export interface LearnerProfile {
  fullName: string;
  idNumber: string;
  trainingGroup: string;
  instructorName: string;
  activityName: string;
  trainingProgram: string;
}

export interface IntroFields {
  fullName: string;
  idNumber: string;
  trainingGroup: string;
  instructorName: string;
  activityName: string;
}

export interface QuestionOption {
  id: string;
  number: string;
  en: string;
  es: string;
}

export interface JourneyQuestionAnswer {
  id: number;
  questionEs: string;
  questionEn: string;
  placeholderEs: string;
  selectedOptionId?: string;
  userInput: string;
  suggestedEnglish: string;
  spanishTranslation: string;
  grammarNote?: string;
}

export interface StationCompletion {
  stationA: boolean;
  stationB: boolean;
  stationC: boolean;
  stationD: boolean;
}

export interface ScriptPart2 {
  journey: string;
  whyProgram: string;
  skillsAndKnowledge: string;
  futurePlans: string;
  professionalFuture: string;
  challengesAndSolutions: string;
}

export interface ScriptState {
  part1: string;
  part2: ScriptPart2;
  conclusion: string;
  conditionalsUsed?: {
    zero: string;
    first: string;
    second: string;
  };
  lastFeedbackEs?: string;
  exportedDocument: boolean;
}

export interface RecordingMetadata {
  durationSeconds: number;
  recordedAt: string;
  format: 'mp3' | 'webm' | 'ogg' | 'mp4';
  publicAudioUrl: string;
}

export type ChecklistKey =
  | 'introIncluded'
  | 'journeyTalked'
  | 'futurePlansExplained'
  | 'decisionsAndSolutions'
  | 'conditionalsUsed'
  | 'leadershipResponsibility'
  | 'flexibilityAdaptability'
  | 'audioDurationValid'
  | 'scriptExported'
  | 'audioOrLinkReady';

export type EvidenceChecklist = Record<ChecklistKey, boolean>;

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  englishExamples?: string[];
  timestamp: number;
}

export interface MissionProgress {
  completedMissions: MissionNumber[];
  unlockedUpTo: MissionNumber;
  finalDeliveryUnlocked: boolean;
  xp: number;
  badges: BadgeId[];
  soundEnabled: boolean;
}

export interface AppState {
  profile: LearnerProfile;
  isRegistered: boolean;
  introFields: IntroFields;
  customIntroduction: string;
  journeyAnswers: JourneyQuestionAnswer[];
  stationProgress: StationCompletion;
  script: ScriptState;
  recordingMeta: RecordingMetadata | null;
  checklist: EvidenceChecklist;
  progress: MissionProgress;
}
