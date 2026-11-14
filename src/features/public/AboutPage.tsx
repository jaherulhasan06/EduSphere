import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { PublicTopBar } from '../../app/layouts/RoleLayouts';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { CLASS_LEVELS, getSubjectsForClass } from '../../constants/curriculum';

export const AboutPage: React.FC = () => {
  const { boards, curriculum, isDemoMode, isSupabaseConnected } = useEduSphere();
  const [selectedBoard, setSelectedBoard] = useState('CBSE');
  const [selectedClass, setSelectedClass] = useState(10);

  const matchingSubjects = curriculum.filter(
    (c) => c.boardId === selectedBoard && c.classNumber === selectedClass
  );
  const stageSubjects = getSubjectsForClass(selectedClass);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicTopBar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-3">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Platform Architecture & Curriculum Coverage
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display">
            About EduSphere AI & Supported Boards
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            EduSphere AI is designed as a multi-board school education ecosystem supporting Classes 1–12 across CBSE, SEBA / Assam State Board, ICSE, and international curricula.
          </p>
        </div>

        {/* Runtime Status Transparency Banner */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Environment & AI Provider Transparency</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              AI Provider: <strong>MockAIProvider (Replaceable AIProvider Interface)</strong> · Database Mode:{' '}
              <strong>
                {isSupabaseConnected
                  ? 'Connected to Supabase PostgreSQL & Realtime'
                  : 'Demo Mode with Authoritative Express + WebSocket Backend'}
              </strong>
            </p>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
          >
            Enter Workspace
          </Link>
        </div>

        {/* Interactive Syllabus Explorer */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold font-display">Interactive Curriculum Explorer</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select any education board and class (1–12) to inspect supported subjects and sample chapters.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.region}
                  </option>
                ))}
              </select>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                {CLASS_LEVELS.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Available Subjects for Class {selectedClass} ({selectedBoard}):
            </div>
            <div className="flex flex-wrap gap-2">
              {stageSubjects.map((subj) => (
                <span
                  key={subj}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {subj}
                </span>
              ))}
            </div>

            {matchingSubjects.length > 0 && (
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingSubjects.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold">{item.name}</h3>
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        {item.chapters.length} Chapters
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {item.chapters.map((ch, idx) => (
                        <li key={ch}>
                          {idx + 1}. {ch}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
