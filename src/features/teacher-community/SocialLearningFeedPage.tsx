import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Radio,
  UserCheck,
  ThumbsUp,
  Share2,
  MessageSquarePlus,
  CheckCircle2,
  Sparkles,
  Send,
  BookOpen,
  Award,
  Clock,
  Filter,
  ExternalLink,
  AlertTriangle,
  Lock,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import {
  calculateLevelFromXP,
  CLASS_LEVELS,
  getSubjectsForClass
} from '../../constants/curriculum';
import { useToast } from '../../contexts/ToastContext';

const QUICK_SUBJECT_TAGS = [
  'Mathematics',
  'Physics',
  'Science (Combined)',
  'Chemistry',
  'Biology',
  'English',
  'Advanced Mathematics (SEBA)',
  'Computer Science'
];

export const SocialLearningFeedPage: React.FC = () => {
  const {
    currentUser,
    users,
    questions,
    teacherResources,
    liveRooms,
    boards,
    postStudentQuestion,
    postTeacherAnswer,
    markAnswerHelpful,
    publishTeacherResource
  } = useEduSphere();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isTeacher = currentUser?.role === 'teacher';
  const isVerifiedTeacher =
    isTeacher && currentUser?.verificationStatus === 'approved';

  // "Create Post" state (Student Question or Teacher Study Tip/Resource)
  const [composerExpanded, setComposerExpanded] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState<string>('');
  const [postBody, setPostBody] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>(
    currentUser?.subjects?.[0] || 'Mathematics'
  );
  const [selectedClass, setSelectedClass] = useState<number>(
    currentUser?.classNumber || 10
  );
  const [selectedBoard, setSelectedBoard] = useState<string>(
    currentUser?.boardId || 'CBSE'
  );
  const [resourceType, setResourceType] = useState<
    'guide' | 'worksheet' | 'formula_sheet' | 'revision_notes'
  >('revision_notes');
  const [isPosting, setIsPosting] = useState<boolean>(false);

  // Feed Filter State
  const [feedTab, setFeedTab] = useState<'all' | 'unanswered' | 'answered' | 'resources'>(
    'all'
  );
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Track which question cards have the inline "Reply & Solve" box open
  const [activeReplyQuestionId, setActiveReplyQuestionId] = useState<string | null>(
    null
  );
  const [replyContentByQuestion, setReplyContentByQuestion] = useState<
    Record<string, string>
  >({});
  const [replyResourceByQuestion, setReplyResourceByQuestion] = useState<
    Record<string, string>
  >({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  // Track student question upvote ("like/helpful" on question itself)
  const [likedQuestionIds, setLikedQuestionIds] = useState<Record<string, boolean>>({});

  // Quick AI Tutor prompt in right column
  const [quickTutorPrompt, setQuickTutorPrompt] = useState<string>('');

  if (!currentUser) return null;

  const verifiedTeachers = users.filter(
    (u) => u.role === 'teacher' && u.verificationStatus === 'approved'
  );

  const visibleQuestions = questions.filter((q) => {
    if (q.status === 'reported' && currentUser.role !== 'admin') return false;
    if (feedTab === 'unanswered' && q.answers.length > 0) return false;
    if (feedTab === 'answered' && q.answers.length === 0) return false;
    if (
      subjectFilter !== 'all' &&
      !q.subject.toLowerCase().includes(subjectFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) {
      showToast(
        'Missing fields',
        'Please provide both a headline and detailed content.',
        'error'
      );
      return;
    }

    setIsPosting(true);
    try {
      if (isTeacher) {
        await publishTeacherResource({
          title: postTitle.trim(),
          description: `Shared by ${currentUser.displayName} in the Community Learning Feed`,
          classNumber: selectedClass,
          boardId: selectedBoard,
          subject: selectedSubject,
          resourceType,
          content: postBody.trim()
        });
      } else {
        await postStudentQuestion({
          classNumber: selectedClass,
          boardId: selectedBoard,
          subject: selectedSubject,
          title: postTitle.trim(),
          description: postBody.trim()
        });
      }
      setPostTitle('');
      setPostBody('');
      setComposerExpanded(false);
    } catch (err) {
      showToast(
        'Could not publish post',
        err instanceof Error ? err.message : 'Submission failed.',
        'error'
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleInlineTeacherReply = async (questionId: string) => {
    const text = replyContentByQuestion[questionId]?.trim();
    if (!text) {
      showToast('Explanation required', 'Please write a step-by-step solution.', 'error');
      return;
    }

    setSubmittingReplyId(questionId);
    try {
      const attachedTitle = replyResourceByQuestion[questionId]?.trim();
      await postTeacherAnswer(
        questionId,
        text,
        attachedTitle || undefined,
        attachedTitle ? '/student/ai-notes' : undefined
      );
      setReplyContentByQuestion((prev) => ({ ...prev, [questionId]: '' }));
      setReplyResourceByQuestion((prev) => ({ ...prev, [questionId]: '' }));
      setActiveReplyQuestionId(null);
    } catch (err) {
      showToast(
        'Reply restricted',
        err instanceof Error ? err.message : 'Could not publish answer.',
        'error'
      );
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleSharePost = async (questionId: string, title: string) => {
    const detailPath = isTeacher
      ? `/teacher/questions/${questionId}`
      : `/student/questions/${questionId}`;
    const url = `${window.location.origin}${detailPath}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link Copied to Clipboard', `Shared link for "${title.slice(0, 42)}..."`);
    } catch {
      showToast('Share Ready', `Discussion path: ${detailPath}`, 'info');
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const detailPrefix = isTeacher ? '/teacher/questions' : '/student/questions';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* =====================================================================
          CENTER COLUMN (Main Social Learning Feed — 8 cols on XL)
         ===================================================================== */}
      <div className="xl:col-span-8 space-y-5">
        {/* Teacher Pending Verification Notice if applicable */}
        {isTeacher && !isVerifiedTeacher && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  Verification Pending ({currentUser.verificationStatus}):
                </span>{' '}
                You can browse the student community feed, but only administrator-verified teachers can publish official answers or study tips.
              </div>
            </div>
            <Link
              to="/teacher/verification"
              className="font-semibold underline whitespace-nowrap shrink-0"
            >
              Verify Now
            </Link>
          </div>
        )}

        {/* 1. Prominent "Create Post" Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 font-display">
              {getInitials(currentUser.displayName)}
            </div>
            <button
              type="button"
              onClick={() => setComposerExpanded(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 transition-colors"
            >
              {isTeacher
                ? 'Share a study resource, board exam tip, or formula sheet with students...'
                : 'Ask a question or share a problem statement...'}
            </button>
          </div>

          {/* Quick-Select Subject & Class Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">
                Quick Tags:
              </span>
              {QUICK_SUBJECT_TAGS.slice(0, 5).map((subj) => {
                const isSelected = selectedSubject === subj;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(subj);
                      setComposerExpanded(true);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      isSelected && composerExpanded
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {subj.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setComposerExpanded(!composerExpanded)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{isTeacher ? 'Share Resource / Tip' : 'Post Question'}</span>
            </button>
          </div>

          {/* Expanded Post Composer Form */}
          {composerExpanded && (
            <form
              onSubmit={handleCreatePostSubmit}
              className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Subject Tag
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    {Array.from(
                      new Set([
                        ...QUICK_SUBJECT_TAGS,
                        ...getSubjectsForClass(selectedClass)
                      ])
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Class Level
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    {CLASS_LEVELS.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Education Board
                  </label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
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
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder={
                    isTeacher
                      ? 'Resource / Study Tip Title (e.g. Key Ray Optics Sign Conventions for Class 10)...'
                      : 'Question Headline (e.g. Why does resistance become 4R when a wire is stretched?)...'
                  }
                  className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder={
                    isTeacher
                      ? 'Write the formula summary, worked example, or revision checklist to share with students...'
                      : 'Share your problem statement, equation, or where you got stuck so verified teachers can reply & solve...'
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Posting as <strong>{currentUser.displayName}</strong> · Class{' '}
                  {selectedClass} ({selectedBoard})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComposerExpanded(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isPosting
                        ? 'Publishing...'
                        : isTeacher
                        ? 'Publish to Feed'
                        : 'Post Question to Feed'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* 2. Feed Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            {(
              [
                { id: 'all', label: 'All Feed Posts' },
                { id: 'unanswered', label: 'Needs Teacher Reply' },
                { id: 'answered', label: 'Solved by Teachers' },
                { id: 'resources', label: 'Teacher Tips & Notes' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFeedTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  feedTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <option value="all">All Subjects</option>
              {QUICK_SUBJECT_TAGS.map((s) => (
                <option key={s} value={s.split(' ')[0]}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Teacher Shared Study Resources / Tips Cards (When 'resources' or 'all' tab is active) */}
        {(feedTab === 'resources' || feedTab === 'all') &&
          teacherResources
            .filter((res) =>
              subjectFilter === 'all'
                ? true
                : res.subject.toLowerCase().includes(subjectFilter.toLowerCase())
            )
            .slice(0, feedTab === 'resources' ? 10 : 1)
            .map((res) => (
              <article
                key={res.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 font-display">
                      {getInitials(res.teacherName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {res.teacherName}
                        </span>
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                          aria-label="Verified Educator"
                        />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          Verified Teacher
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Shared Educator Resource · {formatTimestamp(res.createdAt)} ·{' '}
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {res.subject} (Class {res.classNumber} · {res.boardId})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-base font-bold font-display">{res.title}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {res.description}
                  </p>
                  <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {res.content}
                  </pre>
                </div>
              </article>
            ))}

        {/* 4. Scrollable Social Feed of Student Question Cards */}
        {feedTab !== 'resources' && (
          <div className="space-y-4">
            {visibleQuestions.length > 0 ? (
              visibleQuestions.map((question) => {
                const isReplyOpen = activeReplyQuestionId === question.id;
                const isLiked = Boolean(likedQuestionIds[question.id]);
                const totalQuestionHelpful =
                  question.answers.reduce((acc, a) => acc + a.helpfulCount, 0) +
                  (isLiked ? 1 : 0);

                return (
                  <article
                    key={question.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 transition-colors"
                  >
                    {/* Card Header: Student Avatar, Name, Timestamp & Subject/Class Tag */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 font-display border border-indigo-200 dark:border-indigo-800">
                          {getInitials(question.studentName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {question.studentName}
                            </span>
                            <span className="text-xs text-slate-400" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {formatTimestamp(question.createdAt)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span>Student</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {question.subject} · Class {question.classNumber} ({question.boardId})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-semibold shrink-0">
                        {question.answers.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Solved ({question.answers.length})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Open Question</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body: Problem Statement / Question Text */}
                    <div className="space-y-2">
                      <Link
                        to={`${detailPrefix}/${question.id}`}
                        className="block text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {question.title}
                      </Link>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {question.description}
                      </p>
                    </div>

                    {/* Card Action Bar: Like/Helpful, Share, Open Thread, and Prominent Teacher "Reply & Solve" */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (question.answers[0]) {
                              markAnswerHelpful(question.id, question.answers[0].id);
                            } else {
                              setLikedQuestionIds((prev) => ({
                                ...prev,
                                [question.id]: !prev[question.id]
                              }));
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors font-mono tabular-nums ${
                            isLiked
                              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({totalQuestionHelpful})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSharePost(question.id, question.title)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>

                        <Link
                          to={`${detailPrefix}/${question.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>
                            Full Thread & Private Follow-Up ({question.followUps.length})
                          </span>
                        </Link>
                      </div>

                      {/* Prominent "Reply & Solve" Button for Teachers */}
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveReplyQuestionId(
                              isReplyOpen ? null : question.id
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors whitespace-nowrap"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                          <span>{isReplyOpen ? 'Close Reply' : 'Reply & Solve'}</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Teacher Reply Composer */}
                    {isTeacher && isReplyOpen && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            Write Authoritative Teacher Solution
                          </span>
                          <span className="text-slate-500">
                            Replying as {currentUser.displayName}
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={replyContentByQuestion[question.id] || ''}
                          onChange={(e) =>
                            setReplyContentByQuestion((prev) => ({
                              ...prev,
                              [question.id]: e.target.value
                            }))
                          }
                          placeholder="Provide a clear, step-by-step explanation for this student..."
                          className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                          <input
                            type="text"
                            value={replyResourceByQuestion[question.id] || ''}
                            onChange={(e) =>
                              setReplyResourceByQuestion((prev) => ({
                                ...prev,
                                [question.id]: e.target.value
                              }))
                            }
                            placeholder="Optional resource title to attach (e.g. Chapter Formula Sheet)"
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                          <button
                            type="button"
                            disabled={submittingReplyId === question.id}
                            onClick={() => handleInlineTeacherReply(question.id)}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg whitespace-nowrap"
                          >
                            {submittingReplyId === question.id
                              ? 'Publishing...'
                              : 'Publish Official Solution'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nested Verified Teacher Replies Section */}
                    {question.answers.length > 0 && (
                      <div className="pt-2 space-y-3">
                        {question.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/25 border border-emerald-200/90 dark:border-emerald-800/70 space-y-2.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                                  {getInitials(ans.teacherName)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                      {ans.teacherName}
                                    </span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                      Verified Teacher
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {ans.teacherQualifications}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => markAnswerHelpful(question.id, ans.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50 transition-colors font-mono tabular-nums"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Upvote Solution ({ans.helpfulCount})</span>
                              </button>
                            </div>

                            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                              {ans.content}
                            </div>

                            {ans.resourceTitle && (
                              <div className="pt-1 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400">
                                <span className="font-medium">
                                  Attached Study Aid: <strong>{ans.resourceTitle}</strong>
                                </span>
                                {ans.resourceUrl && (
                                  <Link
                                    to={ans.resourceUrl}
                                    className="inline-flex items-center gap-1 font-semibold hover:underline"
                                  >
                                    <span>View Notes</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="text-base font-bold font-display">
                  No Feed Posts Match Your Current Filter
                </div>
                <p className="text-xs text-slate-500">
                  Switch back to “All Feed Posts” or ask a new question above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          RIGHT COLUMN (Pinned Contextual Widgets — 4 cols on XL)
         ===================================================================== */}
      <aside className="xl:col-span-4 space-y-5 xl:sticky xl:top-20">
        {/* Widget 1: Quick-Launch AI Learning Tutor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold font-display">AI Learning Tutor</h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Instant 24/7</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Need an immediate step-by-step concept breakdown while waiting for a teacher reply? Launch the interactive AI Tutor.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const query = quickTutorPrompt.trim() || 'Quadratic Equations';
              navigate(`/student/ai-tutor?topic=${encodeURIComponent(query)}`);
            }}
            className="space-y-2"
          >
            <input
              type="text"
              value={quickTutorPrompt}
              onChange={(e) => setQuickTutorPrompt(e.target.value)}
              placeholder="Enter topic (e.g. Ohm's Law, Trigonometry)..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Learning Tutor</span>
            </button>
          </form>
        </div>

        {/* Widget 2: Live Quiz Rooms Available */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold font-display">
                Live Quiz Rooms Available
              </h2>
            </div>
            <Link
              to={isTeacher ? '/teacher/host-quiz' : '/student/quiz-arena'}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isTeacher ? '+ Host' : 'All Rooms'}
            </Link>
          </div>

          {liveRooms.length > 0 ? (
            <div className="space-y-2.5">
              {liveRooms.slice(0, 3).map((room) => (
                <div
                  key={room.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Code: {room.roomCode}
                    </span>
                    <span className="text-slate-500">
                      {room.participants.length} Joined · {room.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {room.roomName}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 truncate">
                      Host: {room.hostName}
                    </span>
                    <button
                      onClick={() =>
                        navigate(
                          isTeacher
                            ? '/teacher/host-quiz'
                            : `/student/live-quiz/${room.roomCode}`
                        )
                      }
                      className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {isTeacher ? 'Manage' : 'Join Live'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No live rooms active right now.</p>
          )}
        </div>

        {/* Widget 3: Top Verified Teachers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold font-display">Top Verified Teachers</h2>
            </div>
            <span className="text-[11px] text-slate-500">Credentialed</span>
          </div>

          <div className="space-y-3">
            {verifiedTeachers.map((teacher) => {
              const teacherAnswers = questions
                .flatMap((q) => q.answers)
                .filter((a) => a.teacherId === teacher.id);
              const helpfulCount = teacherAnswers.reduce(
                (acc, a) => acc + a.helpfulCount,
                0
              );

              return (
                <div
                  key={teacher.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 font-display">
                    {getInitials(teacher.displayName)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold truncate">
                        {teacher.displayName}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {teacher.qualifications}
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {(teacher.subjects || []).slice(0, 2).join(' · ')} ·{' '}
                      <span className="font-mono">{helpfulCount} Upvotes</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};
