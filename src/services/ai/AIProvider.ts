import {
  GeneratedNoteContent,
  QuizQuestionItem,
  StructuredTutorResponse
} from '../../types/edusphere';

export interface TutorRequestParams {
  classNumber: number;
  boardId: string;
  subject: string;
  topic: string;
  userQuestion: string;
}

export interface NotesGenerationParams {
  classNumber: number;
  boardId: string;
  subject: string;
  topic: string;
  format: 'comprehensive' | 'exam_revision' | 'flash_summary';
}

export interface QuizGenerationParams {
  classNumber: number;
  boardId: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

/**
 * Replaceable AIProvider interface for EduSphere AI.
 * The UI interacts strictly with this interface so MockAIProvider
 * can be swapped with a production provider later without UI changes.
 */
export interface AIProvider {
  readonly providerName: string;
  readonly isDemoProvider: boolean;

  generateTutorResponse(params: TutorRequestParams): Promise<StructuredTutorResponse>;
  generateStudyNotes(params: NotesGenerationParams): Promise<GeneratedNoteContent>;
  generatePracticeQuiz(params: QuizGenerationParams): Promise<QuizQuestionItem[]>;
}
