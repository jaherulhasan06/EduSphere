import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  CalendarCheck2,
  Award,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  AlertTriangle,
  Trophy,
  User
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import {
  calculateLevelFromXP,
  CLASS_LEVELS,
  getSubjectsForClass,
  XP_RULES
} from '../../constants/curriculum';

// ============================================================================
// 1. Student Performance Analytics Page (/student/performance)
// ============================================================================
export const StudentPerformancePage: React.FC = () => {
  const { currentUser, quizAttempts, xpTransactions } = useEduSphere();
  if (!currentUser) return null;

  const myAttempts = quizAttempts.filter((a) => a.studentId === currentUser.id);
  const myXP = xpTransactions.filter((tx) => tx.userId === currentUser.id);

  // Build progression chart data (chronological order)
  const scoreHistoryData = [...myAttempts].reverse().map((att, idx) => ({
    attemptLabel: `#${idx + 1} ${att.topic.slice(0, 12)}`,
    percentage: att.percentage,
    subject: att.subject
  }));

  // Build subject comparison chart data
  const subjectMap = new Map<string, { total: number; count: number }>();
  myAttempts.forEach((att) => {
    const prev = subjectMap.get(att.subject) || { total: 0, count: 0 };
    subjectMap.set(att.subject, {
      total: prev.total + att.percentage,
      count: prev.count + 1
    });
  });

  const subjectChartData = Array.from(subjectMap.entries()).map(([subject, s]) => ({
    subject: subject.split(' ')[0],
    fullSubject: subject,
    averageScore: Math.round(s.total / s.count)
  }));

  // Explainable rule for Strong vs Weak topics
  const strongTopics: string[] = [];
  const weakTopics = new Set<string>();

  myAttempts.forEach((att) => {
    if (att.percentage >= 80 && !strongTopics.includes(att.topic)) {
      strongTopics.push(att.topic);
    }
    att.suggestedRevisionTopics.forEach((sub) => weakTopics.add(sub));
  });

  const overallAverage =
    myAttempts.length > 0
      ? Math.round(
          myAttempts.reduce((acc, item) => acc + item.percentage, 0) / myAttempts.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Explainable Performance Analytics · Class {currentUser.classNumber} ({currentUser.boardId})
          </div>
          <h1 className="text-2xl font-bold font-display mt-0.5">
            Academic Performance & Topic Mastery
          </h1>
          <p className="text-xs text-slate-500">
            Calculated directly from your saved practice quiz attempts and XP progression.
          </p>
        </div>
        <div className="text-right font-mono tabular-nums">
          <div className="text-xs text-slate-500">Overall Quiz Accuracy</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {overallAverage}% ({myAttempts.length} Attempts)
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Score History Line Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold font-display">Quiz Score Progression (%)</h2>
            <p className="text-xs text-slate-500">
              Chronological accuracy across completed practice quizzes
            </p>
          </div>
          {scoreHistoryData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="attemptLabel" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              Complete at least one practice quiz to populate your progression chart.
            </div>
          )}
        </div>

        {/* Subject Comparison Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold font-display">Subject-Wise Accuracy (%)</h2>
            <p className="text-xs text-slate-500">
              Mean score across subjects attempted by {currentUser.displayName}
            </p>
          </div>
          {subjectChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No subject comparison data yet.
            </div>
          )}
        </div>
      </div>

      {/* Strong vs Weak Topics Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Strong Topics (≥ 80% Accuracy)</span>
          </div>
          {strongTopics.length > 0 ? (
            <ul className="space-y-2 text-xs">
              {strongTopics.map((t) => (
                <li
                  key={t}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              Score 80% or higher on a practice quiz to add topics to your mastered list.
            </p>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Weak Subtopics Requiring Revision</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Rule: Subtopics where one or more questions were answered incorrectly across attempts.
          </p>
          {Array.from(weakTopics).length > 0 ? (
            <ul className="space-y-2 text-xs">
              {Array.from(weakTopics).map((wt) => (
                <li
                  key={wt}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium"
                >
                  {wt}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No weak subtopics identified.</p>
          )}
        </div>
      </div>

      {/* XP Activity Ledger */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-bold font-display">Verified XP Activity Ledger</h2>
        <div className="space-y-2 font-mono tabular-nums">
          {myXP.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <span className="font-sans font-medium">{tx.description}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                +{tx.points} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. Study Planner Page (/student/study-planner)
// ============================================================================
export const StudyPlannerPage: React.FC = () => {
  const {
    currentUser,
    studyTasks,
    quizAttempts,
    addStudyTask,
    toggleStudyTask,
    deleteStudyTask
  } = useEduSphere();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Quadratic Equations');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [filterView, setFilterView] = useState<'all' | 'pending' | 'completed'>('all');

  if (!currentUser) return null;

  const myTasks = studyTasks.filter((t) => t.studentId === currentUser.id);
  const filteredTasks = myTasks.filter((t) => {
    if (filterView === 'pending') return !t.completed;
    if (filterView === 'completed') return t.completed;
    return true;
  });

  // Weak subtopics from quiz attempts for 1-click recommendation scheduling
  const myAttempts = quizAttempts.filter((a) => a.studentId === currentUser.id);
  const weakSubtopics = Array.from(
    new Set(myAttempts.flatMap((a) => a.suggestedRevisionTopics))
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addStudyTask({ title, subject, topic, dueDate });
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Personalized Study Planner · +25 XP per Completed Task
        </div>
        <h1 className="text-2xl font-bold font-display">Daily & Weekly Study Tasks</h1>
        <p className="text-xs text-slate-500">
          Organize your syllabus revision and schedule recommended weak-topic follow-ups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Add Task Form & Weak Topic Suggestions */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleAdd}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h2 className="text-base font-bold font-display">Add New Study Task</h2>

            <div>
              <label className="block text-xs font-semibold mb-1">Task Description</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solve 15 numericals on Parallel Resistors"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  {getSubjectsForClass(currentUser.classNumber || 10).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Chapter / Subtopic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              + Schedule Study Task
            </button>
          </form>

          {/* Weak Topic Revision Recommendations */}
          {weakSubtopics.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Recommended Revision Tasks (From Quiz History)
              </div>
              <div className="space-y-2">
                {weakSubtopics.map((sub) => (
                  <div
                    key={sub}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="font-medium truncate">Revise: {sub}</span>
                    <button
                      onClick={() =>
                        addStudyTask({
                          title: `Focused Revision: ${sub}`,
                          subject: 'Science / Math',
                          topic: sub,
                          dueDate
                        })
                      }
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 rounded-md shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Task Checklist */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display">
              My Scheduled Tasks ({filteredTasks.length})
            </h2>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterView(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize ${
                    filterView === f
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleStudyTask(task.id, !task.completed)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-semibold ${
                          task.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                        {task.subject} · {task.topic} · Due {task.dueDate}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteStudyTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-500">
              No study tasks in this view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. Leaderboard Page (/student/leaderboard)
// ============================================================================
export const LeaderboardPage: React.FC = () => {
  const { users, currentUser } = useEduSphere();
  const [scope, setScope] = useState<'global' | 'my_class'>('global');

  const students = users
    .filter((u) => u.role === 'student')
    .filter((u) =>
      scope === 'my_class' && currentUser?.classNumber
        ? u.classNumber === currentUser.classNumber
        : true
    )
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Transparent Gamification & Standings
          </div>
          <h1 className="text-2xl font-bold font-display">Student XP Leaderboard</h1>
          <p className="text-xs text-slate-500">
            Displays public display names and XP only. Demo profiles are clearly labelled.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
          <button
            onClick={() => setScope('global')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
              scope === 'global'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Classes (Global)
          </button>
          <button
            onClick={() => setScope('my_class')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
              scope === 'my_class'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Class {currentUser?.classNumber || 10} Only
          </button>
        </div>
      </div>

      {/* Transparent XP Rules Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 font-sans">Practice Quiz</div>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            +{XP_RULES.PRACTICE_QUIZ_BASE} XP (+{XP_RULES.PRACTICE_QUIZ_HIGH_SCORE_BONUS} Bonus)
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 font-sans">Live Quiz Participation</div>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            +{XP_RULES.LIVE_QUIZ_PARTICIPATION} XP
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 font-sans">Study Task Completed</div>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            +{XP_RULES.STUDY_TASK_COMPLETED} XP
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 font-sans">Saved AI Study Notes</div>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            +{XP_RULES.STUDY_NOTES_SAVED} XP
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <th className="py-3 pr-4 font-semibold">Rank</th>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Class & Board</th>
                <th className="py-3 px-4 font-semibold">Academic Rank</th>
                <th className="py-3 pl-4 font-semibold text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono tabular-nums">
              {students.map((st, idx) => {
                const lvl = calculateLevelFromXP(st.xp || 0);
                const isMe = st.id === currentUser?.id;
                return (
                  <tr
                    key={st.id}
                    className={
                      isMe
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }
                  >
                    <td className="py-3.5 pr-4 font-bold">#{idx + 1}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold">
                        {st.displayName} {isMe && '(You)'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {st.isDemo ? 'Demonstration Student Record' : 'Registered Student'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs text-slate-600 dark:text-slate-400">
                      Class {st.classNumber} · {st.boardId}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs">
                      Level {lvl.level} · {lvl.rankTitle}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {st.xp || 0} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. Shared Profile Page (/student/profile & /teacher/profile)
// ============================================================================
export const ProfilePage: React.FC = () => {
  const { currentUser, boards, updateCurrentUserProfile } = useEduSphere();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [classNumber, setClassNumber] = useState(currentUser?.classNumber || 10);
  const [boardId, setBoardId] = useState(currentUser?.boardId || 'CBSE');
  const [learningGoal, setLearningGoal] = useState(currentUser?.learningGoal || '');
  const [qualifications, setQualifications] = useState(currentUser?.qualifications || '');
  const [institution, setInstitution] = useState(currentUser?.institution || '');
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCurrentUserProfile({
        displayName,
        classNumber,
        boardId,
        learningGoal,
        qualifications,
        institution
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold font-display">Profile & Preferences</h1>
            <p className="text-xs text-slate-500">
              {currentUser.email} · Role: {currentUser.role.toUpperCase()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          {currentUser.role === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Class Level</label>
                  <select
                    value={classNumber}
                    onChange={(e) => setClassNumber(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    {CLASS_LEVELS.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Education Board</label>
                  <select
                    value={boardId}
                    onChange={(e) => setBoardId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
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
                <label className="block text-xs font-semibold mb-1">Academic Goal</label>
                <input
                  type="text"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </>
          )}

          {currentUser.role === 'teacher' && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1">Qualifications</label>
                <input
                  type="text"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
