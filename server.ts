import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  BoardConfig,
  CommunityQuestion,
  ContentReport,
  LiveQuizRoom,
  QuizAttemptAnswerDetail,
  QuizAttemptRecord,
  QuizItem,
  SavedNote,
  StudyTask,
  SubjectCurriculum,
  TeacherResource,
  UserProfile,
  XPTransaction
} from './src/types/edusphere.js';
import {
  calculateLevelFromXP,
  DEFAULT_BOARDS,
  INITIAL_CURRICULUM_DATA,
  XP_RULES
} from './src/constants/curriculum.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Initial Seeded Server State (Realistic CBSE / SEBA / ICSE School Data)
// ============================================================================

const users: UserProfile[] = [
  {
    id: 'demo-student-1',
    displayName: 'Aarav Sharma',
    email: 'aarav.student@edusphere.demo',
    role: 'student',
    status: 'active',
    isDemo: true,
    classNumber: 10,
    boardId: 'CBSE',
    subjects: ['Mathematics', 'Science (Combined)', 'English', 'Computer Science'],
    learningGoal: 'Score 95%+ in Class 10 Board Examinations',
    xp: 640,
    level: 3,
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'demo-student-2',
    displayName: 'Ananya Baruah',
    email: 'ananya.seba@edusphere.demo',
    role: 'student',
    status: 'active',
    isDemo: true,
    classNumber: 10,
    boardId: 'SEBA',
    subjects: ['Mathematics', 'Advanced Mathematics (SEBA)', 'General Science', 'English'],
    learningGoal: 'Distinction in SEBA HSLC Examination',
    xp: 820,
    level: 4,
    createdAt: '2026-09-05T10:00:00Z'
  },
  {
    id: 'demo-student-3',
    displayName: 'Rohan Nair',
    email: 'rohan.icse@edusphere.demo',
    role: 'student',
    status: 'active',
    isDemo: true,
    classNumber: 10,
    boardId: 'ICSE',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    learningGoal: 'Master Analytical Physics & Calculus Foundations',
    xp: 540,
    level: 3,
    createdAt: '2026-09-10T11:30:00Z'
  },
  {
    id: 'demo-student-4',
    displayName: 'Priya Hazarika',
    email: 'priya.student@edusphere.demo',
    role: 'student',
    status: 'active',
    isDemo: true,
    classNumber: 12,
    boardId: 'CBSE',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
    learningGoal: 'Class 12 Board & Engineering Entrance Readiness',
    xp: 910,
    level: 4,
    createdAt: '2026-09-12T09:15:00Z'
  },
  {
    id: 'demo-teacher-1',
    displayName: 'Dr. Meera Krishnan',
    email: 'meera.teacher@edusphere.demo',
    role: 'teacher',
    status: 'active',
    isDemo: true,
    qualifications: 'M.Sc. Physics, B.Ed., Ph.D. (Science Education)',
    institution: 'Delhi Public School / Senior Academic Mentor',
    experienceYears: 12,
    subjects: ['Physics', 'Science (Combined)', 'Mathematics'],
    verificationStatus: 'approved',
    certificateFileName: 'Meera_Krishnan_MSc_BEd_Certificate.pdf',
    certificateType: 'Postgraduate & B.Ed. Degree Certificate',
    certificateUploadedAt: '2026-09-02T14:20:00Z',
    reviewedBy: 'demo-admin-1',
    reviewNotes: 'Credentials verified against national educator registry.',
    createdAt: '2026-09-02T14:00:00Z'
  },
  {
    id: 'demo-teacher-2',
    displayName: 'Prof. Bhaskar Jyoti Kalita',
    email: 'bhaskar.teacher@edusphere.demo',
    role: 'teacher',
    status: 'active',
    isDemo: true,
    qualifications: 'M.Sc. Mathematics, B.Ed. (Gauhati University)',
    institution: 'Cotton Collegiate Govt. HS School',
    experienceYears: 8,
    subjects: ['Mathematics', 'Advanced Mathematics (SEBA)'],
    verificationStatus: 'pending',
    certificateFileName: 'Bhaskar_Kalita_GU_BEd_Certificate.pdf',
    certificateType: 'University Degree & Teaching License',
    certificateUploadedAt: '2026-11-12T16:45:00Z',
    createdAt: '2026-11-12T16:30:00Z'
  },
  {
    id: 'demo-admin-1',
    displayName: 'Vikramaditya Sen (Platform Admin)',
    email: 'admin@edusphere.demo',
    role: 'admin',
    status: 'active',
    isDemo: true,
    createdAt: '2026-08-15T08:00:00Z'
  }
];

const boards: BoardConfig[] = [...DEFAULT_BOARDS];
const curriculum: SubjectCurriculum[] = [...INITIAL_CURRICULUM_DATA];

const quizzes: QuizItem[] = [
  {
    id: 'quiz-cbse-10-quad',
    creatorId: 'demo-teacher-1',
    creatorName: 'Dr. Meera Krishnan',
    creatorRole: 'teacher',
    title: 'Quadratic Equations & Nature of Roots Mastery',
    classNumber: 10,
    boardId: 'CBSE',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    difficulty: 'medium',
    durationSeconds: 300,
    createdAt: '2026-11-10T10:00:00Z',
    questions: [
      {
        id: 'q-quad-1',
        question: 'What is the discriminant (D = b² - 4ac) of the quadratic equation 3x² - 2x + 1/3 = 0?',
        options: ['0', '4', '-4', '8'],
        correctAnswerIndex: 0,
        explanation: 'Here a = 3, b = -2, c = 1/3. Discriminant D = (-2)² - 4(3)(1/3) = 4 - 4 = 0, so the roots are real and equal.',
        subtopic: 'Discriminant & Nature of Roots'
      },
      {
        id: 'q-quad-2',
        question: 'For what positive value of k does the equation x² + kx + 64 = 0 have real and equal roots?',
        options: ['8', '16', '32', '12'],
        correctAnswerIndex: 1,
        explanation: 'For equal roots, D = k² - 4(1)(64) = 0 ⇒ k² = 256 ⇒ k = 16.',
        subtopic: 'Equal Roots Condition'
      },
      {
        id: 'q-quad-3',
        question: 'If α and β are the roots of x² - 5x + 6 = 0, what is the value of α² + β²?',
        options: ['11', '13', '17', '25'],
        correctAnswerIndex: 1,
        explanation: 'Sum α + β = 5 and product αβ = 6. Thus α² + β² = (α + β)² - 2αβ = 25 - 12 = 13.',
        subtopic: 'Symmetric Functions of Roots'
      },
      {
        id: 'q-quad-4',
        question: 'Which of the following equations is NOT a quadratic equation upon simplification?',
        options: [
          '(x + 1)² = 2(x - 3)',
          'x² - 2x = (-2)(3 - x)',
          '(x - 2)(x + 1) = (x - 1)(x + 3)',
          'x³ - x² = (x - 1)³'
        ],
        correctAnswerIndex: 2,
        explanation: 'Expanding (x - 2)(x + 1) = (x - 1)(x + 3) yields x² - x - 2 = x² + 2x - 3, where x² cancels out.',
        subtopic: 'Standard Quadratic Form'
      }
    ]
  },
  {
    id: 'quiz-sci-10-elec',
    creatorId: 'demo-teacher-1',
    creatorName: 'Dr. Meera Krishnan',
    creatorRole: 'teacher',
    title: 'Electricity, Ohm’s Law & Circuit Analysis',
    classNumber: 10,
    boardId: 'CBSE',
    subject: 'Science (Combined)',
    topic: 'Electricity & Ohm’s Law',
    difficulty: 'medium',
    durationSeconds: 300,
    createdAt: '2026-11-11T12:00:00Z',
    questions: [
      {
        id: 'q-elec-1',
        question: 'Three resistors of 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their equivalent resistance?',
        options: ['11 Ω', '1 Ω', '0.5 Ω', '3 Ω'],
        correctAnswerIndex: 1,
        explanation: '1/R_p = 1/2 + 1/3 + 1/6 = (3 + 2 + 1)/6 = 1 Ω⁻¹ ⇒ R_p = 1 Ω.',
        subtopic: 'Parallel Combination of Resistors'
      },
      {
        id: 'q-elec-2',
        question: 'A cylindrical wire of resistance R is stretched to double its original length (keeping volume constant). What is its new resistance?',
        options: ['2R', '4R', 'R/2', '8R'],
        correctAnswerIndex: 1,
        explanation: 'When length L doubles at constant volume, cross-sectional area A halves. R_new = ρ(2L)/(A/2) = 4R.',
        subtopic: 'Resistivity & Wire Geometry'
      },
      {
        id: 'q-elec-3',
        question: 'How is an ammeter connected in an electric circuit and what is its internal resistance characteristic?',
        options: [
          'Connected in parallel; very high resistance',
          'Connected in series; very low resistance',
          'Connected in parallel; very low resistance',
          'Connected in series; infinite resistance'
        ],
        correctAnswerIndex: 1,
        explanation: 'An ammeter is connected in series with low resistance so it does not alter the current being measured.',
        subtopic: 'Circuit Instruments'
      },
      {
        id: 'q-elec-4',
        question: '1 kilowatt-hour (1 commercial unit of electrical energy) equals how many Joules?',
        options: ['3.6 × 10⁵ J', '3.6 × 10⁶ J', '1000 J', '6.0 × 10⁶ J'],
        correctAnswerIndex: 1,
        explanation: '1 kWh = 1000 W × 3600 s = 3.6 × 10⁶ Joules.',
        subtopic: 'Electrical Energy & Power'
      }
    ]
  }
];

