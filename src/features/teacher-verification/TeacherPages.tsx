import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  MessageSquareText,
  PlusSquare,
  Radio,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { CLASS_LEVELS, getSubjectsForClass } from '../../constants/curriculum';
import { QuizQuestionItem } from '../../types/edusphere';
import { useToast } from '../../contexts/ToastContext';

// ============================================================================
// 1. Teacher Dashboard (/teacher/dashboard)
// ============================================================================
export const TeacherDashboardPage: React.FC = () => {
  const {
    currentUser,
    questions,
    quizzes,
    liveRooms,
    teacherResources,
    users,
    loginWithDemoAccount
  } = useEduSphere();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const isVerified = currentUser.verificationStatus === 'approved';
  const unansweredQuestions = questions.filter((q) => q.status === 'open');
  const myAnsweredQuestions = questions.filter((q) =>
    q.answers.some((a) => a.teacherId === currentUser.id)
  );
  const myQuizzes = quizzes.filter((q) => q.creatorId === currentUser.id);
  const myHostedRooms = liveRooms.filter((r) => r.hostId === currentUser.id);
  const myResources = teacherResources.filter((r) => r.teacherId === currentUser.id);

  const totalHelpfulVotes = questions
    .flatMap((q) => q.answers)
    .filter((a) => a.teacherId === currentUser.id)
    .reduce((sum, a) => sum + a.helpfulCount, 0);

  const otherDemoTeacher = users.find(
    (u) => u.role === 'teacher' && u.id !== currentUser.id
  );

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      <div
        className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isVerified
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Educator Status: APPROVED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>
                  Verification Status: {currentUser.verificationStatus?.toUpperCase()}
                </span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold font-display">
            {currentUser.displayName} — Educator Workspace
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {currentUser.qualifications} · {currentUser.institution}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {otherDemoTeacher && (
            <button
              onClick={() => loginWithDemoAccount('teacher', otherDemoTeacher.id)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Switch to {otherDemoTeacher.verificationStatus === 'pending' ? 'Pending' : 'Verified'} Teacher Demo
            </button>
          )}
          <button
            onClick={() => navigate('/teacher/verification')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Certificate & Verification
          </button>
        </div>
      </div>

      {/* Key Teacher Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-mono tabular-nums">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-xs text-slate-500 font-sans">Awaiting Answers</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {unansweredQuestions.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-xs text-slate-500 font-sans">Questions Answered</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {myAnsweredQuestions.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-xs text-slate-500 font-sans">Created Quizzes</div>
          <div className="text-2xl font-bold">{myQuizzes.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-xs text-slate-500 font-sans">Hosted Live Rooms</div>
          <div className="text-2xl font-bold">{myHostedRooms.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-xs text-slate-500 font-sans">Helpful Endorsements</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalHelpfulVotes}
          </div>
        </div>
      </div>

      {/* Unanswered Student Questions Queue */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display">
              Student Questions Awaiting Verified Explanations
            </h2>
            <p className="text-xs text-slate-500">
              Help students across CBSE, SEBA, and ICSE understand difficult concepts
            </p>
          </div>
          <Link
            to="/teacher/questions"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All Questions →
          </Link>
        </div>

        <div className="space-y-3">
          {questions.slice(0, 3).map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs text-slate-500">
                  Class {q.classNumber} · {q.boardId} · {q.subject} · Asked by {q.studentName}
                </div>
                <div className="text-sm font-bold mt-0.5">{q.title}</div>
              </div>
              <Link
                to={`/teacher/questions/${q.id}`}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
              >
                {q.answers.length > 0 ? 'View / Add Explanation' : 'Write Answer'}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Published Study Materials & Created Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display">My Created Quizzes</h2>
            <Link
              to="/teacher/create-quiz"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + Create Quiz
            </Link>
          </div>
          <div className="space-y-2.5">
            {myQuizzes.map((qz) => (
              <div
                key={qz.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold">{qz.title}</div>
                  <div className="text-slate-500 mt-0.5">
                    Class {qz.classNumber} · {qz.boardId} · {qz.questions.length} Questions
                  </div>
                </div>
                <Link
                  to="/teacher/host-quiz"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Host Live
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display">Published Study Materials</h2>
            <Link
              to="/teacher/resources"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + Publish Material
            </Link>
          </div>
          <div className="space-y-2.5">
            {myResources.map((res) => (
              <div
                key={res.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
              >
                <div className="font-bold">{res.title}</div>
                <div className="text-slate-500">
                  Class {res.classNumber} · {res.boardId} · {res.subject}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. Teacher Verification & Certificate Upload (/teacher/verification)
// ============================================================================
export const TeacherVerificationPage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useEduSphere();

  const [qualifications, setQualifications] = useState(
    currentUser?.qualifications || ''
  );
  const [institution, setInstitution] = useState(currentUser?.institution || '');
  const [certificateType, setCertificateType] = useState(
    currentUser?.certificateType || 'Postgraduate & B.Ed. Degree Certificate'
  );
  const [certificateFileName, setCertificateFileName] = useState(
    currentUser?.certificateFileName || ''
  );
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) return null;

  const handleSubmitCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateCurrentUserProfile({
        qualifications,
        institution,
        certificateType,
        certificateFileName:
          certificateFileName || `${currentUser.displayName.replace(/\s+/g, '_')}_Certificate.pdf`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Educator Credential Verification & Private Document Storage
            </div>
            <h1 className="text-xl font-bold font-display mt-0.5">
              Qualification Certificate Status
            </h1>
          </div>
          <div className="text-xs font-semibold capitalize px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            Status: {currentUser.verificationStatus}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="font-bold">Current Verification Record</div>
          <div>
            <strong>Submitted Document:</strong>{' '}
            <span className="font-mono">
              {currentUser.certificateFileName || 'Not uploaded'}
            </span>
          </div>
          <div>
            <strong>Document Category:</strong> {currentUser.certificateType || 'N/A'}
          </div>
          {currentUser.reviewNotes && (
            <div>
              <strong>Administrator Review Notes:</strong> {currentUser.reviewNotes} (by{' '}
              {currentUser.reviewedBy || 'Platform Admin'})
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitCertificate} className="space-y-4">
          <h2 className="text-sm font-bold font-display">
            Update Qualifications or Upload Replacement Certificate
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Academic & Teaching Qualifications
              </label>
              <input
                type="text"
                required
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                School / Institution
              </label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Document Type</label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="Postgraduate & B.Ed. Degree Certificate">
                  Postgraduate & B.Ed. Degree Certificate
                </option>
                <option value="State Teacher Eligibility Certificate (TET/CTET)">
                  State Teacher Eligibility Certificate (TET/CTET)
                </option>
                <option value="School Faculty Appointment Letter">
                  School Faculty Appointment Letter
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Certificate File (Private Admin-Only Access)
              </label>
              <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-indigo-500">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">
                  {certificateFileName || 'Choose PDF / Image Document'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCertificateFileName(file.name);
                  }}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            {submitting ? 'Submitting...' : 'Save & Submit for Admin Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 3. Teacher Create Quiz Page (/teacher/create-quiz)
// ============================================================================
export const TeacherCreateQuizPage: React.FC = () => {
  const { currentUser, boards, createQuiz } = useEduSphere();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [classNumber, setClassNumber] = useState(10);
  const [boardId, setBoardId] = useState('CBSE');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Refraction of Light');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([
    {
      id: `q-custom-1`,
      question: 'When a ray of monochromatic light enters from air into glass, which quantity remains unchanged?',
      options: ['Wavelength', 'Velocity', 'Frequency', 'Amplitude'],
      correctAnswerIndex: 2,
      explanation: 'Frequency is a characteristic of the source of light and does not change upon refraction.',
      subtopic: 'Laws of Refraction'
    }
  ]);

  const addBlankQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-custom-${Date.now()}`,
        question: '',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswerIndex: 0,
        explanation: '',
        subtopic: topic
      }
    ]);
  };

  const handlePublishQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title required', 'Please enter a quiz title.', 'error');
      return;
    }
    const created = await createQuiz({
      title,
      classNumber,
      boardId,
      subject,
      topic,
      difficulty,
      durationSeconds: questions.length * 60,
      questions
    });
    showToast('Teacher Quiz Published', `${created.title} is now available to students.`);
    navigate('/teacher/host-quiz');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form
        onSubmit={handlePublishQuiz}
        className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6"
      >
        <div>
          <h1 className="text-xl font-bold font-display">Create Custom Curriculum Quiz</h1>
          <p className="text-xs text-slate-500">
            Design board-aligned multiple-choice assessments for practice or Live Quiz Arena competitions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">Quiz Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class 10 Ray Optics & Refraction Assessment"
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Topic</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <div>
            <label className="block text-xs font-semibold mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              {getSubjectsForClass(classNumber).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Questions Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-display">
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addBlankQuestion}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Question #{qIdx + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((prev) => prev.filter((_, i) => i !== qIdx))
                    }
                    className="text-xs text-rose-600"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                required
                value={q.question}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuestions((prev) =>
                    prev.map((item, i) => (i === qIdx ? { ...item, question: val } : item))
                  );
                }}
                placeholder="Enter question stem..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctAnswerIndex === optIdx}
                      onChange={() =>
                        setQuestions((prev) =>
                          prev.map((item, i) =>
                            i === qIdx ? { ...item, correctAnswerIndex: optIdx } : item
                          )
                        )
                      }
                    />
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestions((prev) =>
                          prev.map((item, i) =>
                            i === qIdx
                              ? {
                                  ...item,
                                  options: item.options.map((o, oi) =>
                                    oi === optIdx ? val : o
                                  )
                                }
                              : item
                          )
                        );
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>

              <input
                type="text"
                required
                value={q.explanation}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuestions((prev) =>
                    prev.map((item, i) =>
                      i === qIdx ? { ...item, explanation: val } : item
                    )
                  );
                }}
                placeholder="Step-by-step explanation shown after submission..."
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
        >
          Publish Quiz to Platform
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// 4. Teacher Host Live Quiz Page (/teacher/host-quiz)
// ============================================================================
export const TeacherHostQuizPage: React.FC = () => {
  const { currentUser, quizzes, liveRooms, createLiveRoom, controlLiveRoom } =
    useEduSphere();
  const { showToast } = useToast();

  const [roomName, setRoomName] = useState('Class 10 Board Physics & Math Live Arena');
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || '');
  const [duration, setDuration] = useState(30);

  const isVerified = currentUser?.verificationStatus === 'approved';

  const handleHost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLiveRoom({
        roomName,
        quizId: selectedQuizId || quizzes[0]?.id,
        questionDurationSeconds: duration
      });
    } catch (err) {
      showToast(
        'Cannot Host Official Competition',
        err instanceof Error ? err.message : 'Verification required.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h1 className="text-xl font-bold font-display">
          Host Official Teacher Live Quiz Competition
        </h1>

        {!isVerified ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            Verification Restriction: Your teacher profile is currently{' '}
            <strong>{currentUser?.verificationStatus}</strong>. Only administrator-approved teachers can host official teacher quiz competitions.
          </div>
        ) : (
          <form
            onSubmit={handleHost}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold mb-1">Competition Title</label>
              <input
                type="text"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold mb-1">Select Quiz</label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
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
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Create Live Room
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active & Past Rooms Control Console */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-bold font-display">Live Quiz Rooms Console</h2>
        <div className="space-y-3">
          {liveRooms.map((room) => (
            <div
              key={room.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  ROOM CODE: {room.roomCode} · Status: {room.status.toUpperCase()} · Q
                  {room.currentQuestionIndex + 1}/{room.questions.length}
                </div>
                <div className="text-sm font-bold mt-0.5">{room.roomName}</div>
                <div className="text-xs text-slate-500">
                  {room.participants.length} Participants Joined
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {room.status === 'waiting' && isVerified && (
                  <button
                    onClick={() => controlLiveRoom(room.roomCode, 'start')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg"
                  >
                    Start Quiz
                  </button>
                )}
                {room.status === 'active' && isVerified && (
                  <>
                    <button
                      onClick={() => controlLiveRoom(room.roomCode, 'next')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
                    >
                      Next Question
                    </button>
                    <button
                      onClick={() => controlLiveRoom(room.roomCode, 'finish')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg"
                    >
                      Finish Room
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. Teacher Study Materials & Contributions (/teacher/resources & /teacher/contributions)
// ============================================================================
export const TeacherResourcesPage: React.FC = () => {
  const { currentUser, boards, teacherResources, publishTeacherResource } = useEduSphere();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classNumber, setClassNumber] = useState(10);
  const [boardId, setBoardId] = useState('CBSE');
  const [subject, setSubject] = useState('Science (Combined)');
  const [resourceType, setResourceType] = useState<
    'guide' | 'worksheet' | 'formula_sheet' | 'revision_notes'
  >('formula_sheet');
  const [content, setContent] = useState('');

  const isVerified = currentUser?.verificationStatus === 'approved';

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await publishTeacherResource({
        title,
        description,
        classNumber,
        boardId,
        subject,
        resourceType,
        content
      });
      setTitle('');
      setDescription('');
      setContent('');
    } catch (err) {
      showToast(
        'Cannot Publish Material',
        err instanceof Error ? err.message : 'Verification required.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h1 className="text-xl font-bold font-display">Publish Study Materials & Formula Sheets</h1>
        {!isVerified ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            Only verified teachers can publish study materials to the student catalog.
          </div>
        ) : (
          <form onSubmit={handlePublish} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Class 10 Trigonometry Identities Summary"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Who is this material for?"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={classNumber}
                onChange={(e) => setClassNumber(Number(e.target.value))}
                className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
              <select
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {getSubjectsForClass(classNumber).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={resourceType}
                onChange={(e) =>
                  setResourceType(
                    e.target.value as
                      | 'guide'
                      | 'worksheet'
                      | 'formula_sheet'
                      | 'revision_notes'
                  )
                }
                className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="formula_sheet">Formula Sheet</option>
                <option value="guide">Exam Guide</option>
                <option value="worksheet">Practice Worksheet</option>
                <option value="revision_notes">Revision Notes</option>
              </select>
            </div>

            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the structured formulas, theorems, or practice problems..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
            />

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Publish Study Material
            </button>
          </form>
        )}
      </div>

      {/* Published Resources Catalog */}
      <div className="space-y-3">
        {teacherResources.map((res) => (
          <div
            key={res.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
          >
            <div className="text-xs text-slate-500">
              Class {res.classNumber} · {res.boardId} · {res.subject} · Published by{' '}
              {res.teacherName}
            </div>
            <h3 className="text-base font-bold font-display">{res.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{res.description}</p>
            <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-wrap">
              {res.content}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TeacherContributionsPage: React.FC = () => {
  const { currentUser, questions, quizzes, teacherResources } = useEduSphere();
  if (!currentUser) return null;

  const myAnswers = questions.flatMap((q) =>
    q.answers
      .filter((a) => a.teacherId === currentUser.id)
      .map((a) => ({ ...a, questionTitle: q.title, questionId: q.id }))
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
        <h1 className="text-2xl font-bold font-display">Educator Contributions Ledger</h1>
        <p className="text-xs text-slate-500">
          Verified community answers, student helpful votes, quizzes, and resources by{' '}
          {currentUser.displayName}
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-bold font-display">
          Published Student Explanations ({myAnswers.length})
        </h2>
        {myAnswers.length > 0 ? (
          <div className="space-y-3">
            {myAnswers.map((ans) => (
              <div
                key={ans.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <Link
                    to={`/teacher/questions/${ans.questionId}`}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {ans.questionTitle}
                  </Link>
                  <span className="font-mono tabular-nums text-emerald-600 font-semibold">
                    {ans.helpfulCount} Helpful Votes
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ans.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No answers published yet.</p>
        )}
      </div>
    </div>
  );
};
