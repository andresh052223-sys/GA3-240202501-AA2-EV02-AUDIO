import type { BadgeInfo, JourneyQuestionAnswer, MissionNumber, QuestionOption } from '../types';

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

export const JOURNEY_OPTIONS_BY_QUESTION: Record<number, QuestionOption[]> = {
  1: [
    {
      id: 'q1-01',
      number: '01',
      en: 'I am currently studying a technical training program at SENA.',
      es: 'Actualmente estoy estudiando un programa de formación técnica en el SENA.',
    },
    {
      id: 'q1-02',
      number: '02',
      en: 'I am studying business management and learning how companies work.',
      es: 'Estoy estudiando gestión empresarial y aprendiendo cómo funcionan las empresas.',
    },
    {
      id: 'q1-03',
      number: '03',
      en: 'I am studying accounting and learning about financial processes.',
      es: 'Estoy estudiando contabilidad y aprendiendo sobre procesos financieros.',
    },
    {
      id: 'q1-04',
      number: '04',
      en: 'I am studying tourism and learning how to provide good customer service.',
      es: 'Estoy estudiando turismo y aprendiendo cómo ofrecer un buen servicio al cliente.',
    },
    {
      id: 'q1-05',
      number: '05',
      en: 'I am studying gastronomy and learning how to prepare different dishes.',
      es: 'Estoy estudiando gastronomía y aprendiendo a preparar diferentes platos.',
    },
  ],
  2: [
    {
      id: 'q2-01',
      number: '01',
      en: 'I chose this program because I want to improve my professional skills.',
      es: 'Elegí este programa porque quiero mejorar mis habilidades profesionales.',
    },
    {
      id: 'q2-02',
      number: '02',
      en: 'I chose this program because I am interested in this professional field.',
      es: 'Elegí este programa porque estoy interesado en este campo profesional.',
    },
    {
      id: 'q2-03',
      number: '03',
      en: 'I want to learn new things and have better job opportunities.',
      es: 'Quiero aprender cosas nuevas y tener mejores oportunidades laborales.',
    },
    {
      id: 'q2-04',
      number: '04',
      en: 'I chose this program because it is related to my personal interests.',
      es: 'Elegí este programa porque está relacionado con mis intereses personales.',
    },
    {
      id: 'q2-05',
      number: '05',
      en: 'I want to develop my skills and prepare for my professional future.',
      es: 'Quiero desarrollar mis habilidades y prepararme para mi futuro profesional.',
    },
  ],
  3: [
    {
      id: 'q3-01',
      number: '01',
      en: 'I have learned how to communicate and work with other people.',
      es: 'He aprendido a comunicarme y trabajar con otras personas.',
    },
    {
      id: 'q3-02',
      number: '02',
      en: 'I have developed technical skills related to my training program.',
      es: 'He desarrollado habilidades técnicas relacionadas con mi programa de formación.',
    },
    {
      id: 'q3-03',
      number: '03',
      en: 'I have learned how to organize my tasks and solve daily problems.',
      es: 'He aprendido a organizar mis tareas y resolver problemas cotidianos.',
    },
    {
      id: 'q3-04',
      number: '04',
      en: 'I have acquired knowledge in teamwork, planning, and digital tools.',
      es: 'He adquirido conocimientos en trabajo en equipo, planeación y herramientas digitales.',
    },
    {
      id: 'q3-05',
      number: '05',
      en: 'I have improved my practical abilities through projects and class activities.',
      es: 'He mejorado mis habilidades prácticas mediante proyectos y actividades de clase.',
    },
  ],
  4: [
    {
      id: 'q4-01',
      number: '01',
      en: 'My goal is to complete my SENA program and get my certification.',
      es: 'Mi meta es completar mi programa del SENA y obtener mi certificación.',
    },
    {
      id: 'q4-02',
      number: '02',
      en: 'I want to continue learning and improve my English communication skills.',
      es: 'Quiero seguir aprendiendo y mejorar mis habilidades de comunicación en inglés.',
    },
    {
      id: 'q4-03',
      number: '03',
      en: 'I plan to find a good job and gain practical work experience.',
      es: 'Planeo conseguir un buen empleo y ganar experiencia laboral práctica.',
    },
    {
      id: 'q4-04',
      number: '04',
      en: 'I would like to grow professionally and specialize in my area of study.',
      es: 'Me gustaría crecer profesionalmente y especializarme en mi área de estudio.',
    },
    {
      id: 'q4-05',
      number: '05',
      en: 'My goal is to apply my knowledge to help companies achieve better results.',
      es: 'Mi meta es aplicar mis conocimientos para ayudar a las empresas a lograr mejores resultados.',
    },
  ],
  5: [
    {
      id: 'q5-01',
      number: '01',
      en: 'I would like to work in an international company where I can use English.',
      es: 'Me gustaría trabajar en una empresa internacional donde pueda usar el inglés.',
    },
    {
      id: 'q5-02',
      number: '02',
      en: 'I would like to work in a modern company with opportunities to learn.',
      es: 'Me gustaría trabajar en una empresa moderna con oportunidades para aprender.',
    },
    {
      id: 'q5-03',
      number: '03',
      en: 'I want to work in an organization that values teamwork and responsibility.',
      es: 'Quiero trabajar en una organización que valore el trabajo en equipo y la responsabilidad.',
    },
    {
      id: 'q5-04',
      number: '04',
      en: 'In the future, I would like to start my own business or independent project.',
      es: 'En el futuro, me gustaría iniciar mi propio negocio o proyecto independiente.',
    },
    {
      id: 'q5-05',
      number: '05',
      en: 'I would like to work in a recognized company in my professional sector.',
      es: 'Me gustaría trabajar en una empresa reconocida en mi sector profesional.',
    },
  ],
  6: [
    {
      id: 'q6-01',
      number: '01',
      en: 'Sometimes English pronunciation is difficult, so I practice listening and speaking every day.',
      es: 'A veces la pronunciación en inglés es difícil, así que practico escuchando y hablando todos los días.',
    },
    {
      id: 'q6-02',
      number: '02',
      en: 'Managing my time can be challenging, so I create a schedule to organize my tasks.',
      es: 'Administrar mi tiempo puede ser un reto, así que creo un horario para organizar mis tareas.',
    },
    {
      id: 'q6-03',
      number: '03',
      en: 'I do not have much work experience yet, so I focus on learning from practical projects.',
      es: 'Aún no tengo mucha experiencia laboral, así que me enfoco en aprender de proyectos prácticos.',
    },
    {
      id: 'q6-04',
      number: '04',
      en: 'Understanding technical terms can be hard, so I review vocabulary and ask for guidance.',
      es: 'Entender términos técnicos puede ser difícil, así que repaso vocabulario y pido orientación.',
    },
    {
      id: 'q6-05',
      number: '05',
      en: 'Working under pressure is sometimes difficult, so I stay calm and focus on finding solutions.',
      es: 'Trabajar bajo presión a veces es difícil, así que mantengo la calma y me enfoco en encontrar soluciones.',
    },
  ],
};

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
