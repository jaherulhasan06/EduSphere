import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  MessageSquareText,
  ThumbsUp,
  Flag,
  CheckCircle2,
  Lock,
  Send,
  AlertTriangle,
  ArrowLeft,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { CLASS_LEVELS, getSubjectsForClass } from '../../constants/curriculum';
import { useToast } from '../../contexts/ToastContext';

export const AskTeacherListPage: React.FC = () => {
  const { currentUser, questions, boards, postStudentQuestion } = useEduSphere();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Filter states
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'answered'>('all');

  // New Question Modal / Form toggle
  const [showAskForm, setShowAskForm] = useState<boolean>(false);
  const [qClass, setQClass] = useState<number>(currentUser?.classNumber || 10);
  const [qBoard, setQBoard] = useState<string>(currentUser?.boardId || 'CBSE');
  const [qSubject, setQSubject] = useState<string>('Mathematics');
  const [qTitle, setQTitle] = useState<string>('');
  const [qDescription, setQDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const isTeacherView = currentUser?.role === 'teacher';
  const detailPrefix = isTeacherView ? '/teacher/questions' : '/student/questions';

  const visibleQuestions = questions.filter((q) => {
    if (q.status === 'reported' && currentUser?.role !== 'admin') return false;
    if (filterClass !== 'all' && q.classNumber !== Number(filterClass)) return false;
    if (
      filterSubject !== 'all' &&
      !q.subject.toLowerCase().includes(filterSubject.toLowerCase())
    ) {
      return false;
    }
    if (filterStatus !== 'all' && q.status !== filterStatus) return false;
    return true;
  });

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim() || !qDescription.trim()) return;
    setSubmitting(true);
    try {
      const created = await postStudentQuestion({
        classNumber: qClass,
        boardId: qBoard,
        subject: qSubject,
        title: qTitle,
        description: qDescription
      });
      setShowAskForm(false);
      setQTitle('');
      setQDescription('');
      navigate(`${detailPrefix}/${created.id}`);
    } catch (err) {
      showToast(
        'Could not post question',
        err instanceof Error ? err.message : 'Error posting question.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Verified Educator Community · Classes 1–12
          </div>
          <h1 className="text-2xl font-bold font-display">
            {isTeacherView ? 'Student Academic Questions Queue' : 'Ask a Verified Teacher'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isTeacherView
              ? 'Provide step-by-step explanations and study resources for school students.'
              : 'Post questions on difficult syllabus concepts and receive verified teacher explanations.'}
          </p>
        </div>

        {currentUser?.role === 'student' && (
          <button
            onClick={() => setShowAskForm(!showAskForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors whitespace-nowrap self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>{showAskForm ? 'Close Form' : 'Ask New Question'}</span>
          </button>
        )}
      </div>

      {/* Teacher Verification Warning if Pending */}
      {isTeacherView && currentUser?.verificationStatus !== 'approved' && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">
              Teacher Verification Status: {currentUser?.verificationStatus?.toUpperCase()}
            </div>
            <p>
              Pending or rejected teachers can browse student questions, but only administrator-verified teachers can publish official answers. Visit the Verification tab to check your certificate status.
            </p>
          </div>
        </div>
      )}

      {/* Student Ask Question Form */}
      {showAskForm && currentUser?.role === 'student' && (
        <form
          onSubmit={handleCreateQuestion}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-4"
        >
          <h2 className="text-base font-bold font-display">Post a Public Academic Question</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Class</label>
              <select
                value={qClass}
                onChange={(e) => setQClass(Number(e.target.value))}
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
                value={qBoard}
                onChange={(e) => setQBoard(e.target.value)}
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
                value={qSubject}
                onChange={(e) => setQSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {getSubjectsForClass(qClass).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Question Title</label>
            <input
              type="text"
              required
              value={qTitle}
              onChange={(e) => setQTitle(e.target.value)}
              placeholder="e.g. How do we derive the mirror formula 1/v + 1/u = 1/f for a concave mirror?"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Detailed Description & What You Have Tried
            </label>
            <textarea
              rows={3}
              required
              value={qDescription}
              onChange={(e) => setQDescription(e.target.value)}
              placeholder="Explain where you got stuck so a verified teacher can guide you step-by-step..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAskForm(false)}
              className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg"
            >
              {submitting ? 'Posting...' : 'Publish Question'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'open', 'answered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {st === 'all' ? 'All Questions' : st}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          >
            <option value="all">All Classes</option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={String(c)}>
                Class {c}
              </option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          >
            <option value="all">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Science">Science</option>
            <option value="Biology">Biology</option>
            <option value="English">English</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {visibleQuestions.length > 0 ? (
          visibleQuestions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Class {q.classNumber} · {q.boardId} · {q.subject}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Asked by {q.studentName}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-semibold capitalize ${
                      q.status === 'answered'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {q.status} ({q.answers.length} answer{q.answers.length === 1 ? '' : 's'})
                  </span>
                </div>

                <Link
                  to={`${detailPrefix}/${q.id}`}
                  className="block text-base font-bold font-display hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {q.title}
                </Link>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {q.description}
                </p>
              </div>

              <Link
                to={`${detailPrefix}/${q.id}`}
                className="px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center shrink-0"
              >
                {isTeacherView ? 'Open & Answer' : 'View Discussion'}
              </Link>
            </div>
          ))
        ) : (
          <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <MessageSquareText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold">No Matching Questions Found</div>
            <p className="text-xs text-slate-500">
              Try clearing your filters or post a new question.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const {
    currentUser,
    questions,
    postTeacherAnswer,
    markAnswerHelpful,
    postPrivateFollowUp,
    reportContent
  } = useEduSphere();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const question = questions.find((q) => q.id === questionId);

  const [answerContent, setAnswerContent] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const [followUpText, setFollowUpText] = useState('');
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  const [reportingTarget, setReportingTarget] = useState<{
    type: 'question' | 'answer';
    id: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState('');

  if (!question) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <h1 className="text-lg font-bold font-display">Question Not Found</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Permission check for Private Educational Follow-Up
  const canAccessPrivateFollowUp =
    currentUser?.id === question.studentId ||
    (currentUser?.role === 'teacher' && currentUser?.verificationStatus === 'approved') ||
    currentUser?.role === 'admin';

  const isVerifiedTeacher =
    currentUser?.role === 'teacher' && currentUser?.verificationStatus === 'approved';

  const handlePublishAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    setSubmittingAnswer(true);
    try {
      await postTeacherAnswer(
        question.id,
        answerContent,
        resourceTitle || undefined,
        resourceUrl || undefined
      );
      setAnswerContent('');
      setResourceTitle('');
      setResourceUrl('');
    } catch (err) {
      showToast(
        'Cannot Publish Answer',
        err instanceof Error ? err.message : 'Verification error.',
        'error'
      );
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim()) return;
    setSubmittingFollowUp(true);
    try {
      await postPrivateFollowUp(question.id, followUpText);
      setFollowUpText('');
    } catch (err) {
      showToast(
        'Follow-Up Error',
        err instanceof Error ? err.message : 'Could not send private follow-up.',
        'error'
      );
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingTarget || !reportReason.trim()) return;
    await reportContent(reportingTarget.type, reportingTarget.id, reportReason);
    setReportingTarget(null);
    setReportReason('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() =>
          navigate(
            currentUser?.role === 'teacher' ? '/teacher/questions' : '/student/ask-teacher'
          )
        }
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Questions</span>
      </button>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Class {question.classNumber} · {question.boardId} · {question.subject}
            </span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>Asked by {question.studentName}</span>
          </div>
          <button
            onClick={() => setReportingTarget({ type: 'question', id: question.id })}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Question</span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-display">{question.title}</h1>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {question.description}
        </p>
      </div>

      {/* Report Modal / Inline Drawer */}
      {reportingTarget && (
        <form
          onSubmit={handleSubmitReport}
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3"
        >
          <div className="text-xs font-bold text-rose-800 dark:text-rose-200">
            Report {reportingTarget.type} to Platform Moderators
          </div>
          <input
            type="text"
            required
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe why this content is inappropriate or inaccurate..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReportingTarget(null)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg"
            >
              Submit Report
            </button>
          </div>
        </form>
      )}

      {/* Official Verified Teacher Answers */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display">
          Verified Teacher Explanations ({question.answers.length})
        </h2>

        {question.answers.length > 0 ? (
          question.answers.map((ans) => (
            <div
              key={ans.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-sm font-bold">{ans.teacherName}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      {ans.teacherQualifications}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setReportingTarget({ type: 'answer', id: ans.id })}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  Report
                </button>
              </div>

              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {ans.content}
              </div>

              {ans.resourceTitle && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-medium">
                    Attached Resource: <strong>{ans.resourceTitle}</strong>
                  </span>
                  {ans.resourceUrl && (
                    <Link
                      to={ans.resourceUrl}
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      <span>Open Material</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => markAnswerHelpful(question.id, ans.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 transition-colors font-mono tabular-nums"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Helpful ({ans.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
            No official teacher explanation posted yet. Verified educators are notified of open questions.
          </div>
        )}
      </div>

      {/* Teacher Answer Composer (Strictly Restricted to Verified Teachers) */}
      {currentUser?.role === 'teacher' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold font-display">
            Write an Official Teacher Explanation
          </h3>

          {isVerifiedTeacher ? (
            <form onSubmit={handlePublishAnswer} className="space-y-4">
              <textarea
                rows={4}
                required
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Write a clear, step-by-step pedagogical explanation suitable for the student's class level..."
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  placeholder="Optional Attached Resource Title (e.g. Formula Sheet)"
                  className="px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
                <input
                  type="text"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="Optional Resource Link (e.g. /student/ai-notes)"
                  className="px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <button
                type="submit"
                disabled={submittingAnswer}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                {submittingAnswer ? 'Publishing...' : 'Publish Verified Explanation'}
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              Your teacher account verification status is currently{' '}
              <strong>{currentUser.verificationStatus}</strong>. Only approved teachers can submit official answers.
            </div>
          )}
        </div>
      )}

      {/* Permission-Controlled Private Educational Follow-Up Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold font-display">
              Permission-Controlled Private Educational Follow-Up
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Restricted to Question Author, Verified Teacher & Moderators
          </span>
        </div>

        {canAccessPrivateFollowUp ? (
          <div className="space-y-4">
            {question.followUps.length > 0 ? (
              <div className="space-y-2.5">
                {question.followUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {fu.senderName} ({fu.senderRole})
                      </span>
                      <span className="font-mono text-[10px]">
                        {new Date(fu.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {fu.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No private follow-up messages yet. Use this thread for clarifying doubts specific to this question.
              </p>
            )}

            <form onSubmit={handleSendFollowUp} className="flex items-center gap-2">
              <input
                type="text"
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="Write a private educational follow-up on this question..."
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <button
                type="submit"
                disabled={submittingFollowUp}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Follow-Up</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            Private follow-up threads are strictly permission-controlled and visible only to the student who asked ({question.studentName}), the participating verified teacher, and platform moderators.
          </div>
        )}
      </div>
    </div>
  );
};