const quizAttempts: QuizAttemptRecord[] = [
  {
    id: 'attempt-seed-1',
    studentId: 'demo-student-1',
    quizId: 'quiz-cbse-10-quad',
    quizTitle: 'Quadratic Equations & Nature of Roots Mastery',
    classNumber: 10,
    boardId: 'CBSE',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    score: 4,
    totalQuestions: 4,
    percentage: 100,
    xpEarned: 80,
    createdAt: '2026-11-11T15:30:00Z',
    suggestedRevisionTopics: [],
    answers: [
      {
        questionId: 'q-quad-1',
        questionText: 'What is the discriminant (D = b² - 4ac) of the quadratic equation 3x² - 2x + 1/3 = 0?',
        selectedOptionIndex: 0,
        correctOptionIndex: 0,
        isCorrect: true,
        explanation: 'Here a = 3, b = -2, c = 1/3. Discriminant D = 0.',
        subtopic: 'Discriminant & Nature of Roots'
      },
      {
        questionId: 'q-quad-2',
        questionText: 'For what positive value of k does the equation x² + kx + 64 = 0 have real and equal roots?',
        selectedOptionIndex: 1,
        correctOptionIndex: 1,
        isCorrect: true,
        explanation: 'k = 16.',
        subtopic: 'Equal Roots Condition'
      },
      {
        questionId: 'q-quad-3',
        questionText: 'If α and β are the roots of x² - 5x + 6 = 0, what is the value of α² + β²?',
        selectedOptionIndex: 1,
        correctOptionIndex: 1,
        isCorrect: true,
        explanation: 'α² + β² = 13.',
        subtopic: 'Symmetric Functions of Roots'
      },
      {
        questionId: 'q-quad-4',
        questionText: 'Which of the following equations is NOT a quadratic equation upon simplification?',
        selectedOptionIndex: 2,
        correctOptionIndex: 2,
        isCorrect: true,
        explanation: 'x² cancels out.',
        subtopic: 'Standard Quadratic Form'
      }
    ]
  },
  {
    id: 'attempt-seed-2',
    studentId: 'demo-student-1',
    quizId: 'quiz-sci-10-elec',
    quizTitle: 'Electricity, Ohm’s Law & Circuit Analysis',
    classNumber: 10,
    boardId: 'CBSE',
    subject: 'Science (Combined)',
    topic: 'Electricity & Ohm’s Law',
    score: 2,
    totalQuestions: 4,
    percentage: 50,
    xpEarned: 50,
    createdAt: '2026-11-12T17:15:00Z',
    suggestedRevisionTopics: ['Resistivity & Wire Geometry', 'Electrical Energy & Power'],
    answers: [
      {
        questionId: 'q-elec-1',
        questionText: 'Three resistors of 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their equivalent resistance?',
        selectedOptionIndex: 1,
        correctOptionIndex: 1,
        isCorrect: true,
        explanation: '1/R_p = 1/2 + 1/3 + 1/6 = 1 Ω.',
        subtopic: 'Parallel Combination of Resistors'
      },
      {
        questionId: 'q-elec-2',
        questionText: 'A cylindrical wire of resistance R is stretched to double its original length (keeping volume constant). What is its new resistance?',
        selectedOptionIndex: 0,
        correctOptionIndex: 1,
        isCorrect: false,
        explanation: 'When length L doubles at constant volume, cross-sectional area A halves, so R becomes 4R.',
        subtopic: 'Resistivity & Wire Geometry'
      },
      {
        questionId: 'q-elec-3',
        questionText: 'How is an ammeter connected in an electric circuit and what is its internal resistance characteristic?',
        selectedOptionIndex: 1,
        correctOptionIndex: 1,
        isCorrect: true,
        explanation: 'Connected in series with very low resistance.',
        subtopic: 'Circuit Instruments'
      },
      {
        questionId: 'q-elec-4',
        questionText: '1 kilowatt-hour (1 commercial unit of electrical energy) equals how many Joules?',
        selectedOptionIndex: 0,
        correctOptionIndex: 1,
        isCorrect: false,
        explanation: '1 kWh = 3.6 × 10⁶ Joules.',
        subtopic: 'Electrical Energy & Power'
      }
    ]
  }
];

