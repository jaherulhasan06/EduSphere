import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Radio,
  Users,
  Trophy,
  Play,
  SkipForward,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Ban,
  Award
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { useToast } from '../../contexts/ToastContext';

export const LiveQuizRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const {
    currentUser,
    liveRooms,
    joinLiveRoom,
    controlLiveRoom,
    submitLiveRoomAnswer,
    subscribeToRoomRealtime,
    isSupabaseConnected
  } = useEduSphere();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cleanCode = (roomCode || 'ED1042').toUpperCase();
  const room = liveRooms.find((r) => r.roomCode.toUpperCase() === cleanCode);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [answerFeedback, setAnswerFeedback] = useState<{
    questionIndex: number;
    isCorrect: boolean;
    pointsAwarded: number;
    explanation: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number>(30);

  // Subscribe to WebSocket & Supabase Realtime on mount
  useEffect(() => {
    if (!cleanCode) return;
    subscribeToRoomRealtime(cleanCode);
    if (currentUser && room && !room.participants.some((p) => p.userId === currentUser.id)) {
      joinLiveRoom(cleanCode).catch(() => {});
    }
  }, [cleanCode, currentUser, room, joinLiveRoom, subscribeToRoomRealtime]);

  // Reset local selection when question index changes
  useEffect(() => {
    if (!room) return;
    setSelectedOption(null);
    setAnswerFeedback(null);
    setCountdown(room.questionDurationSeconds || 30);
  }, [room?.currentQuestionIndex, room?.status, room?.questionDurationSeconds]);

  // Countdown timer when room is active
  useEffect(() => {
    if (!room || room.status !== 'active') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [room?.status, room?.currentQuestionIndex]);

  if (!room) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <h1 className="text-xl font-bold font-display">
          Live Room &ldquo;{cleanCode}&rdquo; Not Found
        </h1>
        <p className="text-xs text-slate-500">
          Please check the 6-character room code or return to the Quiz Arena lobby.
        </p>
        <button
          onClick={() => navigate('/student/quiz-arena')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
        >
          Back to Quiz Arena
        </button>
      </div>
    );
  }

  const isHost =
    currentUser?.id === room.hostId ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'teacher';

  const myParticipant = room.participants.find((p) => p.userId === currentUser?.id);
  const hasAnsweredCurrent =
    myParticipant?.answeredQuestionIndices.includes(room.currentQuestionIndex) ||
    answerFeedback?.questionIndex === room.currentQuestionIndex;

  const currentQuestion = room.questions[room.currentQuestionIndex];

  const handleAnswerSubmit = async () => {
    if (selectedOption === null || hasAnsweredCurrent || submittingAnswer) return;
    setSubmittingAnswer(true);
    try {
      const res = await submitLiveRoomAnswer(
        room.roomCode,
        room.currentQuestionIndex,
        selectedOption
      );
      setAnswerFeedback({
        questionIndex: room.currentQuestionIndex,
        isCorrect: res.isCorrect,
        pointsAwarded: res.pointsAwarded,
        explanation: res.explanation
      });
    } catch (err) {
      showToast(
        'Submission Rejected',
        err instanceof Error ? err.message : 'Could not submit answer.',
        'error'
      );
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Room Status & Synchronization Transparency Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              ROOM CODE: {room.roomCode}
            </span>
            <span aria-hidden="true">·</span>
            <span>Host: {room.hostName}</span>
            <span aria-hidden="true">·</span>
            <span>
              Sync:{' '}
              {isSupabaseConnected
                ? 'Supabase Realtime + Server WebSocket'
                : 'Live WebSocket Server (Demo Environment)'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">{room.roomName}</h1>
        </div>

        {/* Host Control Bar */}
        {isHost && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {room.status === 'waiting' && (
              <button
                onClick={() => controlLiveRoom(room.roomCode, 'start')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Live Quiz</span>
              </button>
            )}
            {room.status === 'active' && (
              <>
                <button
                  onClick={() => controlLiveRoom(room.roomCode, 'next')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>
                    {room.currentQuestionIndex + 1 < room.questions.length
                      ? 'Next Question'
                      : 'Finish & Show Final Podium'}
                  </span>
                </button>
                <button
                  onClick={() => controlLiveRoom(room.roomCode, 'cancel')}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/50 rounded-lg"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Stage: Waiting Lobby, Active Question, or Final Results */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          {room.status === 'waiting' && (
            <div className="py-10 text-center space-y-5">
              <Radio className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold font-display">
                  Waiting for Host to Start the Quiz
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Share Room Code <strong className="font-mono">{room.roomCode}</strong> with classmates. {room.questions.length} questions · {room.questionDurationSeconds}s per question.
                </p>
              </div>
              {isHost && (
                <button
                  onClick={() => controlLiveRoom(room.roomCode, 'start')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Quiz Now for All Participants</span>
                </button>
              )}
            </div>
          )}

          {room.status === 'active' && currentQuestion && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 font-mono tabular-nums">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Question {room.currentQuestionIndex + 1} of {room.questions.length}
                </span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>{countdown}s remaining</span>
                </div>
              </div>

              <div className="text-lg font-bold leading-snug">
                {currentQuestion.question}
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={hasAnsweredCurrent || countdown === 0}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-4 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-100'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 disabled:opacity-60'
                      }`}
                    >
                      <span>
                        <strong className="font-mono mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </strong>
                        {option}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>

              {!hasAnsweredCurrent ? (
                <button
                  type="button"
                  disabled={selectedOption === null || submittingAnswer || countdown === 0}
                  onClick={handleAnswerSubmit}
                  className="w-full py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
                >
                  {submittingAnswer
                    ? 'Verifying Answer on Server...'
                    : countdown === 0
                    ? 'Time Expired for This Question'
                    : 'Lock In Answer'}
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  {answerFeedback ? (
                    <>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        {answerFeedback.isCorrect ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Correct! +{answerFeedback.pointsAwarded} Arena Points (+20 XP)
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Incorrect — 0 Points
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {answerFeedback.explanation}
                      </p>
                    </>
                  ) : (
                    <div className="text-xs font-semibold text-emerald-600">
                      Answer submitted and verified for Question {room.currentQuestionIndex + 1}. Waiting for next question...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {room.status === 'finished' && (
            <div className="space-y-6">
              <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
                <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
                <h2 className="text-2xl font-bold font-display">
                  Live Quiz Finished — Final Standings
                </h2>
                <p className="text-xs text-slate-500">
                  All participants earned +60 Participation XP plus +20 XP per correct answer.
                </p>
              </div>

              <div className="space-y-3">
                {room.participants.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono tabular-nums"
                  >
                    <div className="flex items-center gap-3 font-sans">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-bold">{p.displayName}</div>
                        <div className="text-xs text-slate-500">
                          {p.correctCount} / {room.questions.length} Correct Answers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                        {p.score} pts
                      </div>
                      <div className="text-[11px] text-emerald-600">
                        +{60 + p.correctCount * 20} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {room.status === 'cancelled' && (
            <div className="py-10 text-center space-y-3">
              <Ban className="w-8 h-8 text-rose-600 mx-auto" />
              <h2 className="text-lg font-bold font-display">
                This Live Quiz Room Was Cancelled by the Host
              </h2>
              <button
                onClick={() => navigate('/student/quiz-arena')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
              >
                Return to Quiz Arena
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Leaderboard & Participants */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold font-display">
                Live Leaderboard ({room.participants.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500 capitalize">{room.status}</span>
          </div>

          <div className="space-y-2.5 font-mono tabular-nums">
            {room.participants.map((p, index) => (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  p.userId === currentUser?.id
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 font-sans">
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    #{index + 1}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{p.displayName}</div>
                    <div className="text-[10px] text-slate-500">
                      {p.correctCount} correct
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {p.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
