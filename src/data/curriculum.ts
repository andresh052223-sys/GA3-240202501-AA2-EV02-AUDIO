import type { BadgeInfo, JourneyQuestionAnswer, MissionNumber } from '../types';

export interface MissionDefinition {
  number: MissionNumber;
  code: string;
  title: string;
  subtitleEs: string;
  xpReward: number;
  badgeId: BadgeInfo['id'];
}

export const MISSIONS: MissionDefinition[] = [
  {
    number: 1,
    code: 'MISSION 1',
    title: 'UNDERSTAND THE CHALLENGE',
    subtitleEs: 'Comprende los requisitos exactos de la evidencia GA3-240202501-AA2-EV02.',
    xpReward: 100,
    badgeId: 'first-step',
  },
  {
    number: 2,
    code: 'MISSION 2',
    title: 'BUILD YOUR INTRODUCTION',
    subtitleEs: 'Construye y practica la pronunciación de tu presentación personal en inglés.',
    xpReward: 150,
    badgeId: 'english-explorer',
  },
  {
    number: 3,
    code: 'MISSION 3',
    title: 'TALK ABOUT YOUR JOURNEY',
    subtitleEs: 'Responde sobre tu trayectoria, metas y retos con ayuda del asistente inteligente.',
    xpReward: 200,
    badgeId: 'grammar-master',
  },
  {
    number: 4,
    code: 'MISSION 4',
    title: 'MAKE DECISIONS LIKE A PROFESSIONAL',
    subtitleEs: 'Domina Zero, First, Second Conditional y vocabulario de liderazgo.',
    xpReward: 250,
    badgeId: 'decision-maker',
  },
  {
    number: 5,
    code: 'MISSION 5',
    title: 'BUILD YOUR AUDIO SCRIPT',
    subtitleEs: 'Genera, mejora y descarga tu guion profesional en DOCX o PDF.',
    xpReward: 300,
    badgeId: 'script-creator',
  },
  {
    number: 6,
    code: 'MISSION 6',
    title: 'RECORD YOUR VOICE',
    subtitleEs: 'Graba tu audio en estudio, verifica la duración (2–5 min) y obtén tu MP3 o enlace.',
    xpReward: 350,
    badgeId: 'audio-master',
  },
];

export const BADGES: Record<BadgeInfo['id'], BadgeInfo> = {
  'first-step': {
    id: 'first-step',
    title: 'FIRST STEP',
    description: 'Comprendiste el reto y los entregables de la evidencia.',
    xpBonus: 100,
  },
  'english-explorer': {
    id: 'english-explorer',
    title: 'ENGLISH EXPLORER',
    description: 'Creaste y practicaste tu presentación personal en inglés.',
    xpBonus: 150,
  },
  'grammar-master': {
    id: 'grammar-master',
    title: 'GRAMMAR MASTER',
    description: 'Transformaste tus ideas reales sobre tu trayectoria en inglés natural.',
    xpBonus: 200,
  },
  'decision-maker': {
    id: 'decision-maker',
    title: 'DECISION MAKER',
    description: 'Completaste las 4 estaciones de condicionales y liderazgo.',
    xpBonus: 250,
  },
  'script-creator': {
    id: 'script-creator',
    title: 'SCRIPT CREATOR',
    description: 'Construiste, refinaste y preparaste tu guion completo de 2 a 5 minutos.',
    xpBonus: 300,
  },
  'audio-master': {
    id: 'audio-master',
    title: 'AUDIO MASTER',
    description: 'Grabaste y preparaste tu evidencia de audio en inglés.',
    xpBonus: 350,
  },
  'gold-audio-master': {
    id: 'gold-audio-master',
    title: 'GOLD AUDIO MASTER',
    description: 'Verificaste el 100% de los requisitos de entrega de tu misión.',
    xpBonus: 500,
  },
};

