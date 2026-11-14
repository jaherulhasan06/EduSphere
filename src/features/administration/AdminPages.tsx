import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Users,
  ShieldAlert,
  FolderKanban,
  Trophy,
  Settings,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { CLASS_LEVELS } from '../../constants/curriculum';
import { TeacherVerificationStatus } from '../../types/edusphere';

// ============================================================================
// 1. Admin Dashboard Overview (/admin/dashboard)
// ============================================================================
export const AdminDashboardPage: React.FC = () => {
  const { users, questions, reports, liveRooms } = useEduSphere();

  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');
  const pendingTeachers = teachers.filter((t) => t.verificationStatus === 'pending');
  const approvedTeachers = teachers.filter((t) => t.verificationStatus === 'approved');
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const activeRooms = liveRooms.filter(
    (r) => r.status === 'waiting' || r.status === 'active'
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Platform Administration & Governance
        </div>
        <h1 className="text-2xl font-bold font-display">EduSphere AI Admin Console</h1>
        <p className="text-xs text-slate-500">
          Verify educator credentials, moderate reported content, and manage multi-board curriculum data.
        </p>
      </div>

      {/* 7 Required Dashboard Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono tabular-nums">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-sans">Total Students</div>
          <div className="text-xl font-bold mt-1">{students.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-sans">Total Teachers</div>
          <div className="text-xl font-bold mt-1">{teachers.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-sans">Pending Verification</div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {pendingTeachers.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-sans">Approved Teachers</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {approvedTeachers.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-sans">Total Questions</div>
          <div className="text-xl font-bold mt-1">{questions.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-sans">Reported Content</div>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {pendingReports.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-sans">Active Quiz Rooms</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">
            {activeRooms.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display">
              Pending Teacher Verification Queue ({pendingTeachers.length})
            </h2>
            <Link
              to="/admin/teacher-verification"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Review All →
            </Link>
          </div>
          {pendingTeachers.length > 0 ? (
            <div className="space-y-3">
              {pendingTeachers.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-bold">{t.displayName}</div>
                    <div className="text-xs text-slate-500">
                      {t.qualifications} · {t.institution}
                    </div>
                  </div>
                  <Link
                    to="/admin/teacher-verification"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
                  >
                    Review Certificate
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              All teacher verification applications have been processed.
            </p>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display">
              Pending Moderation Reports ({pendingReports.length})
            </h2>
            <Link
              to="/admin/moderation"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Moderation →
            </Link>
          </div>
          {pendingReports.length > 0 ? (
            <div className="space-y-3">
              {pendingReports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                >
                  <div className="font-bold">{rep.targetTitleOrExcerpt}</div>
                  <div className="text-slate-500">
                    Reason: {rep.reason} · Reported by {rep.reporterName}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No pending content reports.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. Admin Teacher Verification (/admin/teacher-verification)
// ============================================================================
export const AdminTeacherVerificationPage: React.FC = () => {
  const { users, reviewTeacherVerification } = useEduSphere();
  const [notesByTeacher, setNotesByTeacher] = useState<Record<string, string>>({});

  const teachers = users.filter((u) => u.role === 'teacher');

  const handleAction = async (
    teacherId: string,
    status: TeacherVerificationStatus
  ) => {
    const note =
      notesByTeacher[teacherId] ||
      (status === 'approved'
        ? 'Qualifications and certificate verified by Admin.'
        : status === 'rejected'
        ? 'Qualification certificate could not be verified.'
        : 'Please upload a clearer scan of your B.Ed./University certificate.');
    await reviewTeacherVerification(teacherId, status, note);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
        <h1 className="text-2xl font-bold font-display">
          Teacher Qualification & Certificate Verification
        </h1>
        <p className="text-xs text-slate-500">
          Every approval, rejection, or resubmission request is persisted and attributed to your administrator account.
        </p>
      </div>

      <div className="space-y-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="text-base font-bold font-display">
                  {teacher.displayName}
                </div>
                <div className="text-xs text-slate-500">
                  {teacher.email} · Applied{' '}
                  {new Date(teacher.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-xs font-semibold capitalize px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 self-start">
                Current Status: {teacher.verificationStatus}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div>
                  <strong>Qualifications:</strong> {teacher.qualifications}
                </div>
                <div>
                  <strong>Institution:</strong> {teacher.institution}
                </div>
                <div>
                  <strong>Subjects:</strong> {(teacher.subjects || []).join(', ')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Submitted Document (Private Bucket)</span>
                </div>
                <div className="font-mono">
                  {teacher.certificateFileName || 'Certificate_Document.pdf'}
                </div>
                <div className="text-slate-500">{teacher.certificateType}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <input
                type="text"
                value={notesByTeacher[teacher.id] || ''}
                onChange={(e) =>
                  setNotesByTeacher((prev) => ({
                    ...prev,
                    [teacher.id]: e.target.value
                  }))
                }
                placeholder="Optional review attribution note..."
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAction(teacher.id, 'approved')}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleAction(teacher.id, 'resubmit_requested')}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Resubmission</span>
                </button>
                <button
                  onClick={() => handleAction(teacher.id, 'rejected')}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 3. Admin User Management (/admin/users)
// ============================================================================
export const AdminUsersPage: React.FC = () => {
  const { users, currentUser, setUserAccountStatus } = useEduSphere();
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>(
    'all'
  );

  const filtered = users.filter((u) =>
    roleFilter === 'all' ? true : u.role === roleFilter
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">User Account Management</h1>
          <p className="text-xs text-slate-500">
            Filter accounts by role and manage active/suspended status without exposing sensitive auth tokens.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'student', 'teacher', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize ${
                roleFilter === r
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <th className="py-3 pr-4 font-semibold">Display Name</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Details</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 pl-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="py-3.5 pr-4 font-bold">{u.displayName}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{u.email}</td>
                <td className="py-3.5 px-4 capitalize font-semibold">{u.role}</td>
                <td className="py-3.5 px-4 text-slate-500">
                  {u.role === 'student'
                    ? `Class ${u.classNumber} · ${u.boardId}`
                    : u.role === 'teacher'
                    ? `Verification: ${u.verificationStatus}`
                    : 'System Administrator'}
                </td>
                <td className="py-3.5 px-4 capitalize font-semibold">
                  {u.status}
                </td>
                <td className="py-3.5 pl-4 text-right">
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() =>
                        setUserAccountStatus(
                          u.id,
                          u.status === 'active' ? 'suspended' : 'active'
                        )
                      }
                      className={`px-3 py-1 rounded-md font-semibold ${
                        u.status === 'active'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// 4. Admin Content Moderation (/admin/moderation)
// ============================================================================
export const AdminModerationPage: React.FC = () => {
  const { reports, moderateReport } = useEduSphere();

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
        <h1 className="text-2xl font-bold font-display">Content Moderation Queue</h1>
        <p className="text-xs text-slate-500">
          Review reported community questions and answers, remove inappropriate content, and log moderation actions.
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="text-xs text-slate-500">
                Target Type: <strong className="uppercase">{rep.targetType}</strong> ·
                Reported by {rep.reporterName} · Status:{' '}
                <strong className="uppercase">{rep.status}</strong>
              </div>
              <div className="text-sm font-bold">{rep.targetTitleOrExcerpt}</div>
              <div className="text-xs text-rose-600 dark:text-rose-400">
                Reason: {rep.reason}
              </div>
              {rep.moderationAction && (
                <div className="text-xs text-emerald-600">
                  Action Recorded: {rep.moderationAction} (by {rep.moderatedBy})
                </div>
              )}
            </div>

            {rep.status === 'pending' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => moderateReport(rep.id, 'remove_content')}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Remove Content
                </button>
                <button
                  onClick={() => moderateReport(rep.id, 'dismiss')}
                  className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Dismiss Report
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 5. Admin Curriculum Management (/admin/curriculum)
// ============================================================================
export const AdminCurriculumPage: React.FC = () => {
  const { boards, curriculum, addOrUpdateCurriculum } = useEduSphere();

  const [newBoardId, setNewBoardId] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardFullName, setNewBoardFullName] = useState('');
  const [newBoardRegion, setNewBoardRegion] = useState('');

  const [subjBoardId, setSubjBoardId] = useState('CBSE');
  const [subjClass, setSubjClass] = useState(10);
  const [subjName, setSubjName] = useState('');
  const [subjChapters, setSubjChapters] = useState('');

  const handleAddBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardId.trim() || !newBoardName.trim()) return;
    await addOrUpdateCurriculum('board', {
      id: newBoardId,
      name: newBoardName,
      fullName: newBoardFullName || newBoardName,
      region: newBoardRegion || 'State / National Board'
    });
    setNewBoardId('');
    setNewBoardName('');
    setNewBoardFullName('');
    setNewBoardRegion('');
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;
    const chapters = subjChapters
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    await addOrUpdateCurriculum('subject', {
      boardId: subjBoardId,
      classNumber: subjClass,
      name: subjName,
      chapters
    });
    setSubjName('');
    setSubjChapters('');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
        <h1 className="text-2xl font-bold font-display">
          Multi-Board Curriculum Configuration
        </h1>
        <p className="text-xs text-slate-500">
          Add education boards, classes, subjects, and chapter mappings dynamically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleAddBoard}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <h2 className="text-base font-bold font-display">Add Education Board</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={newBoardId}
              onChange={(e) => setNewBoardId(e.target.value)}
              placeholder="Board Code (e.g. MBOSE)"
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <input
              type="text"
              required
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Short Name (e.g. MBOSE)"
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>
          <input
            type="text"
            required
            value={newBoardFullName}
            onChange={(e) => setNewBoardFullName(e.target.value)}
            placeholder="Full Board Name"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          />
          <input
            type="text"
            value={newBoardRegion}
            onChange={(e) => setNewBoardRegion(e.target.value)}
            placeholder="Region / State"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
          >
            + Add Board
          </button>
        </form>

        <form
          onSubmit={handleAddSubject}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <h2 className="text-base font-bold font-display">
            Add / Update Subject & Chapters
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={subjBoardId}
              onChange={(e) => setSubjBoardId(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={subjClass}
              onChange={(e) => setSubjClass(Number(e.target.value))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            required
            value={subjName}
            onChange={(e) => setSubjName(e.target.value)}
            placeholder="Subject Name (e.g. Chemistry)"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          />
          <input
            type="text"
            required
            value={subjChapters}
            onChange={(e) => setSubjChapters(e.target.value)}
            placeholder="Comma-separated chapters (e.g. Periodic Table, Chemical Bonding)"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
          >
            Save Subject Mapping
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-base font-bold font-display">
          Configured Syllabus Mappings ({curriculum.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {curriculum.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
            >
              <div className="font-bold">
                {c.boardId} · Class {c.classNumber} · {c.name}
              </div>
              <div className="text-slate-500">
                Chapters: {c.chapters.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. Admin Quizzes & Settings (/admin/quizzes & /admin/settings)
// ============================================================================
export const AdminQuizzesPage: React.FC = () => {
  const { quizzes, liveRooms, controlLiveRoom } = useEduSphere();

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h1 className="text-xl font-bold font-display">
          Platform Quizzes & Live Arena Rooms
        </h1>
        <div className="space-y-3">
          {liveRooms.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold">
                  Room {r.roomCode} — {r.roomName}
                </div>
                <div className="text-slate-500">
                  Host: {r.hostName} · Status: {r.status} · {r.participants.length} Participants
                </div>
              </div>
              {r.status !== 'cancelled' && r.status !== 'finished' && (
                <button
                  onClick={() => controlLiveRoom(r.roomCode, 'cancel')}
                  className="px-3 py-1.5 font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 rounded-lg"
                >
                  Force Close Room
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-base font-bold font-display">
          All Platform Quizzes ({quizzes.length})
        </h2>
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex justify-between"
          >
            <div>
              <div className="font-bold">{q.title}</div>
              <div className="text-slate-500">
                Class {q.classNumber} · {q.boardId} · {q.subject} · Created by {q.creatorName}
              </div>
            </div>
            <span className="font-mono">{q.questions.length} Qs</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminSettingsPage: React.FC = () => {
  const { isSupabaseConnected, isDemoMode } = useEduSphere();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h1 className="text-xl font-bold font-display">
          Platform Environment & Security Settings
        </h1>
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="font-semibold">Supabase Backend Connection</span>
            <span className="font-mono">
              {isSupabaseConnected ? 'Connected' : 'Not Configured (Demo Mode Active)'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="font-semibold">Active AI Provider</span>
            <span className="font-mono">MockAIProvider (Replaceable AIProvider)</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="font-semibold">Public Admin Registration</span>
            <span className="font-mono text-emerald-600">Blocked on Server & Client</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
            <span className="font-semibold">Live Quiz Scoring Authority</span>
            <span className="font-mono text-emerald-600">Server-Authoritative Validation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