const savedNotes: SavedNote[] = [
  {
    id: 'note-seed-1',
    studentId: 'demo-student-1',
    title: 'Electricity & Ohm’s Law — Class 10 (CBSE) Board Exam Revision Sheet',
    classNumber: 10,
    boardId: 'CBSE',
    subject: 'Science (Combined)',
    topic: 'Electricity & Ohm’s Law',
    format: 'exam_revision',
    createdAt: '2026-11-12T18:00:00Z',
    content: {
      topicTitle: 'Electricity & Ohm’s Law — Class 10 (CBSE) Board Exam Revision Sheet',
      shortSummary:
        'Ohm’s Law states that the electric current (I) flowing through a metallic conductor is directly proportional to the potential difference (V) across its ends at constant temperature (V = I·R).',
      importantDefinitions: [
        { term: 'Ohm’s Law', definition: 'At constant temperature, V = I × R where R is resistance in Ohms (Ω).' },
        { term: 'Resistivity (ρ)', definition: 'Resistance of a conductor of unit length and unit cross-sectional area (SI unit: Ω·m).' },
        { term: 'Joule’s Law of Heating', definition: 'Heat produced in a resistor is H = I²Rt.' }
      ],
      mainConcepts: [
        {
          heading: 'Resistivity & Wire Stretching',
          explanation: 'R = ρ(L/A). If a wire is stretched to n times its original length at constant volume, its new resistance becomes n²R.'
        },
        {
          heading: 'Series vs Parallel Combinations',
          explanation: 'Series: R_s = R₁ + R₂ + R₃ (same current I). Parallel: 1/R_p = 1/R₁ + 1/R₂ + 1/R₃ (same potential difference V).'
        }
      ],
      keyPoints: [
        'Ammeter is always connected in series; Voltmeter is always connected in parallel.',
        '1 kWh = 3.6 × 10⁶ Joules (Commercial unit of electrical energy).',
        'Alloys like Nichrome have high resistivity and do not oxidize readily at high temperatures.'
      ],
      examples: [
        'A 20 Ω lamp and 4 Ω resistor in series across a 6V battery have R_total = 24 Ω and I = 6/24 = 0.25 A.'
      ],
      revisionSection: [
        'Verify whether resistors are in series or parallel before computing total circuit current.',
        'Convert milliamperes (mA) to Amperes (× 10⁻³) and kilowatts to Watts before substituting.'
      ],
      practiceQuestions: [
        {
          question: 'Why are domestic electrical appliances connected in parallel rather than in series?',
          hint: 'Consider independent switch operation, identical 220V voltage supply, and fault isolation.'
        }
      ]
    }
  }
];

const questions: CommunityQuestion[] = [
  {
    id: 'q-comm-1',
    studentId: 'demo-student-1',
    studentName: 'Aarav Sharma',
    classNumber: 10,
    boardId: 'CBSE',
    subject: 'Science (Combined)',
    title: 'Why does resistance become 4R instead of 2R when a wire is stretched to double its length?',
    description:
      'In my practice quiz on Electricity, I thought doubling the length L in R = ρ(L/A) would simply double the resistance to 2R. Why is the correct answer 4R when the wire is stretched?',
    status: 'answered',
    createdAt: '2026-11-12T18:20:00Z',
    answers: [
      {
        id: 'ans-comm-1',
        questionId: 'q-comm-1',
        teacherId: 'demo-teacher-1',
        teacherName: 'Dr. Meera Krishnan',
        teacherQualifications: 'M.Sc. Physics, B.Ed., Ph.D. (Verified Educator)',
        content:
          'Great conceptual question, Aarav! Notice the word "stretched". When a solid metal wire is stretched to twice its length (L\' = 2L), the total volume of the metal (V = Area × Length) stays constant.\n\n1. Since Volume V = A × L = A\' × L\', if L\' = 2L, the new cross-sectional area must become half: A\' = A / 2 (the wire becomes thinner).\n2. Now substitute both L\' and A\' into the resistance formula:\n   R\' = ρ (L\' / A\') = ρ (2L / (A / 2)) = 4 × ρ (L / A) = 4R.\n\nIn general, if a wire is stretched to n times its length, its new resistance is n²R. If instead a question says "another wire of double length and same cross-section", only then is it 2R!',
        resourceTitle: 'CBSE Class 10 Electricity Formula & Wire Stretching Sheet',
        resourceUrl: '/student/ai-notes',
        helpfulCount: 14,
        helpfulVoterIds: ['demo-student-2', 'demo-student-3'],
        createdAt: '2026-11-12T19:05:00Z'
      }
    ],
    followUps: [
      {
        id: 'fu-comm-1',
        questionId: 'q-comm-1',
        studentId: 'demo-student-1',
        teacherId: 'demo-teacher-1',
        senderId: 'demo-student-1',
        senderName: 'Aarav Sharma',
        senderRole: 'student',
        content: 'Thank you Ma’am! Does the resistivity (ρ) of the copper wire also change when it is stretched?',
        createdAt: '2026-11-12T19:20:00Z'
      },
      {
        id: 'fu-comm-2',
        questionId: 'q-comm-1',
        studentId: 'demo-student-1',
        teacherId: 'demo-teacher-1',
        senderId: 'demo-teacher-1',
        senderName: 'Dr. Meera Krishnan',
        senderRole: 'teacher',
        content: 'No, resistivity (ρ) depends ONLY on the nature of the material (copper) and temperature. Stretching changes dimensions (L and A), so resistance R changes, but resistivity ρ remains unchanged!',
        createdAt: '2026-11-12T19:28:00Z'
      }
    ]
  },
  {
    id: 'q-comm-2',
    studentId: 'demo-student-2',
    studentName: 'Ananya Baruah',
    classNumber: 10,
    boardId: 'SEBA',
    subject: 'Advanced Mathematics (SEBA)',
    title: 'How to prove sin²θ + cos²θ = 1 geometrically for SEBA HSLC examination?',
    description:
      'For the SEBA Class 10 examination, do we need to state the Pythagoras theorem steps explicitly for a right-angled triangle in the geometric proof of sin²θ + cos²θ = 1?',
    status: 'open',
    createdAt: '2026-11-13T09:30:00Z',
    answers: [],
    followUps: []
  },
  {
    id: 'q-comm-3',
    studentId: 'demo-student-3',
    studentName: 'Rohan Nair',
    classNumber: 10,
    boardId: 'ICSE',
    subject: 'Physics',
    title: 'Difference between Total Internal Reflection and ordinary reflection at a plane mirror',
    description:
      'In ICSE Class 10 Physics (Refraction of Light), why is an image formed by Total Internal Reflection inside a prism brighter than one formed by a silvered plane mirror?',
    status: 'answered',
    createdAt: '2026-11-13T11:10:00Z',
    answers: [
      {
        id: 'ans-comm-2',
        questionId: 'q-comm-3',
        teacherId: 'demo-teacher-1',
        teacherName: 'Dr. Meera Krishnan',
        teacherQualifications: 'M.Sc. Physics, B.Ed., Ph.D. (Verified Educator)',
        content:
          'In Total Internal Reflection (TIR), 100% of the incident light energy is reflected back into the denser medium once the angle of incidence exceeds the critical angle. By contrast, a silvered plane mirror absorbs roughly 5–10% of incident light and its silver coating can tarnish over time. That is why periscopes and binoculars use right-angled isosceles glass prisms.',
        helpfulCount: 9,
        helpfulVoterIds: ['demo-student-1'],
        createdAt: '2026-11-13T12:00:00Z'
      }
    ],
    followUps: []
  }
];

