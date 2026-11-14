export type UserRole = 'student' | 'teacher' | 'admin';

export type TeacherVerificationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'resubmit_requested';

export type AccountStatus = 'active' | 'suspended';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  isDemo?: boolean;
  // Student fields
  classNumber?: number;
  boardId?: string;
  subjects?: string[];
  learningGoal?: string;
  xp?: number;
  level?: number;
  // Teacher fields
  qualifications?: string;
  institution?: string;
  experienceYears?: number;
  verificationStatus?: TeacherVerificationStatus;
  certificateFileName?: string;
  certificateType?: string;
  certificateUploadedAt?: string;
  reviewNotes?: string;
  reviewedBy?: string;
}

export interface BoardConfig {
  id: string;
  name: string;
  fullName: string;
  region: string;
  description: string;
}

export interface SubjectCurriculum {
  id: string;
  boardId: string;
  classNumber: number;
  name: string;
  chapters: string[];
}

export interface StructuredTutorResponse {
  topic: string;
  classNumber: number;
  subject: string;
  simpleExplanation: string;
  stepByStepBreakdown: string[];
  realWorldExample: string;
  importantPoints: string[];
  followUpQuestion: string;
  providerLabel: string;
}

export interface TutorMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  structured?: StructuredTutorResponse;
  timestamp: string;
}

export interface GeneratedNoteContent {
  topicTitle: string;
  shortSummary: string;
  importantDefinitions: { term: string; definition: string }[];
  mainConcepts: { heading: string; explanation: string }[];
  keyPoints: string[];
  examples: string[];
  revisionSection: string[];
  practiceQuestions: { question: string; hint: string }[];
}

export interface SavedNote {
  id: string;
  studentId: string;
  title: string;
  classNumber: number;
  boardId: string;
  subject: string;
  topic: string;
  format: 'comprehensive' | 'exam_revision' | 'flash_summary';
  content: GeneratedNoteContent;
  createdAt: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex?: number; // Present on server / after submission
  explanation: string;
  subtopic: string;
}

export interface QuizItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  title: string;
  classNumber: number;
  boardId: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationSeconds: number;
  questions: QuizQuestionItem[];
  createdAt: string;
}

export interface QuizAttemptAnswerDetail {
  questionId: string;
  questionText: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
  subtopic: string;
}

export interface QuizAttemptRecord {
  id: string;
  studentId: string;
  quizId: string;
  quizTitle: string;
  classNumber: number;
  boardId: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  xpEarned: number;
  answers: QuizAttemptAnswerDetail[];
  suggestedRevisionTopics: string[];
  createdAt: string;
}

export type LiveRoomStatus = 'waiting' | 'active' | 'finished' | 'cancelled';

export interface LiveParticipant {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  score: number;
  correctCount: number;
  answeredQuestionIndices: number[];
  joinedAt: string;
}

export interface LiveQuizRoom {
  id: string;
  roomCode: string;
  roomName: string;
  hostId: string;
  hostName: string;
  hostRole: UserRole;
  quizId: string;
  quizTitle: string;
  subject: string;
  classNumber: number;
  boardId: string;
  questionDurationSeconds: number;
  status: LiveRoomStatus;
  currentQuestionIndex: number;
  questionStartedAt?: string;
  questions: QuizQuestionItem[];
  participants: LiveParticipant[];
  createdAt: string;
}

export type QuestionStatus = 'open' | 'answered' | 'closed' | 'reported';

export interface TeacherAnswer {
  id: string;
  questionId: string;
  teacherId: string;
  teacherName: string;
  teacherQualifications: string;
  content: string;
  resourceTitle?: string;
  resourceUrl?: string;
  helpfulCount: number;
  helpfulVoterIds: string[];
  createdAt: string;
}

export interface PrivateFollowUpMessage {
  id: string;
  questionId: string;
  studentId: string;
  teacherId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  createdAt: string;
}

export interface CommunityQuestion {
  id: string;
  studentId: string;
  studentName: string;
  classNumber: number;
  boardId: string;
  subject: string;
  title: string;
  description: string;
  status: QuestionStatus;
  answers: TeacherAnswer[];
  followUps: PrivateFollowUpMessage[];
  createdAt: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'question' | 'answer';
  targetId: string;
  targetTitleOrExcerpt: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  moderatedBy?: string;
  moderationAction?: string;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  studentId: string;
  title: string;
  subject: string;
  topic: string;
  dueDate: string;
  completed: boolean;
  isRecommended?: boolean;
  xpAwarded?: boolean;
  createdAt: string;
}

export interface TeacherResource {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  classNumber: number;
  boardId: string;
  subject: string;
  resourceType: 'guide' | 'worksheet' | 'formula_sheet' | 'revision_notes';
  content: string;
  createdAt: string;
}

export interface XPTransaction {
  id: string;
  userId: string;
  activityType:
    | 'practice_quiz'
    | 'study_task'
    | 'live_quiz_participation'
    | 'live_quiz_correct'
    | 'ask_question'
    | 'study_notes';
  referenceId: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  classNumber: number;
  boardId: string;
  xp: number;
  level: number;
  quizzesCompleted: number;
  isDemoData: boolean;
}
