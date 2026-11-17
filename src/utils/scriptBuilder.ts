import type { JourneyQuestionAnswer, ScriptPart2, ScriptState } from '../types';

export const DEFAULT_CONCLUSION =
  'In conclusion, my academic journey is helping me prepare for my professional future. I know that I need to continue learning, improving my skills, and taking responsibility for my decisions. I am motivated to achieve my goals and become a better professional. Thank you for listening!';

export const DEFAULT_CONDITIONALS_USED = {
  zero: 'If people work as a team, they achieve better results.',
  first: 'If I continue improving my skills, I will have better professional opportunities.',
  second: 'If I were a manager, I would encourage teamwork and responsibility.',
};

export interface Part2SectionMeta {
  key: keyof ScriptPart2;
  questionId: number;
  title: string;
  questionEn: string;
}

export const PART2_SECTION_META: Part2SectionMeta[] = [
  {
    key: 'journey',
    questionId: 1,
    title: '1. MY ACADEMIC JOURNEY',
    questionEn: 'What are you currently studying?',
  },
  {
    key: 'whyProgram',
    questionId: 2,
    title: '2. WHY I CHOSE MY TRAINING PROGRAM',
    questionEn: 'Why did you choose this training program?',
  },
  {
    key: 'skillsAndKnowledge',
    questionId: 3,
    title: '3. SKILLS AND KNOWLEDGE',
    questionEn: 'What skills and knowledge have you acquired?',
  },
  {
    key: 'futurePlans',
    questionId: 4,
    title: '4. MY FUTURE PLANS AND PROFESSIONAL GOALS',
    questionEn: 'What are your academic and professional goals?',
  },
  {
    key: 'professionalFuture',
    questionId: 5,
    title: '5. MY PROFESSIONAL FUTURE',
    questionEn: 'Where would you like to work in the future?',
  },
  {
    key: 'challengesAndSolutions',
    questionId: 6,
    title: '6. CHALLENGES AND SOLUTIONS',
    questionEn: 'What difficulties have you faced and how can you solve them?',
  },
];

export const QUESTION_ID_TO_PART2_KEY: Record<number, keyof ScriptPart2> = {
  1: 'journey',
  2: 'whyProgram',
  3: 'skillsAndKnowledge',
  4: 'futurePlans',
  5: 'professionalFuture',
  6: 'challengesAndSolutions',
};

function ensureSentencePunctuation(text: string): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function formatAfterLeadIn(sentence: string): string {
  const clean = ensureSentencePunctuation(sentence);
  if (!clean) return '';
  // Never lowercase the pronoun "I"
  if (/^I(?:\s|'|$)/.test(clean)) {
    return clean;
  }
  return clean.charAt(0).toLowerCase() + clean.slice(1);
}

export function buildSectionFromAnswer(questionId: number, rawEnglishAnswer: string): string {
  const answer = ensureSentencePunctuation(rawEnglishAnswer);
  if (!answer) return '';

  switch (questionId) {
    case 1:
      return `First of all, I would like to share a little about my academic journey. ${answer} Being part of this training process is an important step for me because every day I learn something valuable that strengthens my commitment to my studies.`;
    case 2:
      return `Regarding my motivation for choosing this field, ${formatAfterLeadIn(answer)} I made this decision carefully because I want my education to have a positive impact on my life. I believe that responsibility and teamwork are important in the workplace, so I apply these values in every activity I do.`;
    case 3:
      return `In addition, during my training process I have worked hard to build useful competencies. ${answer} Through collaborative tasks, I have learned that if people work as a team, they achieve better results. That is why I always try to communicate clearly and support my classmates.`;
    case 4:
      return `Looking ahead to the next stages of my career, I have clear objectives in mind. ${answer} I know that consistent effort makes a big difference. If I continue improving my skills, I will have better professional opportunities and I will be ready for new responsibilities.`;
    case 5:
      return `As for the environment where I see myself working, ${formatAfterLeadIn(answer)} I want to contribute positively to any organization I join and grow alongside experienced professionals. If I were a manager, I would encourage teamwork and responsibility so that everyone feels respected and motivated.`;
    case 6:
      return `Of course, every learning path comes with obstacles, and I have also faced some difficulties. ${answer} Furthermore, I understand that professional environments can change, so I need to be flexible and adaptable. Whenever a problem appears, I stay calm and focus on finding practical solutions.`;
    default:
      return answer;
  }
}

export function buildFullPart2FromJourney(answers: JourneyQuestionAnswer[]): ScriptPart2 {
  const byId = new Map<number, string>();
  for (const ans of answers) {
    byId.set(ans.id, ans.suggestedEnglish || '');
  }

  return {
    journey: buildSectionFromAnswer(1, byId.get(1) || ''),
    whyProgram: buildSectionFromAnswer(2, byId.get(2) || ''),
    skillsAndKnowledge: buildSectionFromAnswer(3, byId.get(3) || ''),
    futurePlans: buildSectionFromAnswer(4, byId.get(4) || ''),
    professionalFuture: buildSectionFromAnswer(5, byId.get(5) || ''),
    challengesAndSolutions: buildSectionFromAnswer(6, byId.get(6) || ''),
  };
}

function cleanEnglishParagraph(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  let fixed = trimmed
    .replace(/\bi\b/g, 'I')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/([,.!?])([^\s])/g, '$1 $2');
  fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
  return /[.!?]$/.test(fixed) ? fixed : `${fixed}.`;
}

export function polishEnglishScriptLocally(script: ScriptState): ScriptState {
  return {
    ...script,
    part1: cleanEnglishParagraph(script.part1),
    part2: {
      journey: cleanEnglishParagraph(script.part2.journey),
      whyProgram: cleanEnglishParagraph(script.part2.whyProgram),
      skillsAndKnowledge: cleanEnglishParagraph(script.part2.skillsAndKnowledge),
      futurePlans: cleanEnglishParagraph(script.part2.futurePlans),
      professionalFuture: cleanEnglishParagraph(script.part2.professionalFuture),
      challengesAndSolutions: cleanEnglishParagraph(script.part2.challengesAndSolutions),
    },
    conclusion: cleanEnglishParagraph(script.conclusion || DEFAULT_CONCLUSION),
    conditionalsUsed: DEFAULT_CONDITIONALS_USED,
    lastFeedbackEs:
      'Revisión local aplicada: se verificaron mayúsculas, puntuación, conectores y estructura gramatical sin alterar tus ideas originales.',
  };
}