export const INITIAL_JOURNEY_QUESTIONS: JourneyQuestionAnswer[] = [
  {
    id: 1,
    questionEs: '¿Qué estás estudiando actualmente?',
    questionEn: 'What are you currently studying?',
    placeholderEs: 'Ej: Estoy estudiando Análisis y Desarrollo de Software en el SENA porque me gusta programar...',
    userInput: '',
    suggestedEnglish: '',
    spanishTranslation: '',
  },
  {
    id: 2,
    questionEs: '¿Por qué elegiste este programa de formación?',
    questionEn: 'Why did you choose this training program?',
    placeholderEs: 'Ej: Lo elegí porque tiene mucha salida laboral y quiero crear soluciones tecnológicas...',
    userInput: '',
    suggestedEnglish: '',
    spanishTranslation: '',
  },
  {
    id: 3,
    questionEs: '¿Qué conocimientos has adquirido?',
    questionEn: 'What skills and knowledge have you acquired?',
    placeholderEs: 'Ej: He aprendido trabajo en equipo, lógica de programación, bases de datos y comunicación...',
    userInput: '',
    suggestedEnglish: '',
    spanishTranslation: '',
  },
  {
    id: 4,
    questionEs: '¿Cuáles son tus metas académicas y profesionales?',
    questionEn: 'What are your academic and professional goals?',
    placeholderEs: 'Ej: Quiero certificarme como tecnólogo, mejorar mi inglés y conseguir un empleo estable...',
    userInput: '',
    suggestedEnglish: '',
    spanishTranslation: '',
  },
  {
    id: 5,
    questionEs: '¿Dónde te gustaría trabajar en el futuro?',
    questionEn: 'Where would you like to work in the future?',
    placeholderEs: 'Ej: Me gustaría trabajar en una empresa innovadora donde pueda seguir aprendiendo...',
    userInput: '',
    suggestedEnglish: '',
    spanishTranslation: '',
  },
  {
    id: 6,
    questionEs: '¿Qué dificultades has encontrado y cómo puedes solucionarlas?',
    questionEn: 'What difficulties have you faced and how can you solve them?',
    placeholderEs: 'Ej: A veces me cuesta organizar el tiempo o entender inglés técnico, pero practico cada día...',
    userInput: '',
    suggestedEnglish: '',
    spanishTranslation: '',
  },
];

export interface MultipleChoiceExercise {
  id: string;
  type: 'choice';
  promptEs: string;
  sentence: string;
  options: string[];
  correctIndex: number;
  feedbackCorrectEs: string;
  feedbackWrongEs: string;
}

export interface FillBlankExercise {
  id: string;
  type: 'fill';
  promptEs: string;
  beforeBlank: string;
  afterBlank: string;
  acceptedAnswers: string[];
  hintEs: string;
  feedbackCorrectEs: string;
  feedbackWrongEs: string;
}

export type StationExercise = MultipleChoiceExercise | FillBlankExercise;

export interface ConditionalStationData {
  id: 'stationA' | 'stationB' | 'stationC';
  title: string;
  subtitleEs: string;
  usageEs: string;
  formula: string;
  exampleEn: string;
  exampleEs: string;
  exercises: StationExercise[];
}

