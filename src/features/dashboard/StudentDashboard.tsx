import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  FileText,
  Trophy,
  Radio,
  MessageSquareText,
  CalendarCheck2,
  Award,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { calculateLevelFromXP } from '../../constants/curriculum';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    quizAttempts,
    studyTasks,
    liveRooms,
    savedNotes,
    toggleStudyTask,
    isDemoMode
  } = useEduSphere();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const studentAttempts = quizAttempts.filter((a) => a.studentId === currentUser.id);
  const studentTasks = studyTasks.filter((t) => t.studentId === currentUser.id);
  const studentNotes = savedNotes.filter((n) => n.studentId === currentUser.id);

  // Compute XP & Level
  const xpInfo = calculateLevelFromXP(currentUser.xp || 0);

  // Compute Leaderboard Position among all students
  const sortedStudents = users
    .filter((u) => u.role === 'student')
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const leaderboardRank =
    sortedStudents.findIndex((s) => s.id === currentUser.id) + 1 || 1;

  // Compute weak topics from actual quiz attempts (< 80% or missed subtopics)
  const weakTopicsSet = new Set<string>();
  studentAttempts.forEach((att) => {
    att.suggestedRevisionTopics.forEach((t) => weakTopicsSet.add(t));
  });
  const weakTopics = Array.from(weakTopicsSet);

  // Compute Subject Performance averages
  const subjectScoresMap = new Map<string, { totalPct: number; count: number }>();
  studentAttempts.forEach((att) => {
    const prev = subjectScoresMap.get(att.subject) || { totalPct: 0, count: 0 };
    subjectScoresMap.set(att.subject, {
      totalPct: prev.totalPct + att.percentage,
      count: prev.count + 1
    });
  });

  const subjectPerformance = Array.from(subjectScoresMap.entries()).map(
    ([subject, stats]) => ({
      subject,
      avgPercentage: Math.round(stats.totalPct / stats.count),
      attemptsCount: stats.count
    })
  );

  const completedTasksCount = studentTasks.filter((t) => t.completed).length;
  const dailyProgressPct =
    studentTasks.length > 0
      ? Math.round((completedTasksCount / studentTasks.length) * 100)
      : 50;

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Personalization Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Class {currentUser.classNumber} · {currentUser.boardId} Board
            </span>
            <span aria-hidden="true">·</span>
            <span>Goal: {currentUser.learningGoal || 'Board Exam Mastery'}</span>
            {isDemoMode && currentUser.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-600 dark:text-amber-400">
                  Demo Student Profile
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            Welcome back, {currentUser.displayName}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enrolled Subjects: {(currentUser.subjects || []).join(' · ')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/student/ai-tutor')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors whitespace-nowrap"
          >
            <Bot className="w-4 h-4" />
            <span>Open AI Tutor</span>
          </button>
          <button
            onClick={() => navigate('/student/quiz-arena')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap"
          >
            <Trophy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Practice Quiz</span>
          </button>
        </div>
      </div>

      {/* 2, 3, 4. Key Telemetry Strip: XP & Level, Leaderboard Position, Daily Task Progress, Quizzes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono tabular-nums">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>Current Level & XP</span>
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            Level {xpInfo.level} · {currentUser.xp || 0} XP
          </div>
          <div className="space-y-1 font-sans">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500"
                style={{ width: `${xpInfo.progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{xpInfo.rankTitle}</span>
              <span>
                {xpInfo.currentLevelXP}/{xpInfo.nextLevelXP} XP to Lvl {xpInfo.level + 1}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>Global Leaderboard Rank</span>
            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            #{leaderboardRank} of {sortedStudents.length}
          </div>
          <div className="text-xs text-slate-500 font-sans">
            <Link
              to="/student/leaderboard"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View Class & Board Standings →
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>Daily Study Plan Progress</span>
            <CalendarCheck2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {completedTasksCount}/{studentTasks.length} Tasks ({dailyProgressPct}%)
          </div>
          <div className="text-xs text-slate-500 font-sans">
            +25 XP awarded per completed study task
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>Quizzes & Saved Notes</span>
            <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {studentAttempts.length} Quizzes · {studentNotes.length} Notes
          </div>
          <div className="text-xs text-slate-500 font-sans">
            <Link
              to="/student/performance"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Inspect Analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* 5 & 6. Continue Learning & Personalized Recommended Revision Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display">
                Recommended Focus & Weak Subtopics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {studentAttempts.length > 0
                  ? 'Derived directly from missed questions in your recorded quiz attempts'
                  : 'Starter syllabus recommendations for your selected class and board'}
              </p>
            </div>
            <Link
              to="/student/ai-notes"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              Generate Notes →
            </Link>
          </div>

          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              {weakTopics.map((topic) => (
                <div
                  key={topic}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Flagged for Revision from Quiz Results</span>
                    </div>
                    <div className="text-sm font-bold">{topic}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        navigate(`/student/ai-tutor?topic=${encodeURIComponent(topic)}`)
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Ask AI Tutor
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/student/quiz-arena?topic=${encodeURIComponent(topic)}`)
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="text-sm font-semibold">No Weak Subtopics Flagged Yet</div>
              <p className="text-xs text-slate-500">
                Complete a practice quiz in the Quiz Arena to receive targeted revision recommendations.
              </p>
            </div>
          )}

          {/* Subject Performance Bars */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold font-display">Subject Accuracy Overview</h3>
            {subjectPerformance.length > 0 ? (
              <div className="space-y-3">
                {subjectPerformance.map((sp) => (
                  <div key={sp.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{sp.subject}</span>
                      <span className="font-mono tabular-nums font-semibold">
                        {sp.avgPercentage}% ({sp.attemptsCount} attempt
                        {sp.attemptsCount > 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          sp.avgPercentage >= 80
                            ? 'bg-emerald-600'
                            : sp.avgPercentage >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-600'
                        }`}
                        style={{ width: `${sp.avgPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No subject quiz attempts recorded yet for this account.
              </p>
            )}
          </div>
        </div>

        {/* 7 & 8. Upcoming Study Tasks & Live Quizzes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Live Quiz Arena Rooms */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold font-display">Live Quiz Arena Rooms</h2>
              </div>
              <Link
                to="/student/quiz-arena"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Host Room →
              </Link>
            </div>

            {liveRooms.length > 0 ? (
              <div className="space-y-3">
                {liveRooms.slice(0, 2).map((room) => (
                  <div
                    key={room.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500 font-mono tabular-nums">
                        {room.roomCode} · {room.participants.length} Joined ·{' '}
                        <span className="capitalize">{room.status}</span>
                      </div>
                      <div className="text-sm font-semibold truncate mt-0.5">
                        {room.roomName}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/student/live-quiz/${room.roomCode}`)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Join Room
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active live rooms right now.</p>
            )}
          </div>

          {/* Upcoming Study Tasks */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display">Upcoming Study Tasks</h2>
              <Link
                to="/student/study-planner"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage Planner →
              </Link>
            </div>

            {studentTasks.length > 0 ? (
              <div className="space-y-2.5">
                {studentTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                  >
                    <button
                      onClick={() => toggleStudyTask(task.id, !task.completed)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-semibold ${
                          task.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                        {task.subject} · Due {task.dueDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No study tasks scheduled yet. Add your first task in the Study Planner!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 10. Recent Quiz Results Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display">Recent Quiz Results</h2>
            <p className="text-xs text-slate-500">
              Authoritatively scored practice attempts for {currentUser.displayName}
            </p>
          </div>
          <Link
            to="/student/quiz-arena"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            New Practice Quiz →
          </Link>
        </div>

        {studentAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <th className="py-2.5 pr-4 font-semibold">Quiz Title</th>
                  <th className="py-2.5 px-4 font-semibold">Subject & Topic</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Score</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Accuracy</th>
                  <th className="py-2.5 pl-4 font-semibold text-right">XP Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {studentAttempts.slice(0, 5).map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-medium">{att.quizTitle}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {att.subject} · {att.topic}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {att.score}/{att.totalQuestions}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                      {att.percentage}%
                    </td>
                    <td className="py-3 pl-4 text-right font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      +{att.xpEarned} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No quiz attempts recorded yet. Start your first quiz in the Quiz Arena!
          </div>
        )}
      </div>
    </div>
  );
};
