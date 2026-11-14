import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FileText,
  Trophy,
  Radio,
  MessageSquareText,
  BarChart3,
  CalendarCheck2,
  Award,
  UserCheck,
  Users,
  ShieldAlert,
  BookOpen,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
  Menu,
  X,
  PlusSquare,
  FolderKanban,
  Sparkles,
  CheckCircle2,
  Clock,
  Home
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { useTheme } from '../../contexts/ThemeContext';
import { calculateLevelFromXP } from '../../constants/curriculum';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Community Feed', to: '/student/dashboard', icon: Home },
  { label: 'AI Tutor', to: '/student/ai-tutor', icon: Bot },
  { label: 'AI Notes', to: '/student/ai-notes', icon: FileText },
  { label: 'Quiz Arena', to: '/student/quiz-arena', icon: Trophy },
  { label: 'Live Quiz Room', to: '/student/live-quiz/ED1042', icon: Radio },
  { label: 'Study Planner', to: '/student/study-planner', icon: CalendarCheck2 },
  { label: 'Performance', to: '/student/performance', icon: BarChart3 },
  { label: 'Leaderboard', to: '/student/leaderboard', icon: Award },
  { label: 'Academic Overview', to: '/student/overview', icon: LayoutDashboard },
  { label: 'Profile', to: '/student/profile', icon: User }
];

const TEACHER_NAV: NavItem[] = [
  { label: 'Community Feed', to: '/teacher/dashboard', icon: Home },
  { label: 'Questions Directory', to: '/teacher/questions', icon: MessageSquareText },
  { label: 'Create Quiz', to: '/teacher/create-quiz', icon: PlusSquare },
  { label: 'Host Live Quiz', to: '/teacher/host-quiz', icon: Radio },
  { label: 'Study Materials', to: '/teacher/resources', icon: BookOpen },
  { label: 'Verification', to: '/teacher/verification', icon: UserCheck },
  { label: 'Educator Overview', to: '/teacher/overview', icon: LayoutDashboard },
  { label: 'Contributions', to: '/teacher/contributions', icon: Award },
  { label: 'Profile', to: '/teacher/profile', icon: User }
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Teacher Verification', to: '/admin/teacher-verification', icon: UserCheck },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'Content Moderation', to: '/admin/moderation', icon: ShieldAlert },
  { label: 'Curriculum Data', to: '/admin/curriculum', icon: FolderKanban },
  { label: 'Quizzes & Rooms', to: '/admin/quizzes', icon: Trophy },
  { label: 'Platform Settings', to: '/admin/settings', icon: Settings }
];

