import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Trophy,
  MessageSquareText,
  BarChart3,
  FileText,
  Radio,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Award,
  CalendarCheck2,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { PublicTopBar } from '../../app/layouts/RoleLayouts';
import { useEduSphere } from '../../contexts/EduSphereContext';

export const LandingPage: React.FC = () => {
  const { loginWithDemoAccount, boards, liveRooms } = useEduSphere();
  const navigate = useNavigate();
  const [quickRoomCode, setQuickRoomCode] = useState('ED1042');

  const handleQuickDemoEnter = (role: 'student' | 'teacher' | 'admin') => {
    loginWithDemoAccount(role);
    if (role === 'student') navigate('/student/dashboard');
    if (role === 'teacher') navigate('/teacher/dashboard');
    if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
      <PublicTopBar />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 border-b border-slate-200/80 dark:border-white/10 hero-mesh-backdrop">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Headline, Copy, Primary & Secondary CTAs, Quick Demo Access */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Classes 1–12 Learning Ecosystem</span>
                <span aria-hidden="true">·</span>
                <span>CBSE · SEBA · ICSE · IB</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] font-display"
                style={{ textWrap: 'balance' }}
              >
                Learn Smarter. Compete Better. Grow Together.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Your complete learning ecosystem. Learn with AI, compete with friends, get guidance from teachers and track your progress — all in one place.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-md shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all whitespace-nowrap"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 rounded-xl shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all whitespace-nowrap"
                >
                  <span>Explore Platform</span>
                </a>
              </div>
            </div>

            {/* Instant Interactive Demo Access Cards */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Instant Interactive Demo Access (Preconfigured Roles)
                </span>
                <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  1-Click Launch
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleQuickDemoEnter('student')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] hover:border-indigo-500/60 dark:hover:border-indigo-400/60 hover:-translate-y-0.5 text-left transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        Student Demo
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
                        Class 10 · 640 XP
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                </button>

                <button
                  onClick={() => handleQuickDemoEnter('teacher')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] hover:border-emerald-500/60 dark:hover:border-emerald-400/60 hover:-translate-y-0.5 text-left transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                        Teacher Demo
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Dr. Meera · Verified
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0" />
                </button>

                <button
                  onClick={() => handleQuickDemoEnter('admin')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] hover:border-violet-500/60 dark:hover:border-violet-400/60 hover:-translate-y-0.5 text-left transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 truncate">
                        Admin Demo
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Governance Console
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Layered Dark Glass Live Student Workspace Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-slate-900/95 text-white border border-slate-800 shadow-2xl shadow-indigo-500/10 space-y-6">
            <div className="space-y-3 border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-indigo-400 font-semibold">
                    Live Student Workspace Preview
                  </div>
                  <div className="text-base font-bold tracking-tight font-display mt-0.5">
                    Aarav Sharma · Class 10 (CBSE)
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-[11px] text-slate-400">Current Rank</div>
                  <div className="text-sm font-bold text-amber-400">Level 3 · 640 XP</div>
                </div>
              </div>

              {/* Visual XP Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    style={{ width: '56%' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums">
                  <span>Subject Scholar</span>
                  <span>140 / 250 XP to Level 4</span>
                </div>
              </div>
            </div>

            {/* Simulated AI Tutor & Quiz Arena Sub-Cards with Hover Elevation */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/75 border border-white/10 hover:border-indigo-500/40 transition-all space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Learning Tutor · Physics</span>
                  </span>
                  <span className="text-slate-400">Ohm’s Law & Resistivity</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  “When a metallic wire of resistance R is stretched to double its length at constant volume, its cross-sectional area halves, so R_new = 4R.”
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 font-mono tabular-nums">
                <div className="p-4 rounded-xl bg-slate-800/75 border border-white/10 hover:border-emerald-500/40 transition-all">
                  <div className="text-[11px] text-slate-400 font-sans">Math Mastery</div>
                  <div className="text-xl font-bold text-white mt-1">92% Avg</div>
                  <div className="text-[11px] text-emerald-400 mt-1 font-sans font-medium">
                    Quadratic Equations
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/75 border border-white/10 hover:border-cyan-500/40 transition-all">
                  <div className="text-[11px] text-slate-400 font-sans">Active Live Arena</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">Room ED1042</div>
                  <div className="text-[11px] text-slate-300 mt-1 font-sans">
                    Host: Dr. Meera
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Live Room Quick Join with Glowing Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-300 font-medium">
                Try the Live Quiz Arena right now:
              </div>
              <button
                onClick={() => {
                  loginWithDemoAccount('student');
                  navigate(`/student/live-quiz/${quickRoomCode}`);
                }}
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-500/20 transition-all whitespace-nowrap shrink-0 font-mono tabular-nums"
              >
                Join Room {quickRoomCode}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Overview & Supported Curriculum Boards */}
      <section className="py-20 px-6 border-b border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Extensible Multi-Board Curriculum Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
                Configurable Multi-Board Curriculum Architecture
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Built for Classes 1–12 across national and state education boards without hardcoding around a single syllabus.
              </p>
            </div>
            <Link
              to="/about"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              Inspect Full Curriculum Matrix →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {board.name}
                    </span>
                    <span>{board.region}</span>
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                    {board.fullName}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {board.description}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-white/5 font-medium">
                  Classes 1–12 · Chapter-mapped AI Notes & Quizzes
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI-Powered Learning Features & 6. Gamified Learning & 7. Analytics */}
      <section
        id="features"
        className="py-20 px-6 bg-white dark:bg-[#111827]/60 border-b border-slate-200/80 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Unified Learning & Gamification Platform
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Complete End-to-End Student Learning & Gamification Suite
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Every tool connects directly to your class level, board syllabus, and performance analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight font-display">AI Learning Tutor</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive structured 5-part explanations: Simple Concept Summary, Step-by-Step Breakdown, Worked Example, Key Exam Points, and a Follow-up Practice Question.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight font-display">
                AI Study Notes Generator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate comprehensive chapter notes, definitions, and board revision sheets. Save notes to your personal library, copy for offline study, and earn XP.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight font-display">
                Practice Quizzes & Instant Scoring
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Configure difficulty and question count for any topic. Server-validated scoring reveals step-by-step explanations and highlights weak subtopics automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight font-display">
                Student Performance Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track subject-wise accuracy, quiz score progression, and weak topics identified through explainable performance rules.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight font-display">
                Personalized Study Planner
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Schedule daily and weekly study tasks with automatic revision recommendations triggered by low-scoring quiz subtopics.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] space-y-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold tracking-tight font-display">
                XP, Levels & Class Leaderboards
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Earn non-duplicate XP for completing quizzes, study tasks, and live competitions. Progress through academic ranks and compare on global or class leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Quiz Arena Preview */}
      <section id="live-arena" className="py-20 px-6 border-b border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              Real-Time Multiplayer Competition
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Live Quiz Arena with Authoritative Scoring
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Both students and verified teachers can host live multiplayer quiz rooms. Participants join via a 6-character room code, answer synchronized questions under a live countdown, and watch the leaderboard update in real time.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Server-authoritative answer validation prevents client score tampering</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Duplicate and late answer protection per question index</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time WebSocket & Supabase Realtime room state synchronization</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold tracking-tight font-display">
                  Active Public Quiz Rooms
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter a room code or click an active room to join immediately
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3">
              {liveRooms.slice(0, 2).map((room) => (
                <div
                  key={room.id}
                  className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        Code: {room.roomCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans">Host: {room.hostName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize font-sans">{room.status}</span>
                    </div>
                    <div className="text-sm font-bold tracking-tight mt-1">
                      {room.roomName}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      loginWithDemoAccount('student');
                      navigate(`/student/live-quiz/${room.roomCode}`);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
                  >
                    Enter Room
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="text"
                value={quickRoomCode}
                onChange={(e) => setQuickRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter Room Code (e.g. ED1042)"
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 font-mono tabular-nums uppercase"
              />
              <button
                onClick={() => {
                  if (!quickRoomCode.trim()) return;
                  loginWithDemoAccount('student');
                  navigate(`/student/live-quiz/${quickRoomCode.trim()}`);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap"
              >
                Join by Code
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Verified Teacher Community & 9. Role Benefits */}
      <section
        id="teacher-community"
        className="py-20 px-6 bg-white dark:bg-[#111827]/60 border-b border-slate-200/80 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Verified Academic Community
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Built for Students, Verified Teachers & School Administrators
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Strict role verification ensures only credentialed educators answer student questions and publish study materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Role Card */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-6">
              <div className="space-y-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold tracking-tight font-display">
                  For Students (Classes 1–12)
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <li>• Interactive AI Tutor & structured chapter notes</li>
                  <li>• Timed practice quizzes & multiplayer Live Quiz Arena</li>
                  <li>• Ask questions to verified teachers & private follow-ups</li>
                  <li>• Track subject analytics, XP levels & study planner</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemoEnter('student')}
                className="w-full py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-xs transition-all"
              >
                Launch Student Experience
              </button>
            </div>

            {/* Teacher Role Card */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-6">
              <div className="space-y-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold tracking-tight font-display">
                  For Verified Teachers
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <li>• Upload qualification certificates for admin verification</li>
                  <li>• Answer student questions & guide private follow-ups</li>
                  <li>• Create custom board-aligned quizzes & host live rooms</li>
                  <li>• Publish study guides, worksheets & formula sheets</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemoEnter('teacher')}
                className="w-full py-2.5 text-xs font-semibold text-slate-900 dark:text-white bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Launch Teacher Experience
              </button>
            </div>

            {/* Admin Role Card */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#111827] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-6">
              <div className="space-y-3.5">
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold tracking-tight font-display">
                  For Platform Administrators
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <li>• Review teacher qualification documents & approve/reject</li>
                  <li>• Moderate reported community questions and answers</li>
                  <li>• Manage user accounts and role permissions safely</li>
                  <li>• Configure education boards, classes, subjects & chapters</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemoEnter('admin')}
                className="w-full py-2.5 text-xs font-semibold text-slate-900 dark:text-white bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Launch Admin Console
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Call to Action Section */}
      <section className="py-20 px-6 border-b border-slate-200/80 dark:border-white/10 hero-mesh-backdrop">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Ready to Transform How You Study and Compete?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Create a student or educator account in seconds, or explore our preloaded CBSE, SEBA, and ICSE demonstration workspaces immediately.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Sign In / Demo Switcher
            </button>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="py-8 px-6 bg-white dark:bg-[#090D16] text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white font-display">
              EduSphere AI
            </span>
            <span aria-hidden="true">·</span>
            <span>School Learning & Verified Teacher Community (Classes 1–12)</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-900 dark:hover:text-white">
              Curriculum & Architecture
            </Link>
            <Link to="/login" className="hover:text-slate-900 dark:hover:text-white">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-slate-900 dark:hover:text-white">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