const studyTasks: StudyTask[] = [
  {
    id: 'task-seed-1',
    studentId: 'demo-student-1',
    title: 'Revise Resistivity & Wire Stretching Numericals (Weak Topic Follow-up)',
    subject: 'Science (Combined)',
    topic: 'Resistivity & Wire Geometry',
    dueDate: '2026-11-15',
    completed: false,
    isRecommended: true,
    createdAt: '2026-11-12T17:20:00Z'
  },
  {
    id: 'task-seed-2',
    studentId: 'demo-student-1',
    title: 'Practice 10 kWh & Joule’s Heating Law Problems',
    subject: 'Science (Combined)',
    topic: 'Electrical Energy & Power',
    dueDate: '2026-11-16',
    completed: false,
    isRecommended: true,
    createdAt: '2026-11-12T17:21:00Z'
  },
  {
    id: 'task-seed-3',
    studentId: 'demo-student-1',
    title: 'Complete NCERT Exercise 4.3 on Quadratic Formula',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    dueDate: '2026-11-14',
    completed: true,
    isRecommended: false,
    xpAwarded: true,
    createdAt: '2026-11-10T09:00:00Z'
  }
];

const teacherResources: TeacherResource[] = [
  {
    id: 'res-seed-1',
    teacherId: 'demo-teacher-1',
    teacherName: 'Dr. Meera Krishnan',
    title: 'Complete Class 10 Electricity & Magnetic Effects Formula Sheet',
    description: 'High-yield formula sheet covering Ohm’s Law, Series/Parallel derivations, Joule’s Heating, and Fleming’s Rules for CBSE, SEBA, and ICSE.',
    classNumber: 10,
    boardId: 'CBSE',
    subject: 'Science (Combined)',
    resourceType: 'formula_sheet',
    content: `1. Electric Current: I = Q / t (Unit: Ampere, A)\n2. Potential Difference: V = W / Q (Unit: Volt, V)\n3. Ohm's Law: V = I · R (Unit of R: Ohm, Ω)\n4. Resistivity: R = ρ (L / A); under wire stretching to n·L, R_new = n²·R\n5. Series Combination: R_s = R₁ + R₂ + R₃\n6. Parallel Combination: 1/R_p = 1/R₁ + 1/R₂ + 1/R₃\n7. Electric Power: P = V·I = I²R = V²/R (Unit: Watt, W)\n8. Commercial Energy: 1 kWh = 3.6 × 10⁶ Joules`,
    createdAt: '2026-11-08T10:00:00Z'
  },
  {
    id: 'res-seed-2',
    teacherId: 'demo-teacher-1',
    teacherName: 'Dr. Meera Krishnan',
    title: 'Quadratic Equations & Trigonometric Identities Step-Marking Guide',
    description: 'Board examiner checklist showing how marks are awarded for each intermediate step in 3-mark and 5-mark Mathematics questions.',
    classNumber: 10,
    boardId: 'CBSE',
    subject: 'Mathematics',
    resourceType: 'guide',
    content: `Step 1 (0.5 Mark): Write the standard form ax² + bx + c = 0 and state a, b, c.\nStep 2 (1.0 Mark): Compute the Discriminant D = b² - 4ac accurately.\nStep 3 (0.5 Mark): State the nature of roots based on the sign of D.\nStep 4 (1.0 Mark): Substitute into x = (-b ± √D) / (2a) and simplify both roots clearly.`,
    createdAt: '2026-11-09T14:30:00Z'
  }
];

const xpTransactions: XPTransaction[] = [
  {
    id: 'xp-seed-1',
    userId: 'demo-student-1',
    activityType: 'practice_quiz',
    referenceId: 'attempt-seed-1',
    points: 80,
    description: 'Completed Quadratic Equations Mastery Quiz (100%)',
    createdAt: '2026-11-11T15:30:00Z'
  },
  {
    id: 'xp-seed-2',
    userId: 'demo-student-1',
    activityType: 'practice_quiz',
    referenceId: 'attempt-seed-2',
    points: 50,
    description: 'Completed Electricity & Ohm’s Law Quiz',
    createdAt: '2026-11-12T17:15:00Z'
  },
  {
    id: 'xp-seed-3',
    userId: 'demo-student-1',
    activityType: 'study_task',
    referenceId: 'task-seed-3',
    points: 25,
    description: 'Completed Study Task: NCERT Exercise 4.3',
    createdAt: '2026-11-11T19:00:00Z'
  }
];

const liveRooms: LiveQuizRoom[] = [
  {
    id: 'room-seed-1',
    roomCode: 'ED1042',
    roomName: 'National Class 10 Science & Math Rapid Challenge',
    hostId: 'demo-teacher-1',
    hostName: 'Dr. Meera Krishnan',
    hostRole: 'teacher',
    quizId: 'quiz-sci-10-elec',
    quizTitle: 'Electricity, Ohm’s Law & Circuit Analysis',
    subject: 'Science (Combined)',
    classNumber: 10,
    boardId: 'CBSE',
    questionDurationSeconds: 30,
    status: 'waiting',
    currentQuestionIndex: 0,
    questions: quizzes[1].questions,
    createdAt: '2026-11-13T20:00:00Z',
    participants: [
      {
        id: 'part-seed-1',
        roomId: 'room-seed-1',
        userId: 'demo-student-2',
        displayName: 'Ananya Baruah',
        score: 0,
        correctCount: 0,
        answeredQuestionIndices: [],
        joinedAt: '2026-11-13T20:02:00Z'
      },
      {
        id: 'part-seed-2',
        roomId: 'room-seed-1',
        userId: 'demo-student-3',
        displayName: 'Rohan Nair',
        score: 0,
        correctCount: 0,
        answeredQuestionIndices: [],
        joinedAt: '2026-11-13T20:03:00Z'
      }
    ]
  }
];

const reports: ContentReport[] = [
  {
    id: 'rep-seed-1',
    reporterId: 'demo-student-1',
    reporterName: 'Aarav Sharma',
    targetType: 'question',
    targetId: 'q-comm-2',
    targetTitleOrExcerpt: 'Duplicate board exam rumor check — flagged for moderator verification',
    reason: 'Needs verification whether proof is required in new SEBA blueprint',
    status: 'pending',
    createdAt: '2026-11-13T14:00:00Z'
  }
];

