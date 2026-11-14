import { BoardConfig, SubjectCurriculum } from '../types/edusphere';

export const DEFAULT_BOARDS: BoardConfig[] = [
  {
    id: 'CBSE',
    name: 'CBSE',
    fullName: 'Central Board of Secondary Education',
    region: 'National (India)',
    description: 'NCERT-aligned national curriculum across Classes 1–12 with structured competency focus.'
  },
  {
    id: 'SEBA',
    name: 'SEBA / AHSEC',
    fullName: 'Board of Secondary Education, Assam & AHSEC',
    region: 'Assam State Board',
    description: 'Assam state curriculum supporting HSLC (Classes 9–10), HS (11–12), and foundational classes.'
  },
  {
    id: 'ICSE',
    name: 'ICSE / ISC',
    fullName: 'Council for the Indian School Certificate Examinations',
    region: 'National (CISCE)',
    description: 'In-depth analytical curriculum with separate Physics, Chemistry, Biology, and Literature tracks.'
  },
  {
    id: 'IB',
    name: 'IB / IGCSE',
    fullName: 'International Baccalaureate & Cambridge IGCSE',
    region: 'International',
    description: 'Inquiry-based global curriculum adaptable for MYP, IGCSE, and Diploma students.'
  }
];

export const CLASS_LEVELS = Array.from({ length: 12 }, (_, idx) => idx + 1);

export const SUBJECTS_BY_STAGE: Record<string, string[]> = {
  primary: ['Mathematics', 'Environmental Studies (EVS)', 'English', 'General Science', 'Assamese / Regional Language'],
  middle: ['Mathematics', 'Science', 'Social Science', 'English', 'Computer Science', 'Assamese / Hindi'],
  secondary: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science (Combined)', 'History & Civics', 'Geography', 'English', 'Advanced Mathematics (SEBA)', 'Computer Science'],
  senior: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Accountancy', 'English Core']
};

export function getStageForClass(classNumber: number): 'primary' | 'middle' | 'secondary' | 'senior' {
  if (classNumber <= 5) return 'primary';
  if (classNumber <= 8) return 'middle';
  if (classNumber <= 10) return 'secondary';
  return 'senior';
}

export function getSubjectsForClass(classNumber: number): string[] {
  const stage = getStageForClass(classNumber);
  return SUBJECTS_BY_STAGE[stage];
}

export const INITIAL_CURRICULUM_DATA: SubjectCurriculum[] = [
  {
    id: 'cbse-10-math',
    boardId: 'CBSE',
    classNumber: 10,
    name: 'Mathematics',
    chapters: [
      'Real Numbers',
      'Polynomials',
      'Pair of Linear Equations in Two Variables',
      'Quadratic Equations',
      'Arithmetic Progressions',
      'Triangles & Similarity',
      'Coordinate Geometry',
      'Introduction to Trigonometry',
      'Surface Areas and Volumes',
      'Statistics & Probability'
    ]
  },
  {
    id: 'cbse-10-sci',
    boardId: 'CBSE',
    classNumber: 10,
    name: 'Science (Combined)',
    chapters: [
      'Chemical Reactions and Equations',
      'Acids, Bases and Salts',
      'Metals and Non-metals',
      'Carbon and its Compounds',
      'Life Processes',
      'Control and Coordination',
      'Light — Reflection and Refraction',
      'Electricity & Ohm’s Law',
      'Magnetic Effects of Electric Current'
    ]
  },
  {
    id: 'seba-10-math',
    boardId: 'SEBA',
    classNumber: 10,
    name: 'Mathematics',
    chapters: [
      'Real Numbers & Euclid Division Lemma',
      'Polynomials',
      'Quadratic Equations',
      'Trigonometric Ratios & Identities',
      'Circles and Tangents',
      'Areas Related to Circles',
      'Statistics & Cumulative Frequency'
    ]
  },
  {
    id: 'seba-10-advmath',
    boardId: 'SEBA',
    classNumber: 10,
    name: 'Advanced Mathematics (SEBA)',
    chapters: [
      'Sets and Relations',
      'Complex Numbers',
      'Arithmetic and Geometric Progressions',
      'Permutations and Combinations',
      'Plane Geometry & Theorems',
      'Coordinate Geometry of Straight Lines'
    ]
  },
  {
    id: 'icse-10-phys',
    boardId: 'ICSE',
    classNumber: 10,
    name: 'Physics',
    chapters: [
      'Force, Work, Power and Energy',
      'Refraction of Light at Plane Surfaces',
      'Sound & Resonance',
      'Current Electricity & Household Circuits',
      'Calorimetry & Latent Heat',
      'Radioactivity & Nuclear Energy'
    ]
  },
  {
    id: 'cbse-12-phys',
    boardId: 'CBSE',
    classNumber: 12,
    name: 'Physics',
    chapters: [
      'Electric Charges and Fields',
      'Electrostatic Potential and Capacitance',
      'Current Electricity & Kirchhoff Laws',
      'Moving Charges and Magnetism',
      'Electromagnetic Induction',
      'Ray Optics and Optical Instruments',
      'Wave Optics',
      'Semiconductor Electronics'
    ]
  },
  {
    id: 'cbse-8-sci',
    boardId: 'CBSE',
    classNumber: 8,
    name: 'Science',
    chapters: [
      'Crop Production and Management',
      'Microorganisms: Friend and Foe',
      'Combustion and Flame',
      'Force and Pressure',
      'Friction',
      'Chemical Effects of Electric Current',
      'Light & Human Eye'
    ]
  }
];

export const XP_RULES = {
  PRACTICE_QUIZ_BASE: 50,
  PRACTICE_QUIZ_HIGH_SCORE_BONUS: 30,
  STUDY_TASK_COMPLETED: 25,
  LIVE_QUIZ_PARTICIPATION: 60,
  LIVE_QUIZ_CORRECT_ANSWER: 20,
  STUDY_NOTES_SAVED: 15,
  ASK_TEACHER_QUESTION: 10
};

export function calculateLevelFromXP(xp: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  rankTitle: string;
} {
  // Each level requires 250 XP
  const threshold = 250;
  const level = Math.floor(xp / threshold) + 1;
  const currentLevelXP = xp % threshold;
  const nextLevelXP = threshold;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100));

  const titles = [
    'Curious Learner',
    'Concept Explorer',
    'Subject Scholar',
    'Problem Solver',
    'Quiz Challenger',
    'Academic Strategist',
    'Board Master',
    'Olympiad Vanguard',
    'EduSphere Fellow',
    'Grand Scholar'
  ];
  const rankTitle = titles[Math.min(level - 1, titles.length - 1)];

  return { level, currentLevelXP, nextLevelXP, progressPercent, rankTitle };
}
