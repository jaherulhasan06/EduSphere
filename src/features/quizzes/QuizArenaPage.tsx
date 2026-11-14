import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Trophy,
  Radio,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Plus,
  CalendarPlus
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { aiProvider } from '../../services/ai/MockAIProvider';
import { CLASS_LEVELS, getSubjectsForClass } from '../../constants/curriculum';
import { QuizAttemptRecord, QuizItem } from '../../types/edusphere';
import { useToast } from '../../contexts/ToastContext';

export const QuizArenaPage: React.FC = () => {
  const {
    currentUser,
    boards,
    quizzes,
    liveRooms,
    createQuiz,
    submitQuizAttempt,
    createLiveRoom,
    joinLiveRoom,
    addStudyTask
  } = useEduSphere();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Generator state
  const [classNumber, setClassNumber] = useState<number>(currentUser?.classNumber || 10);
  const [boardId, setBoardId] = useState<string>(currentUser?.boardId || 'CBSE');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [topic, setTopic] = useState<string>(
    searchParams.get('topic') || 'Quadratic Equations'
  );
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Active Quiz Attempt Runner State
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState<boolean>(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttemptRecord | null>(null);

  // Live Quiz Arena Join / Host State
  const [joinRoomCodeInput, setJoinRoomCodeInput] = useState<string>('ED1042');
  const [hostRoomName, setHostRoomName] = useState<string>('');
  const [hostSelectedQuizId, setHostSelectedQuizId] = useState<string>(
    quizzes[0]?.id || ''
  );
  const [hostQuestionDuration, setHostQuestionDuration] = useState<number>(30);

  const availableSubjects = getSubjectsForClass(classNumber);

  // Countdown timer during active practice quiz
  useEffect(() => {
    if (!activeQuiz || completedAttempt) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, completedAttempt]);

  const startPracticeQuiz = (quiz: QuizItem) => {
    setCompletedAttempt(null);
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setRemainingSeconds(quiz.durationSeconds || 300);
    setConfirmSubmitModal(false);
  };

  const handleGenerateAndStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Topic required', 'Please enter a topic for the quiz.', 'error');
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const generatedQuestions = await aiProvider.generatePracticeQuiz({
        classNumber,
        boardId,
        subject,
        topic,
        difficulty,
        questionCount
      });

      const createdQuiz = await createQuiz({
        title: `${topic} (${difficulty.toUpperCase()}) Practice Quiz`,
        classNumber,
        boardId,
        subject,
        topic,
        difficulty,
        durationSeconds: questionCount * 60,
        questions: generatedQuestions
      });

      startPracticeQuiz(createdQuiz);
    } catch (err) {
      showToast(
        'Quiz Generation Error',
        err instanceof Error ? err.message : 'Failed to generate quiz.',
        'error'
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleFinalSubmitQuiz = async () => {
    if (!activeQuiz || isSubmittingQuiz) return;
    setIsSubmittingQuiz(true);
    try {
      const attempt = await submitQuizAttempt(activeQuiz.id, selectedAnswers);
      setCompletedAttempt(attempt);
      setConfirmSubmitModal(false);
    } catch (err) {
      showToast(
        'Submission Error',
        err instanceof Error ? err.message : 'Failed to submit quiz.',
        'error'
      );
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleHostLiveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetQuizId = hostSelectedQuizId || quizzes[0]?.id;
    if (!targetQuizId) {
      showToast('Select a quiz', 'Please select a quiz to host.', 'error');
      return;
    }
    try {
      const room = await createLiveRoom({
        roomName: hostRoomName || `${ currentUser?.displayName || 'Student' }’s Live Arena`,
        quizId: targetQuizId,
        questionDurationSeconds: hostQuestionDuration
      });
      navigate(`/student/live-quiz/${room.roomCode}`);
    } catch (err) {
      showToast(
        'Could not create room',
        err instanceof Error ? err.message : 'Error creating room.',
        'error'
      );
    }
  };

  const handleJoinRoomByCode = async (code: string) => {
    if (!code.trim()) return;
    try {
      const room = await joinLiveRoom(code.trim());
      navigate(`/student/live-quiz/${room.roomCode}`);
    } catch (err) {
      showToast(
        'Cannot Join Room',
        err instanceof Error ? err.message : 'Invalid room code.',
        'error'
      );
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==========================================================================
  // VIEW 1: Results Screen (After Quiz Submission)
  // ==========================================================================
  if (activeQuiz && completedAttempt) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Practice Quiz Results · Server-Verified Score
              </div>
              <h1 className="text-2xl font-bold font-display mt-0.5">
                {completedAttempt.quizTitle}
              </h1>
            </div>
            <button
              onClick={() => {
                setActiveQuiz(null);
                setCompletedAttempt(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Quiz Arena</span>
            </button>
          </div>

          {/* Score Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono tabular-nums">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-sans">Total Score</div>
              <div className="text-2xl font-bold mt-1">
                {completedAttempt.score} / {completedAttempt.totalQuestions}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-sans">Percentage</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {completedAttempt.percentage}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-sans">Correct / Incorrect</div>
              <div className="text-2xl font-bold mt-1">
                <span className="text-emerald-600">{completedAttempt.score}</span> /{' '}
                <span className="text-rose-600">
                  {completedAttempt.totalQuestions - completedAttempt.score}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-sans">XP Awarded</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                +{completedAttempt.xpEarned} XP
              </div>
            </div>
          </div>

          {/* Suggested Revision Topics */}
          {completedAttempt.suggestedRevisionTopics.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2.5">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Suggested Revision Subtopics (Based on Missed Questions)
              </div>
              <div className="flex flex-wrap gap-2">
                {completedAttempt.suggestedRevisionTopics.map((sub) => (
                  <div
                    key={sub}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs"
                  >
                    <span className="font-medium">{sub}</span>
                    <button
                      onClick={() =>
                        addStudyTask({
                          title: `Revise ${sub} (${completedAttempt.subject})`,
                          subject: completedAttempt.subject,
                          topic: sub,
                          dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10)
                        })
                      }
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      title="Add to Study Planner"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Plan Revision</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question-by-Question Review & Explanations */}
          <div className="space-y-4">
            <h2 className="text-base font-bold font-display">
              Detailed Answer Key & Explanations
            </h2>
            {completedAttempt.answers.map((ans, index) => {
              const qObj = activeQuiz.questions.find((q) => q.id === ans.questionId);
              return (
                <div
                  key={ans.questionId}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-bold">
                      Q{index + 1}. {ans.questionText}
                    </div>
                    {ans.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 shrink-0">
                        <XCircle className="w-4 h-4" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>

                  {qObj && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {qObj.options.map((opt, optIdx) => {
                        const isCorrectOpt = optIdx === ans.correctOptionIndex;
                        const isSelectedOpt = optIdx === ans.selectedOptionIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`px-3 py-2 rounded-lg border ${
                              isCorrectOpt
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 font-semibold text-emerald-900 dark:text-emerald-200'
                                : isSelectedOpt
                                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <strong>Explanation:</strong> {ans.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 2: Active Practice Quiz Runner
  // ==========================================================================
  if (activeQuiz) {
    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalCount = activeQuiz.questions.length;
    const progressPct = Math.round(((currentQuestionIdx + 1) / totalCount) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          {/* Header & Timer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="text-xs text-slate-500">
                {activeQuiz.subject} · Class {activeQuiz.classNumber} ({activeQuiz.boardId})
              </div>
              <h1 className="text-lg font-bold font-display">{activeQuiz.title}</h1>
            </div>

            <div className="flex items-center gap-4 font-mono tabular-nums">
              <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                <Clock className="w-4 h-4" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>
              <span className="text-xs text-slate-500">
                Answered: {answeredCount}/{totalCount}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-500 font-mono tabular-nums">
              <span>
                Question {currentQuestionIdx + 1} of {totalCount}
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Question & Options (Never reveals correct answer before submission) */}
          <div className="space-y-4 py-2">
            <div className="text-base sm:text-lg font-bold leading-snug">
              {currentQuestionIdx + 1}. {currentQ.question}
            </div>

            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setSelectedAnswers((prev) => ({
                        ...prev,
                        [currentQ.id]: idx
                      }))
                    }
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-100'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span>
                      <strong className="font-mono mr-2">
                        {String.fromCharCode(65 + idx)}.
                      </strong>
                      {option}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation & Submit Confirmation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              {currentQuestionIdx < totalCount - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestionIdx((i) => Math.min(totalCount - 1, i + 1))
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmSubmitModal(true)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Review & Submit Quiz
                </button>
              )}
            </div>
          </div>

          {/* Submit Confirmation Box */}
          {confirmSubmitModal && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-300 dark:border-indigo-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs space-y-0.5">
                <div className="font-bold">Confirm Quiz Submission?</div>
                <div className="text-slate-500">
                  You have answered {answeredCount} of {totalCount} questions. Unanswered questions are marked incorrect.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitModal(false)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-800 rounded-lg"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  disabled={isSubmittingQuiz}
                  onClick={handleFinalSubmitQuiz}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg"
                >
                  {isSubmittingQuiz ? 'Scoring...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 3: Quiz Arena Hub (AI Quiz Generator + Practice Catalog + Live Multiplayer)
  // ==========================================================================
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Practice Quiz Generator */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo AI Quiz Generator</span>
            </div>
            <h1 className="text-xl font-bold font-display">Generate Custom Practice Quiz</h1>
            <p className="text-xs text-slate-500">
              Configure your syllabus topic, difficulty, and question count to start an instant timed assessment.
            </p>
          </div>

          <form onSubmit={handleGenerateAndStartQuiz} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Class</label>
                <select
                  value={classNumber}
                  onChange={(e) => setClassNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  {CLASS_LEVELS.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Board</label>
                <select
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Chapter or Topic</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quadratic Equations, Ohm’s Law, Trigonometry"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  <option value="easy">Easy (Foundational)</option>
                  <option value="medium">Medium (Board Level)</option>
                  <option value="hard">Hard (Olympiad / HOTS)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                >
                  <option value={3}>3 Questions</option>
                  <option value={4}>4 Questions</option>
                  <option value={5}>5 Questions</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGeneratingQuiz}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {isGeneratingQuiz ? 'Generating Quiz...' : 'Generate & Start Practice Quiz'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Quiz Arena Multiplayer Lobby & Teacher-Created Quizzes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Multiplayer Room Join & Host */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Real-Time Multiplayer Arena</span>
                </div>
                <h2 className="text-lg font-bold font-display">
                  Join or Host a Live Quiz Competition
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinRoomCodeInput}
                  onChange={(e) => setJoinRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="Room Code"
                  className="w-28 px-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
                <button
                  onClick={() => handleJoinRoomByCode(joinRoomCodeInput)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  Join by Code
                </button>
              </div>
            </div>

            {/* Active Rooms List */}
            <div className="space-y-2.5">
              {liveRooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {room.roomCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Host: {room.hostName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{room.participants.length} Participants</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{room.status}</span>
                    </div>
                    <div className="text-sm font-bold mt-0.5">{room.roomName}</div>
                  </div>
                  <button
                    onClick={() => handleJoinRoomByCode(room.roomCode)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
                  >
                    Enter Live Room
                  </button>
                </div>
              ))}
            </div>

            {/* Host a New Room Form */}
            <form
              onSubmit={handleHostLiveRoom}
              className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
            >
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Host New Room Name
                </label>
                <input
                  type="text"
                  value={hostRoomName}
                  onChange={(e) => setHostRoomName(e.target.value)}
                  placeholder="e.g. Class 10 Rapid Fire"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Select Quiz
                </label>
                <select
                  value={hostSelectedQuizId}
                  onChange={(e) => setHostSelectedQuizId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  + Create Room
                </button>
              </div>
            </form>
          </div>

          {/* Available Curated & Teacher-Published Practice Quizzes */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold font-display">
              Available Practice Quizzes ({quizzes.length})
            </h2>
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">
                      Class {quiz.classNumber} · {quiz.boardId} · {quiz.subject} ·{' '}
                      <span className="capitalize">{quiz.difficulty}</span> ·{' '}
                      <span className="font-mono">{quiz.questions.length} Qs</span>
                    </div>
                    <div className="text-sm font-bold">{quiz.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Created by {quiz.creatorName} ({quiz.creatorRole})
                    </div>
                  </div>
                  <button
                    onClick={() => startPracticeQuiz(quiz)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
                  >
                    Start Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