export const CONDITIONAL_STATIONS: ConditionalStationData[] = [
  {
    id: 'stationA',
    title: 'STATION A – ZERO CONDITIONAL',
    subtitleEs: 'Situaciones generales, hechos reales y hábitos laborales.',
    usageEs: 'Se utiliza para hablar de situaciones generales y resultados habituales que siempre ocurren bajo cierta condición.',
    formula: 'If + Present Simple, Present Simple',
    exampleEn: 'If employees work as a team, they achieve better results.',
    exampleEs: 'Si los empleados trabajan en equipo, logran mejores resultados.',
    exercises: [
      {
        id: 'zc-1',
        type: 'choice',
        promptEs: 'Completa la regla general usando Zero Conditional (Present Simple + Present Simple):',
        sentence: 'If a team communicates clearly, it ______ fewer mistakes.',
        options: ['makes', 'will make', 'would make'],
        correctIndex: 0,
        feedbackCorrectEs: '¡Excelente! En Zero Conditional ambas partes van en Present Simple ("makes") porque es una verdad general.',
        feedbackWrongEs: 'Recuerda: Zero Conditional expresa hechos habituales. Usa Present Simple ("makes"), no "will" ni "would".',
      },
      {
        id: 'zc-2',
        type: 'fill',
        promptEs: 'Escribe el verbo correcto en Present Simple (plan / plans / prepare):',
        beforeBlank: 'If I',
        afterBlank: 'my day in advance, I finish my tasks on time.',
        acceptedAnswers: ['plan', 'organize', 'prepare'],
        hintEs: 'Pista: verbo para "planificar" en primera persona (I plan).',
        feedbackCorrectEs: '¡Muy bien! "If I plan my day in advance, I finish..." describe un hábito positivo real.',
        feedbackWrongEs: 'Intenta con "plan" (o "organize"). Con "I", el Present Simple va en su forma base sin "-s".',
      },
    ],
  },
  {
    id: 'stationB',
    title: 'STATION B – FIRST CONDITIONAL',
    subtitleEs: 'Situaciones futuras posibles y planes reales.',
    usageEs: 'Se utiliza para hablar de situaciones futuras posibles o probables y sus consecuencias reales.',
    formula: 'If + Present Simple, will + verb',
    exampleEn: 'If I improve my English, I will get better job opportunities.',
    exampleEs: 'Si mejoro mi inglés, obtendré mejores oportunidades laborales.',
    exercises: [
      {
        id: 'fc-1',
        type: 'choice',
        promptEs: 'Elige la opción correcta para expresar una meta futura probable:',
        sentence: 'If I complete my SENA program successfully, I ______ for a good job.',
        options: ['apply', 'will apply', 'would applied'],
        correctIndex: 1,
        feedbackCorrectEs: '¡Correcto! First Conditional usa "will + verbo" en la consecuencia futura.',
        feedbackWrongEs: 'Para un resultado futuro probable con First Conditional necesitamos "will apply".',
      },
      {
        id: 'fc-2',
        type: 'fill',
        promptEs: 'Completa la estructura del First Conditional escribiendo la palabra auxiliar del futuro:',
        beforeBlank: 'If we practice every day, we',
        afterBlank: 'speak with more confidence.',
        acceptedAnswers: ['will'],
        hintEs: 'Pista: auxiliar de futuro simple en inglés (4 letras).',
        feedbackCorrectEs: '¡Exacto! "we will speak" completa perfectamente el First Conditional.',
        feedbackWrongEs: 'En First Conditional la segunda cláusula usa el auxiliar "will" antes del verbo.',
      },
    ],
  },
  {
    id: 'stationC',
    title: 'STATION C – SECOND CONDITIONAL',
    subtitleEs: 'Situaciones hipotéticas, imaginarias o consejos.',
    usageEs: 'Se utiliza para hablar de situaciones hipotéticas o imaginarias en el presente o futuro.',
    formula: 'If + Past Simple, would + verb',
    exampleEn: 'If I were a manager, I would create a better working environment.',
    exampleEs: 'Si yo fuera gerente, crearía un mejor ambiente laboral.',
    exercises: [
      {
        id: 'sc-1',
        type: 'choice',
        promptEs: 'Selecciona la forma correcta para una situación hipotética:',
        sentence: 'If I had my own company, I ______ new apprentices.',
        options: ['support', 'will support', 'would support'],
        correctIndex: 2,
        feedbackCorrectEs: '¡Genial! Con "If + Past Simple (had)", usamos "would + verbo" para expresar hipótesis.',
        feedbackWrongEs: 'Al usar "had" (Past Simple) planteamos una hipótesis, así que corresponde "would support".',
      },
      {
        id: 'sc-2',
        type: 'fill',
        promptEs: 'Completa la frase hipotética con el modal correspondiente:',
        beforeBlank: 'If a colleague faced a problem, I',
        afterBlank: 'help them find a solution.',
        acceptedAnswers: ['would'],
        hintEs: 'Pista: palabra que convierte el verbo en "-ría" (ayudaría).',
        feedbackCorrectEs: '¡Perfecto! "I would help" expresa una decisión profesional hipotética.',
        feedbackWrongEs: 'Recuerda la fórmula del Second Conditional: If + Past Simple, "would" + verb.',
      },
    ],
  },
];

export interface LeadershipExpression {
  id: string;
  english: string;
  spanish: string;
}

export const LEADERSHIP_EXPRESSIONS: LeadershipExpression[] = [
  {
    id: 'exp-1',
    english: 'I am responsible for my actions.',
    spanish: 'Soy responsable de mis acciones.',
  },
  {
    id: 'exp-2',
    english: 'I can adapt to new situations.',
    spanish: 'Puedo adaptarme a nuevas situaciones.',
  },
  {
    id: 'exp-3',
    english: 'I always try to find solutions.',
    spanish: 'Siempre trato de encontrar soluciones.',
  },
  {
    id: 'exp-4',
    english: 'I believe teamwork is important.',
    spanish: 'Creo que el trabajo en equipo es importante.',
  },
  {
    id: 'exp-5',
    english: 'I can make responsible decisions.',
    spanish: 'Puedo tomar decisiones responsables.',
  },
  {
    id: 'exp-6',
    english: 'I am willing to learn new skills.',
    spanish: 'Estoy dispuesto a aprender nuevas habilidades.',
  },
  {
    id: 'exp-7',
    english: 'I can work under pressure.',
    spanish: 'Puedo trabajar bajo presión.',
  },
  {
    id: 'exp-8',
    english: 'I would support my colleagues.',
    spanish: 'Yo apoyaría a mis compañeros.',
  },
];

export interface MatchingPair {
  id: string;
  english: string;
  spanish: string;
}

export const STATION_D_MATCHING: MatchingPair[] = [
  {
    id: 'm1',
    english: 'I am responsible for my actions.',
    spanish: 'Asumo la responsabilidad de lo que hago.',
  },
  {
    id: 'm2',
    english: 'I am willing to learn new skills.',
    spanish: 'Tengo disposición para adquirir nuevos conocimientos.',
  },
  {
    id: 'm3',
    english: 'I can work under pressure.',
    spanish: 'Mantengo el rendimiento en momentos exigentes.',
  },
  {
    id: 'm4',
    english: 'I would support my colleagues.',
    spanish: 'Ayudaría a mi equipo cuando lo necesite.',
  },
];