export const PublicTopBar: React.FC = () => {
  const { currentUser } = useEduSphere();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const dashboardLink =
    currentUser?.role === 'teacher'
      ? '/teacher/dashboard'
      : currentUser?.role === 'admin'
      ? '/admin/dashboard'
      : '/student/dashboard';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <Link
        to="/"
        className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 font-display"
      >
        EduSphere AI
      </Link>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
        <a
          href="/#features"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
        >
          AI Learning
        </a>
        <a
          href="/#live-arena"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
        >
          Quiz Arena
        </a>
        <a
          href="/#teacher-community"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
        >
          Teachers
        </a>
        <Link
          to="/about"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
        >
          Curriculum
        </Link>
        <Link
          to="/login"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
        >
          Sign In
        </Link>
      </nav>

      {/* Zone 3: Primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {currentUser ? (
          <button
            onClick={() => navigate(dashboardLink)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Open Home Feed
          </button>
        ) : (
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Start Learning
          </button>
        )}
      </div>
    </header>
  );
};

interface RoleWorkspaceLayoutProps {
  allowedRole: 'student' | 'teacher' | 'admin';
}

export const RoleWorkspaceLayout: React.FC<RoleWorkspaceLayoutProps> = ({ allowedRole }) => {
  const { currentUser, isDemoMode, loginWithDemoAccount, logout } = useEduSphere();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5">
          <h1 className="text-2xl font-bold font-display">Sign in required</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please log in or select a demonstration account to access the {allowedRole} workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                loginWithDemoAccount(allowedRole);
              }}
              className="px-5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Enter {allowedRole.charAt(0).toUpperCase() + allowedRole.slice(1)} Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== allowedRole) {
    const correctDashboard =
      currentUser.role === 'teacher'
        ? '/teacher/dashboard'
        : currentUser.role === 'admin'
        ? '/admin/dashboard'
        : '/student/dashboard';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5">
          <ShieldAlert className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto" />
          <h1 className="text-2xl font-bold font-display">Role Access Restricted</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You are currently signed in as <strong>{currentUser.displayName}</strong> ({currentUser.role.toUpperCase()}). This section requires {allowedRole.toUpperCase()} permissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(correctDashboard)}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Open My Home Screen
            </button>
            {isDemoMode && (
              <button
                onClick={() => loginWithDemoAccount(allowedRole)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Switch to {allowedRole.toUpperCase()} Demo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const navItems =
    allowedRole === 'student'
      ? STUDENT_NAV
      : allowedRole === 'teacher'
      ? TEACHER_NAV
      : ADMIN_NAV;

  const xpStats =
    currentUser.role === 'student' ? calculateLevelFromXP(currentUser.xp || 0) : null;

  const activeNavItem =
    navItems.find((item) => location.pathname.startsWith(item.to.split('/:')[0])) ||
    navItems[0];

  const mobileBottomItems = navItems.slice(0, 5);

  const handleSwitchDemoRole = (targetRole: 'student' | 'teacher' | 'admin') => {
    loginWithDemoAccount(targetRole);
    if (targetRole === 'student') navigate('/student/dashboard');
    if (targetRole === 'teacher') navigate('/teacher/dashboard');
    if (targetRole === 'admin') navigate('/admin/dashboard');
  };

  const userInitials = currentUser.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Column: Pinned Compact Profile Summary Card + Navigation Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display whitespace-nowrap"
          >
            EduSphere AI
          </Link>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
            {allowedRole}
          </span>
        </div>

        {/* LinkedIn-Style Compact User Profile Summary Card Pinned at Top */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 font-display">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.displayName}
                </div>
                {currentUser.role === 'student' && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Class {currentUser.classNumber} · {currentUser.boardId} Board
                  </div>
                )}
                {currentUser.role === 'teacher' && (
                  <div className="flex items-center gap-1 text-xs">
                    {currentUser.verificationStatus === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Verified Teacher</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium capitalize">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{currentUser.verificationStatus}</span>
                      </span>
                    )}
                  </div>
                )}
                {currentUser.role === 'admin' && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Platform Administrator
                  </div>
                )}
              </div>
            </div>

            {currentUser.role === 'student' && xpStats && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {xpStats.rankTitle}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                    Lvl {xpStats.level} · {currentUser.xp} XP
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-200"
                    style={{ width: `${xpStats.progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {currentUser.role === 'teacher' && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Subjects: {(currentUser.subjects || []).join(' · ')}
              </div>
            )}
          </div>
        </div>

        {/* Main Sidebar Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Role Switcher Footer */}
        {isDemoMode && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Demo Environment Role Switch
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['student', 'teacher', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleSwitchDemoRole(r)}
                  className={`px-2 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                    currentUser.role === r
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Bar Contract */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 dark:text-slate-400 capitalize hidden sm:inline">
                {allowedRole} Workspace
              </span>
              <span className="text-slate-400 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activeNavItem.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isDemoMode && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Mode Active</span>
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
              title="Toggle Light / Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
            {isDemoMode && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Switch Demo Role:</span>
                <div className="flex gap-1">
                  {(['student', 'teacher', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSwitchDemoRole(r);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md capitalize font-medium ${
                        currentUser.role === r
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Compact Bottom Navigation (<= 15% viewport height) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center px-2">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