// Helper to award XP idempotently
function awardXP(
  userId: string,
  activityType: XPTransaction['activityType'],
  referenceId: string,
  points: number,
  description: string
): number {
  const existing = xpTransactions.find(
    (tx) => tx.userId === userId && tx.activityType === activityType && tx.referenceId === referenceId
  );
  if (existing) {
    return 0; // Prevent duplicate XP awards for the same completed activity
  }

  xpTransactions.unshift({
    id: `xp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    activityType,
    referenceId,
    points,
    description,
    createdAt: new Date().toISOString()
  });

  const user = users.find((u) => u.id === userId);
  if (user) {
    user.xp = (user.xp || 0) + points;
    user.level = calculateLevelFromXP(user.xp).level;
  }

  return points;
}

// ============================================================================
// Server & WebSocket Initialization
// ============================================================================

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // WebSocket Server for Live Quiz Arena real-time updates
  const wss = new WebSocketServer({ server, path: '/ws' });
  const roomClients = new Map<string, Set<WebSocket>>();

  function broadcastRoomUpdate(roomCode: string, eventType: string, room: LiveQuizRoom) {
    const cleanCode = roomCode.toUpperCase();
    const payload = JSON.stringify({
      type: eventType,
      roomCode: cleanCode,
      room,
      timestamp: new Date().toISOString()
    });

    // Send to room subscribers and global listeners
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'subscribe_room' && typeof msg.roomCode === 'string') {
          const code = msg.roomCode.toUpperCase();
          if (!roomClients.has(code)) {
            roomClients.set(code, new Set());
          }
          roomClients.get(code)!.add(ws);
          const room = liveRooms.find((r) => r.roomCode.toUpperCase() === code);
          if (room) {
            ws.send(JSON.stringify({ type: 'room:state', roomCode: code, room }));
          }
        }
      } catch {
        // Ignore malformed socket message
      }
    });

    ws.on('close', () => {
      roomClients.forEach((set) => set.delete(ws));
    });
  });

  // --------------------------------------------------------------------------
  // API Routes
  // --------------------------------------------------------------------------

  app.get('/api/state', (_req, res) => {
    res.json({
      users,
      boards,
      curriculum,
      quizzes,
      quizAttempts,
      savedNotes,
      questions,
      studyTasks,
      teacherResources,
      xpTransactions,
      liveRooms,
      reports
    });
  });

  // Auth: Register Student or Teacher (Never allow public Admin creation)
  app.post('/api/auth/register', (req, res) => {
    const {
      displayName,
      email,
      role,
      classNumber,
      boardId,
      subjects,
      learningGoal,
      qualifications,
      institution,
      experienceYears,
      certificateFileName,
      certificateType
    } = req.body;

    if (!displayName || !email) {
      res.status(400).json({ error: 'Display name and email are required.' });
      return;
    }

    if (role === 'admin') {
      res.status(403).json({
        error: 'Security Policy: Administrator accounts cannot be created via public registration.'
      });
      return;
    }

    const existing = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const safeRole = role === 'teacher' ? 'teacher' : 'student';
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      displayName: String(displayName).trim(),
      email: String(email).trim(),
      role: safeRole,
      status: 'active',
      isDemo: false,
      createdAt: new Date().toISOString(),
      ...(safeRole === 'student'
        ? {
            classNumber: Number(classNumber) || 10,
            boardId: boardId || 'CBSE',
            subjects: Array.isArray(subjects) && subjects.length > 0 ? subjects : ['Mathematics', 'Science (Combined)'],
            learningGoal: learningGoal || 'Master Board Syllabus',
            xp: 100,
            level: 1
          }
        : {
            qualifications: qualifications || 'B.Ed., Subject Specialist',
            institution: institution || 'Independent Educator',
            experienceYears: Number(experienceYears) || 2,
            subjects: Array.isArray(subjects) && subjects.length > 0 ? subjects : ['Mathematics'],
            verificationStatus: 'pending',
            certificateFileName: certificateFileName || 'Qualification_Certificate.pdf',
            certificateType: certificateType || 'Teaching Qualification Certificate',
            certificateUploadedAt: new Date().toISOString()
          })
    };

    users.push(newUser);
    res.status(201).json({ user: newUser });
  });

  // Update User Profile or Teacher Verification Certificate
  app.patch('/api/profile/:userId', (req, res) => {
    const { userId } = req.params;
    const user = users.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const {
      displayName,
      classNumber,
      boardId,
      subjects,
      learningGoal,
      qualifications,
      institution,
      experienceYears,
      certificateFileName,
      certificateType
    } = req.body;

    // Never allow client to mutate role or verificationStatus directly here
    if (displayName) user.displayName = String(displayName).trim();
    if (user.role === 'student') {
      if (classNumber) user.classNumber = Number(classNumber);
      if (boardId) user.boardId = String(boardId);
      if (Array.isArray(subjects)) user.subjects = subjects;
      if (learningGoal !== undefined) user.learningGoal = String(learningGoal);
    } else if (user.role === 'teacher') {
      if (qualifications) user.qualifications = String(qualifications);
      if (institution !== undefined) user.institution = String(institution);
      if (experienceYears !== undefined) user.experienceYears = Number(experienceYears);
      if (Array.isArray(subjects)) user.subjects = subjects;
      if (certificateFileName) {
        user.certificateFileName = String(certificateFileName);
        user.certificateType = String(certificateType || 'Qualification Document');
        user.certificateUploadedAt = new Date().toISOString();
        if (user.verificationStatus === 'rejected' || user.verificationStatus === 'resubmit_requested') {
          user.verificationStatus = 'pending';
        }
      }
    }

    res.json({ user });
  });

  // Save AI Study Notes
  app.post('/api/notes', (req, res) => {
    const { studentId, title, classNumber, boardId, subject, topic, format, content } = req.body;
    if (!studentId || !title || !content) {
      res.status(400).json({ error: 'Missing required note fields.' });
      return;
    }

    const note: SavedNote = {
      id: `note-${Date.now()}`,
      studentId,
      title,
      classNumber: Number(classNumber) || 10,
      boardId: boardId || 'CBSE',
      subject: subject || 'Science',
      topic: topic || title,
      format: format || 'comprehensive',
      content,
      createdAt: new Date().toISOString()
    };

    savedNotes.unshift(note);
    const xpEarned = awardXP(
      studentId,
      'study_notes',
      note.id,
      XP_RULES.STUDY_NOTES_SAVED,
      `Saved Study Notes: ${topic}`
    );

    res.status(201).json({ note, xpEarned, user: users.find((u) => u.id === studentId) });
  });

  app.delete('/api/notes/:noteId', (req, res) => {
    const idx = savedNotes.findIndex((n) => n.id === req.params.noteId);
    if (idx === -1) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }
    savedNotes.splice(idx, 1);
    res.json({ deleted: true });
  });

  // Create Quiz (Student practice quiz or Teacher custom quiz)
  app.post('/api/quizzes', (req, res) => {
    const {
      creatorId,
      title,
      classNumber,
      boardId,
      subject,
      topic,
      difficulty,
      durationSeconds,
      questions: quizQuestions
    } = req.body;

    const creator = users.find((u) => u.id === creatorId);
    if (!creator) {
      res.status(403).json({ error: 'Authenticated creator required.' });
      return;
    }

    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      res.status(400).json({ error: 'Quiz must contain at least one question.' });
      return;
    }

    const newQuiz: QuizItem = {
      id: `quiz-${Date.now()}`,
      creatorId: creator.id,
      creatorName: creator.displayName,
      creatorRole: creator.role,
      title: title || `${topic} Assessment`,
      classNumber: Number(classNumber) || 10,
      boardId: boardId || 'CBSE',
      subject: subject || 'Mathematics',
      topic: topic || 'Core Concept',
      difficulty: difficulty || 'medium',
      durationSeconds: Number(durationSeconds) || 300,
      questions: quizQuestions,
      createdAt: new Date().toISOString()
    };

    quizzes.unshift(newQuiz);
    res.status(201).json({ quiz: newQuiz });
  });

  // Authoritative Quiz Attempt Submission & Scoring
  app.post('/api/quizzes/:quizId/submit', (req, res) => {
    const { quizId } = req.params;
    const { studentId, selectedAnswers } = req.body as {
      studentId: string;
      selectedAnswers: Record<string, number>;
    };

    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }

    if (!studentId || !selectedAnswers || typeof selectedAnswers !== 'object') {
      res.status(400).json({ error: 'Invalid submission payload.' });
      return;
    }

    let score = 0;
    const weakSubtopics = new Set<string>();
    const details: QuizAttemptAnswerDetail[] = quiz.questions.map((q) => {
      const selected =
        typeof selectedAnswers[q.id] === 'number' ? selectedAnswers[q.id] : -1;
      const correctIdx = typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0;
      const isCorrect = selected === correctIdx;
      if (isCorrect) {
        score += 1;
      } else {
        weakSubtopics.add(q.subtopic || quiz.topic);
      }
      return {
        questionId: q.id,
        questionText: q.question,
        selectedOptionIndex: selected,
        correctOptionIndex: correctIdx,
        isCorrect,
        explanation: q.explanation,
        subtopic: q.subtopic || quiz.topic
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const basePoints =
      XP_RULES.PRACTICE_QUIZ_BASE +
      (percentage >= 80 ? XP_RULES.PRACTICE_QUIZ_HIGH_SCORE_BONUS : 0);

    // Award XP once per unique quizId per student to prevent XP farming
    const xpEarned = awardXP(
      studentId,
      'practice_quiz',
      quiz.id,
      basePoints,
      `Completed Quiz: ${quiz.title} (${percentage}%)`
    );

    const attempt: QuizAttemptRecord = {
      id: `attempt-${Date.now()}`,
      studentId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      classNumber: quiz.classNumber,
      boardId: quiz.boardId,
      subject: quiz.subject,
      topic: quiz.topic,
      score,
      totalQuestions,
      percentage,
      xpEarned,
      answers: details,
      suggestedRevisionTopics: Array.from(weakSubtopics),
      createdAt: new Date().toISOString()
    };

    quizAttempts.unshift(attempt);

    res.status(201).json({
      attempt,
      user: users.find((u) => u.id === studentId)
    });
  });

  // Live Quiz Arena: Create Room
  app.post('/api/live-rooms', (req, res) => {
    const { hostId, roomName, quizId, questionDurationSeconds } = req.body;
    const host = users.find((u) => u.id === hostId);
    if (!host) {
      res.status(403).json({ error: 'Authenticated host required.' });
      return;
    }

    // Verified teacher restriction check
    if (host.role === 'teacher' && host.verificationStatus !== 'approved') {
      res.status(403).json({
        error: 'Teacher verification is pending or not approved. Only verified teachers can host official teacher competitions.'
      });
      return;
    }

    const quiz = quizzes.find((q) => q.id === quizId) || quizzes[0];
    if (!quiz) {
      res.status(404).json({ error: 'Selected quiz not found.' });
      return;
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const roomCode = `ED${randomDigits}`;

    const newRoom: LiveQuizRoom = {
      id: `room-${Date.now()}`,
      roomCode,
      roomName: (roomName || `${quiz.topic} Live Challenge`).trim(),
      hostId: host.id,
      hostName: host.displayName,
      hostRole: host.role,
      quizId: quiz.id,
      quizTitle: quiz.title,
      subject: quiz.subject,
      classNumber: quiz.classNumber,
      boardId: quiz.boardId,
      questionDurationSeconds: Number(questionDurationSeconds) || 30,
      status: 'waiting',
      currentQuestionIndex: 0,
      questions: quiz.questions,
      participants:
        host.role === 'student'
          ? [
              {
                id: `part-${Date.now()}`,
                roomId: `room-${Date.now()}`,
                userId: host.id,
                displayName: host.displayName,
                score: 0,
                correctCount: 0,
                answeredQuestionIndices: [],
                joinedAt: new Date().toISOString()
              }
            ]
          : [],
      createdAt: new Date().toISOString()
    };

    liveRooms.unshift(newRoom);
    broadcastRoomUpdate(roomCode, 'room:created', newRoom);
    res.status(201).json({ room: newRoom });
  });

  // Live Quiz Arena: Join Room
  app.post('/api/live-rooms/:roomCode/join', (req, res) => {
    const code = req.params.roomCode.toUpperCase().trim();
    const { userId, displayName } = req.body;
    const room = liveRooms.find((r) => r.roomCode.toUpperCase() === code);
    if (!room) {
      res.status(404).json({ error: `No Live Quiz Room found with code "${code}".` });
      return;
    }

    if (room.status === 'finished' || room.status === 'cancelled') {
      res.status(400).json({ error: `Room ${code} has already ${room.status}.` });
      return;
    }

    let participant = room.participants.find((p) => p.userId === userId);
    if (!participant) {
      participant = {
        id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        roomId: room.id,
        userId,
        displayName: displayName || 'Student Participant',
        score: 0,
        correctCount: 0,
        answeredQuestionIndices: [],
        joinedAt: new Date().toISOString()
      };
      room.participants.push(participant);
      broadcastRoomUpdate(code, 'participant:joined', room);
    }

    res.json({ room, participant });
  });

  // Live Quiz Arena: Host Room Control (Start, Next Question, Finish, Cancel)
  app.post('/api/live-rooms/:roomCode/control', (req, res) => {
    const code = req.params.roomCode.toUpperCase().trim();
    const { hostId, action } = req.body as {
      hostId: string;
      action: 'start' | 'next' | 'finish' | 'cancel';
    };

    const room = liveRooms.find((r) => r.roomCode.toUpperCase() === code);
    if (!room) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }

    const caller = users.find((u) => u.id === hostId);
    if (room.hostId !== hostId && caller?.role !== 'admin') {
      res.status(403).json({ error: 'Only the room host can control the live quiz.' });
      return;
    }

    if (action === 'start') {
      room.status = 'active';
      room.currentQuestionIndex = 0;
      room.questionStartedAt = new Date().toISOString();
      broadcastRoomUpdate(code, 'quiz:started', room);
    } else if (action === 'next') {
      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex += 1;
        room.questionStartedAt = new Date().toISOString();
        broadcastRoomUpdate(code, 'question:changed', room);
      } else {
        room.status = 'finished';
        room.participants.forEach((p) => {
          awardXP(
            p.userId,
            'live_quiz_participation',
            room.id,
            XP_RULES.LIVE_QUIZ_PARTICIPATION,
            `Completed Live Quiz Arena: ${room.roomName}`
          );
        });
        broadcastRoomUpdate(code, 'quiz:finished', room);
      }
    } else if (action === 'finish') {
      room.status = 'finished';
      room.participants.forEach((p) => {
        awardXP(
          p.userId,
          'live_quiz_participation',
          room.id,
          XP_RULES.LIVE_QUIZ_PARTICIPATION,
          `Completed Live Quiz Arena: ${room.roomName}`
        );
      });
      broadcastRoomUpdate(code, 'quiz:finished', room);
    } else if (action === 'cancel') {
      room.status = 'cancelled';
      broadcastRoomUpdate(code, 'quiz:cancelled', room);
    }

    res.json({ room });
  });

  // Live Quiz Arena: Authoritative Answer Submission
  app.post('/api/live-rooms/:roomCode/answer', (req, res) => {
    const code = req.params.roomCode.toUpperCase().trim();
    const { userId, questionIndex, selectedOptionIndex } = req.body as {
      userId: string;
      questionIndex: number;
      selectedOptionIndex: number;
    };

    const room = liveRooms.find((r) => r.roomCode.toUpperCase() === code);
    if (!room) {
      res.status(404).json({ error: 'Live room not found.' });
      return;
    }

    if (room.status !== 'active') {
      res.status(400).json({ error: 'Room is not currently active for answer submissions.' });
      return;
    }

    if (questionIndex !== room.currentQuestionIndex) {
      res.status(400).json({ error: 'Late or out-of-sync question submission rejected.' });
      return;
    }

    let participant = room.participants.find((p) => p.userId === userId);
    if (!participant) {
      const u = users.find((usr) => usr.id === userId);
      participant = {
        id: `part-${Date.now()}`,
        roomId: room.id,
        userId,
        displayName: u?.displayName || 'Participant',
        score: 0,
        correctCount: 0,
        answeredQuestionIndices: [],
        joinedAt: new Date().toISOString()
      };
      room.participants.push(participant);
    }

    // Prevent duplicate submission for the same question
    if (participant.answeredQuestionIndices.includes(questionIndex)) {
      res.status(409).json({ error: 'You have already submitted an answer for this question.' });
      return;
    }

    participant.answeredQuestionIndices.push(questionIndex);
    const currentQuestion = room.questions[questionIndex];
    const isCorrect = currentQuestion.correctAnswerIndex === selectedOptionIndex;

    let pointsAwarded = 0;
    if (isCorrect) {
      pointsAwarded = 100;
      participant.score += pointsAwarded;
      participant.correctCount += 1;
      awardXP(
        userId,
        'live_quiz_correct',
        `${room.id}-q-${questionIndex}`,
        XP_RULES.LIVE_QUIZ_CORRECT_ANSWER,
        `Correct Live Quiz Answer in ${room.roomCode}`
      );
    }

    // Sort participants by score descending for authoritative leaderboard
    room.participants.sort((a, b) => b.score - a.score);
    broadcastRoomUpdate(code, 'leaderboard:updated', room);

    res.json({
      isCorrect,
      pointsAwarded,
      correctOptionIndex: currentQuestion.correctAnswerIndex,
      explanation: currentQuestion.explanation,
      room
    });
  });

  // Ask a Teacher: Create Public Question
  app.post('/api/questions', (req, res) => {
    const { studentId, classNumber, boardId, subject, title, description } = req.body;
    const student = users.find((u) => u.id === studentId);
    if (!student) {
      res.status(403).json({ error: 'Authenticated student required.' });
      return;
    }

    if (!title?.trim() || !description?.trim()) {
      res.status(400).json({ error: 'Question title and detailed description are required.' });
      return;
    }

    const newQ: CommunityQuestion = {
      id: `q-comm-${Date.now()}`,
      studentId: student.id,
      studentName: student.displayName,
      classNumber: Number(classNumber) || student.classNumber || 10,
      boardId: boardId || student.boardId || 'CBSE',
      subject: subject || 'Mathematics',
      title: String(title).trim(),
      description: String(description).trim(),
      status: 'open',
      answers: [],
      followUps: [],
      createdAt: new Date().toISOString()
    };

    questions.unshift(newQ);
    awardXP(
      student.id,
      'ask_question',
      newQ.id,
      XP_RULES.ASK_TEACHER_QUESTION,
      `Posted academic question: ${newQ.title}`
    );

    res.status(201).json({ question: newQ });
  });

  // Ask a Teacher: Post Official Teacher Answer (Verified Teachers Only)
  app.post('/api/questions/:questionId/answers', (req, res) => {
    const { questionId } = req.params;
    const { teacherId, content, resourceTitle, resourceUrl } = req.body;

    const teacher = users.find((u) => u.id === teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      res.status(403).json({ error: 'Only registered teachers can submit official answers.' });
      return;
    }

    if (teacher.verificationStatus !== 'approved') {
      res.status(403).json({
        error: 'Verification Restriction: Your teacher profile is currently pending approval. Only verified teachers can post official answers.'
      });
      return;
    }

    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }

    if (!content?.trim()) {
      res.status(400).json({ error: 'Explanation content cannot be empty.' });
      return;
    }

    const answer = {
      id: `ans-${Date.now()}`,
      questionId: question.id,
      teacherId: teacher.id,
      teacherName: teacher.displayName,
      teacherQualifications: teacher.qualifications || 'Verified Subject Educator',
      content: String(content).trim(),
      resourceTitle: resourceTitle ? String(resourceTitle).trim() : undefined,
      resourceUrl: resourceUrl ? String(resourceUrl).trim() : undefined,
      helpfulCount: 0,
      helpfulVoterIds: [],
      createdAt: new Date().toISOString()
    };

    question.answers.push(answer);
    if (question.status === 'open') {
      question.status = 'answered';
    }

    res.status(201).json({ question, answer });
  });

  // Mark Teacher Answer Helpful
  app.post('/api/questions/:questionId/answers/:answerId/helpful', (req, res) => {
    const { questionId, answerId } = req.params;
    const { userId } = req.body;
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }
    const answer = question.answers.find((a) => a.id === answerId);
    if (!answer) {
      res.status(404).json({ error: 'Answer not found.' });
      return;
    }

    if (!answer.helpfulVoterIds.includes(userId)) {
      answer.helpfulVoterIds.push(userId);
      answer.helpfulCount += 1;
    }
    res.json({ question });
  });

  // Permission-Controlled Private Follow-Up on a Question
  app.post('/api/questions/:questionId/followups', (req, res) => {
    const { questionId } = req.params;
    const { senderId, teacherId, content } = req.body;

    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }

    const sender = users.find((u) => u.id === senderId);
    if (!sender) {
      res.status(403).json({ error: 'Authenticated user required.' });
      return;
    }

    const isQuestionStudent = sender.id === question.studentId;
    const isVerifiedTeacher = sender.role === 'teacher' && sender.verificationStatus === 'approved';
    const isAdmin = sender.role === 'admin';

    if (!isQuestionStudent && !isVerifiedTeacher && !isAdmin) {
      res.status(403).json({
        error: 'Access Denied: Private follow-up discussions are restricted to the student who asked, verified participating teachers, and moderators.'
      });
      return;
    }

    const targetTeacherId =
      teacherId ||
      question.answers[0]?.teacherId ||
      (isVerifiedTeacher ? sender.id : 'demo-teacher-1');

    const followUp = {
      id: `fu-${Date.now()}`,
      questionId: question.id,
      studentId: question.studentId,
      teacherId: targetTeacherId,
      senderId: sender.id,
      senderName: sender.displayName,
      senderRole: sender.role,
      content: String(content).trim(),
      createdAt: new Date().toISOString()
    };

    question.followUps.push(followUp);
    res.status(201).json({ question, followUp });
  });

  // Report Content for Moderation
  app.post('/api/reports', (req, res) => {
    const { reporterId, targetType, targetId, reason } = req.body;
    const reporter = users.find((u) => u.id === reporterId);
    if (!reporter) {
      res.status(403).json({ error: 'Authenticated reporter required.' });
      return;
    }

    let excerpt = 'Reported community item';
    if (targetType === 'question') {
      const q = questions.find((item) => item.id === targetId);
      if (q) excerpt = q.title;
    } else {
      for (const q of questions) {
        const a = q.answers.find((ans) => ans.id === targetId);
        if (a) {
          excerpt = a.content.slice(0, 90);
          break;
        }
      }
    }

    const report: ContentReport = {
      id: `rep-${Date.now()}`,
      reporterId: reporter.id,
      reporterName: reporter.displayName,
      targetType: targetType === 'answer' ? 'answer' : 'question',
      targetId,
      targetTitleOrExcerpt: excerpt,
      reason: String(reason || 'Inappropriate or off-syllabus content').trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    reports.unshift(report);
    res.status(201).json({ report });
  });

  // Study Planner Tasks
  app.post('/api/study-tasks', (req, res) => {
    const { studentId, title, subject, topic, dueDate } = req.body;
    if (!studentId || !title?.trim()) {
      res.status(400).json({ error: 'Student ID and task title are required.' });
      return;
    }

    const task: StudyTask = {
      id: `task-${Date.now()}`,
      studentId,
      title: String(title).trim(),
      subject: subject || 'Mathematics',
      topic: topic || 'General Revision',
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      completed: false,
      isRecommended: false,
      createdAt: new Date().toISOString()
    };

    studyTasks.unshift(task);
    res.status(201).json({ task });
  });

  app.patch('/api/study-tasks/:taskId', (req, res) => {
    const task = studyTasks.find((t) => t.id === req.params.taskId);
    if (!task) {
      res.status(404).json({ error: 'Study task not found.' });
      return;
    }

    const { completed, title, dueDate } = req.body;
    let xpEarned = 0;
    if (typeof completed === 'boolean') {
      task.completed = completed;
      if (completed && !task.xpAwarded) {
        xpEarned = awardXP(
          task.studentId,
          'study_task',
          task.id,
          XP_RULES.STUDY_TASK_COMPLETED,
          `Completed Study Task: ${task.title}`
        );
        task.xpAwarded = true;
      }
    }
    if (title) task.title = String(title).trim();
    if (dueDate) task.dueDate = String(dueDate);

    res.json({
      task,
      xpEarned,
      user: users.find((u) => u.id === task.studentId)
    });
  });

  app.delete('/api/study-tasks/:taskId', (req, res) => {
    const idx = studyTasks.findIndex((t) => t.id === req.params.taskId);
    if (idx === -1) {
      res.status(404).json({ error: 'Study task not found.' });
      return;
    }
    studyTasks.splice(idx, 1);
    res.json({ deleted: true });
  });

  // Teacher Study Resources
  app.post('/api/teacher-resources', (req, res) => {
    const { teacherId, title, description, classNumber, boardId, subject, resourceType, content } = req.body;
    const teacher = users.find((u) => u.id === teacherId);
    if (!teacher || teacher.role !== 'teacher' || teacher.verificationStatus !== 'approved') {
      res.status(403).json({
        error: 'Only approved verified teachers can publish study materials.'
      });
      return;
    }

    const resource: TeacherResource = {
      id: `res-${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.displayName,
      title: String(title).trim(),
      description: String(description).trim(),
      classNumber: Number(classNumber) || 10,
      boardId: boardId || 'CBSE',
      subject: subject || 'Science',
      resourceType: resourceType || 'guide',
      content: String(content).trim(),
      createdAt: new Date().toISOString()
    };

    teacherResources.unshift(resource);
    res.status(201).json({ resource });
  });

  // Admin: Teacher Verification Approval / Rejection
  app.post('/api/admin/teacher-verification', (req, res) => {
    const { adminId, teacherId, status, reviewNotes } = req.body;
    const admin = users.find((u) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      res.status(403).json({ error: 'Administrator privileges required.' });
      return;
    }

    const teacher = users.find((u) => u.id === teacherId && u.role === 'teacher');
    if (!teacher) {
      res.status(404).json({ error: 'Teacher profile not found.' });
      return;
    }

    teacher.verificationStatus = status;
    teacher.reviewedBy = admin.displayName;
    teacher.reviewNotes = reviewNotes || `Status updated to ${status} by ${admin.displayName}`;

    res.json({ teacher });
  });

  // Admin: User Status Management
  app.post('/api/admin/users/:userId/status', (req, res) => {
    const { adminId, status } = req.body;
    const admin = users.find((u) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      res.status(403).json({ error: 'Administrator privileges required.' });
      return;
    }

    const target = users.find((u) => u.id === req.params.userId);
    if (!target) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    target.status = status === 'suspended' ? 'suspended' : 'active';
    res.json({ user: target });
  });

  // Admin: Content Moderation
  app.post('/api/admin/reports/:reportId/moderate', (req, res) => {
    const { adminId, action } = req.body as {
      adminId: string;
      action: 'remove_content' | 'dismiss';
    };
    const admin = users.find((u) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      res.status(403).json({ error: 'Administrator privileges required.' });
      return;
    }

    const report = reports.find((r) => r.id === req.params.reportId);
    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    report.moderatedBy = admin.displayName;
    if (action === 'remove_content') {
      report.status = 'resolved';
      report.moderationAction = 'Removed inappropriate content';
      if (report.targetType === 'question') {
        const q = questions.find((item) => item.id === report.targetId);
        if (q) q.status = 'reported';
      } else {
        questions.forEach((q) => {
          q.answers = q.answers.filter((a) => a.id !== report.targetId);
        });
      }
    } else {
      report.status = 'dismissed';
      report.moderationAction = 'Reviewed and dismissed report';
    }

    res.json({ report, questions });
  });

  // Admin: Curriculum Management (Add Board or Subject/Chapters)
  app.post('/api/admin/curriculum', (req, res) => {
    const { adminId, type, payload } = req.body;
    const admin = users.find((u) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      res.status(403).json({ error: 'Administrator privileges required.' });
      return;
    }

    if (type === 'board') {
      const newBoard: BoardConfig = {
        id: String(payload.id).toUpperCase().trim(),
        name: String(payload.name).trim(),
        fullName: String(payload.fullName).trim(),
        region: String(payload.region || 'India').trim(),
        description: String(payload.description || 'Configurable educational board').trim()
      };
      if (!boards.some((b) => b.id === newBoard.id)) {
        boards.push(newBoard);
      }
    } else if (type === 'subject') {
      const existing = curriculum.find(
        (c) =>
          c.boardId === payload.boardId &&
          c.classNumber === Number(payload.classNumber) &&
          c.name.toLowerCase() === String(payload.name).toLowerCase()
      );
      if (existing) {
        existing.chapters = Array.isArray(payload.chapters) ? payload.chapters : existing.chapters;
      } else {
        curriculum.push({
          id: `${payload.boardId.toLowerCase()}-${payload.classNumber}-${Date.now()}`,
          boardId: payload.boardId,
          classNumber: Number(payload.classNumber),
          name: String(payload.name).trim(),
          chapters: Array.isArray(payload.chapters) ? payload.chapters : []
        });
      }
    }

    res.json({ boards, curriculum });
  });

  // --------------------------------------------------------------------------
  // Vite Middleware (Development) or Static Serving (Production / Cloud Run)
  // --------------------------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`EduSphere AI Server & WebSocket Arena listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
