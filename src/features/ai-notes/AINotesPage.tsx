import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  BookmarkPlus,
  Copy,
  Trash2,
  Check,
  BookOpen
} from 'lucide-react';
import { useEduSphere } from '../../contexts/EduSphereContext';
import { aiProvider } from '../../services/ai/MockAIProvider';
import { CLASS_LEVELS, getSubjectsForClass } from '../../constants/curriculum';
import { GeneratedNoteContent, SavedNote } from '../../types/edusphere';
import { useToast } from '../../contexts/ToastContext';

export const AINotesPage: React.FC = () => {
  const { currentUser, boards, savedNotes, saveStudyNote, deleteStudyNote } = useEduSphere();
  const { showToast } = useToast();

  const [classNumber, setClassNumber] = useState<number>(currentUser?.classNumber || 10);
  const [boardId, setBoardId] = useState<string>(currentUser?.boardId || 'CBSE');
  const [subject, setSubject] = useState<string>('Science (Combined)');
  const [topic, setTopic] = useState<string>('Electricity & Ohm’s Law');
  const [format, setFormat] = useState<'comprehensive' | 'exam_revision' | 'flash_summary'>(
    'exam_revision'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeNoteContent, setActiveNoteContent] = useState<GeneratedNoteContent | null>(
    savedNotes[0]?.content || null
  );
  const [copied, setCopied] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const myNotes = savedNotes.filter(
    (n) => !currentUser || n.studentId === currentUser.id
  );
  const availableSubjects = getSubjectsForClass(classNumber);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Topic required', 'Please enter a chapter or topic name.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await aiProvider.generateStudyNotes({
        classNumber,
        boardId,
        subject,
        topic,
        format
      });
      setActiveNoteContent(generated);
      showToast('Structured Study Notes Generated', generated.topicTitle);
    } catch (err) {
      showToast(
        'Generation Error',
        err instanceof Error ? err.message : 'Could not generate notes.',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCurrentNote = async () => {
    if (!activeNoteContent) return;
    setIsSaving(true);
    try {
      await saveStudyNote({
        title: activeNoteContent.topicTitle,
        classNumber,
        boardId,
        subject,
        topic,
        format,
        content: activeNoteContent
      });
    } catch (err) {
      showToast(
        'Save failed',
        err instanceof Error ? err.message : 'Unable to save notes.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyNotes = async () => {
    if (!activeNoteContent) return;
    const text = [
      activeNoteContent.topicTitle,
      '',
      'SUMMARY:',
      activeNoteContent.shortSummary,
      '',
      'KEY DEFINITIONS:',
      ...activeNoteContent.importantDefinitions.map((d) => `- ${d.term}: ${d.definition}`),
      '',
      'KEY POINTS:',
      ...activeNoteContent.keyPoints.map((kp) => `• ${kp}`)
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard', 'Structured study notes copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSavedNote = (note: SavedNote) => {
    setClassNumber(note.classNumber);
    setBoardId(note.boardId);
    setSubject(note.subject);
    setTopic(note.topic);
    setFormat(note.format);
    setActiveNoteContent(note.content);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            Demo AI Study Notes Generator — supplemental revision aid; not an official board textbook.
          </span>
        </div>
        <span className="font-mono text-[11px]">+15 XP per saved note</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Generator Form & Saved Notes Library */}
        <div className="lg:col-span-4 space-y-6">
          <form
            onSubmit={handleGenerate}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h1 className="text-lg font-bold font-display">Configure Study Notes</h1>

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Chapter or Topic</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quadratic Equations, Photosynthesis, Ohm’s Law"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Notes Format</label>
              <select
                value={format}
                onChange={(e) =>
                  setFormat(
                    e.target.value as 'comprehensive' | 'exam_revision' | 'flash_summary'
                  )
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="exam_revision">Board Exam Revision Sheet</option>
                <option value="comprehensive">Comprehensive Chapter Notes</option>
                <option value="flash_summary">Quick Flash Summary</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {isGenerating ? 'Generating Structured Notes...' : 'Generate Study Notes'}
            </button>
          </form>

          {/* Saved Notes Library */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-display">My Saved Notes</h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {myNotes.length} saved
              </span>
            </div>

            {myNotes.length > 0 ? (
              <div className="space-y-2.5">
                {myNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <button
                      onClick={() => handleOpenSavedNote(note)}
                      className="text-left w-full group"
                    >
                      <div className="text-xs font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                        {note.topic}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Class {note.classNumber} · {note.boardId} · {note.subject}
                      </div>
                    </button>

                    {confirmDeleteId === note.id ? (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                        <span className="text-rose-600 font-medium">Delete this note?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              await deleteStudyNote(note.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 bg-rose-600 text-white rounded font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800/70">
                        <button
                          onClick={() => handleOpenSavedNote(note)}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Reopen Note
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(note.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          aria-label="Delete saved note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                No saved notes yet. Generate a note and click “Save to Library”.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Structured Note Viewer */}
        <div className="lg:col-span-8">
          {activeNoteContent ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Structured Study Material · {subject}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display">
                    {activeNoteContent.topicTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Notes'}</span>
                  </button>
                  <button
                    onClick={handleSaveCurrentNote}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save to Library'}</span>
                  </button>
                </div>
              </div>

              {/* Short Summary */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Executive Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeNoteContent.shortSummary}
                </p>
              </div>

              {/* Important Definitions */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold font-display text-indigo-600 dark:text-indigo-400">
                  Important Definitions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeNoteContent.importantDefinitions.map((def, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1"
                    >
                      <div className="text-xs font-bold">{def.term}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {def.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Concepts */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold font-display text-indigo-600 dark:text-indigo-400">
                  Core Syllabus Concepts
                </h3>
                <div className="space-y-3">
                  {activeNoteContent.mainConcepts.map((mc, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1"
                    >
                      <div className="text-sm font-bold">{mc.heading}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {mc.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Points & Revision Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    High-Yield Key Points
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                    {activeNoteContent.keyPoints.map((kp, i) => (
                      <li key={i} className="leading-relaxed">
                        {kp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Quick Revision Checklist
                  </h3>
                  <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside">
                    {activeNoteContent.revisionSection.map((rs, i) => (
                      <li key={i} className="leading-relaxed">
                        {rs}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Worked Examples */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold font-display">Worked Examples</h3>
                {activeNoteContent.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300"
                  >
                    {ex}
                  </div>
                ))}
              </div>

              {/* Self-Assessment Practice Questions */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold font-display">
                  Self-Assessment Practice Questions
                </h3>
                <div className="space-y-2.5">
                  {activeNoteContent.practiceQuestions.map((pq, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1"
                    >
                      <div className="text-xs font-semibold">
                        Q{i + 1}: {pq.question}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        <strong>Hint:</strong> {pq.hint}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-base font-bold font-display">No Study Note Selected</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Configure your class, board, subject, and chapter on the left and click “Generate Study Notes”.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
