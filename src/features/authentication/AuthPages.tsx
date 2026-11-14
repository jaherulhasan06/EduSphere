import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PublicTopBar } from '../../app/layouts/RoleLayouts';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { CLASS_LEVELS, getSubjectsForClass } from '../../constants/curriculum';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithDemoAccount, users, isDemoMode } = useEduSphere();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await loginWithEmail(email, password);
      if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSelect = (role: 'student' | 'teacher' | 'admin', userId?: string) => {
    loginWithDemoAccount(role, userId);
    if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/student/dashboard');
  };

  const pendingTeacher = users.find(
    (u) => u.role === 'teacher' && u.verificationStatus === 'pending'
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicTopBar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Email/Password Login */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold font-display">Sign in to EduSphere AI</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your registered school or educator email, or launch a preconfigured demo identity.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav.student@edusphere.demo"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-500">
              Don’t have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Register as Student or Teacher
              </Link>
            </div>
          </div>

          {/* Right Column: Clearly Labelled Demo Accounts */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDemoMode ? 'Demo Mode Active' : 'Sandbox Quick Switch'}</span>
              </div>
              <h2 className="text-lg font-bold font-display">
                Preconfigured Demonstration Accounts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Test the complete Student, Verified Teacher, Pending Teacher, and Administrator journeys with one click.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleDemoSelect('student', 'demo-student-1')}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Student Demo — Aarav Sharma
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Class 10 · CBSE · 640 XP · Math & Science History
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </button>

              <button
                onClick={() => handleDemoSelect('teacher', 'demo-teacher-1')}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Verified Teacher Demo — Dr. Meera Krishnan
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Approved Status · Can Answer Questions, Create & Host Quizzes
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </button>

              {pendingTeacher && (
                <button
                  onClick={() => handleDemoSelect('teacher', pendingTeacher.id)}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        Pending Teacher Demo — {pendingTeacher.displayName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Pending Verification · Demonstrates Unverified Teacher Restrictions
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                </button>
              )}

              <button
                onClick={() => handleDemoSelect('admin', 'demo-admin-1')}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Admin Demo — Vikramaditya Sen
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Verify Teachers, Moderate Content, Manage Users & Curriculum
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { registerAccount, boards } = useEduSphere();
  const navigate = useNavigate();

  // Only 'student' or 'teacher' allowed in public registration (Never 'admin')
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student Onboarding State
  const [classNumber, setClassNumber] = useState(10);
  const [boardId, setBoardId] = useState('CBSE');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Mathematics',
    'Science (Combined)',
    'English'
  ]);
  const [learningGoal, setLearningGoal] = useState('Board Examination Distinction');

  // Teacher Onboarding State
  const [qualifications, setQualifications] = useState('');
  const [institution, setInstitution] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [certificateFileName, setCertificateFileName] = useState('');
  const [certificateType, setCertificateType] = useState('B.Ed. & Postgraduate Degree Certificate');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableSubjects = getSubjectsForClass(classNumber);

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject.');
      return;
    }

    if (role === 'teacher' && !qualifications.trim()) {
      setError('Please enter your academic and teaching qualifications.');
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await registerAccount({
        displayName,
        email,
        password,
        role,
        classNumber,
        boardId,
        subjects: selectedSubjects,
        learningGoal,
        qualifications,
        institution,
        experienceYears,
        certificateFileName: certificateFileName || `${displayName.replace(/\s+/g, '_')}_Certificate.pdf`,
        certificateType
      });

      if (newUser.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicTopBar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold font-display">Create Your EduSphere AI Account</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your role below. Administrator accounts are provisioned strictly on the server and cannot be self-registered.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student (Classes 1–12)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                role === 'teacher'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Subject Teacher / Educator</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. Devika Bora' : 'e.g. Prof. S. Goswami'}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>

            {role === 'student' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold">Class (1–12)</label>
                    <select
                      value={classNumber}
                      onChange={(e) => setClassNumber(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      {CLASS_LEVELS.map((cls) => (
                        <option key={cls} value={cls}>
                          Class {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold">Education Board</label>
                    <select
                      value={boardId}
                      onChange={(e) => setBoardId(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      {boards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} — {b.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold">Learning Goal / Preference</label>
                  <input
                    type="text"
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold">
                      Academic & Teaching Qualifications
                    </label>
                    <input
                      type="text"
                      required
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder="e.g. M.Sc. Mathematics, B.Ed."
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold">School / Institution</label>
                    <input
                      type="text"
                      required
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Cotton Collegiate HS School"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">
                      Qualification Certificate Upload (Required for Verification)
                    </span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400">
                      Initial status: Pending Admin Approval
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={certificateType}
                      onChange={(e) => setCertificateType(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="B.Ed. & Postgraduate Degree Certificate">
                        B.Ed. & Postgraduate Degree Certificate
                      </option>
                      <option value="State Teacher Eligibility Certificate (TET/CTET)">
                        State Teacher Eligibility Certificate (TET/CTET)
                      </option>
                      <option value="School Faculty Appointment Letter">
                        School Faculty Appointment Letter
                      </option>
                    </select>

                    <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-indigo-500">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="truncate">
                        {certificateFileName || 'Attach PDF/Image Certificate'}
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
              </>
            )}

            {/* Subject Multi-Select */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold">
                {role === 'student' ? 'Enrolled Subjects' : 'Subjects You Teach'}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSubjects.map((subj) => {
                  const active = selectedSubjects.includes(subj);
                  return (
                    <button
                      type="button"
                      key={subj}
                      onClick={() => toggleSubject(subj)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      {subj}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {submitting
                ? 'Creating Account...'
                : role === 'teacher'
                ? 'Register & Submit for Teacher Verification'
                : 'Complete Student Onboarding'}
            </button>
          </form>

          <div className="text-xs text-center text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
