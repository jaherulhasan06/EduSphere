import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  BoardConfig,
  CommunityQuestion,
  ContentReport,
  GeneratedNoteContent,
  LiveQuizRoom,
  QuizAttemptRecord,
  QuizItem,
  QuizQuestionItem,
  SavedNote,
  StudyTask,
  SubjectCurriculum,
  TeacherResource,
  TeacherVerificationStatus,
  UserProfile,
  XPTransaction
} from '../types/edusphere';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { useToast } from './ToastContext';

interface RegisterPayload {
  displayName: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher';
  classNumber?: number;
  boardId?: string;
  subjects?: string[];
  learningGoal?: string;
  qualifications?: string;
  institution?: string;
  experienceYears?: number;
  certificateFileName?: string;
  certificateType?: string;
}

interface EduSphereContextValue {
  isLoading: boolean;
  isDemoMode: boolean;
  isSupabaseConnected: boolean;
  currentUser: UserProfile | null;
  users: UserProfile[];
  boards: BoardConfig[];
  curriculum: SubjectCurriculum[];
  quizzes: QuizItem[];
  quizAttempts: QuizAttemptRecord[];
  savedNotes: SavedNote[];
  questions: CommunityQuestion[];
  studyTasks: StudyTask[];
  teacherResources: TeacherResource[];
  xpTransactions: XPTransaction[];
  liveRooms: LiveQuizRoom[];
  reports: ContentReport[];

  // Auth actions
  loginWithDemoAccount: (role: 'student' | 'teacher' | 'admin', specificUserId?: string) => void;
  loginWithEmail: (email: string, password?: string) => Promise<UserProfile>;
  registerAccount: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Notes actions
  saveStudyNote: (params: {
    title: string;
    classNumber: number;
    boardId: string;
    subject: string;
    topic: string;
    format: 'comprehensive' | 'exam_revision' | 'flash_summary';
    content: GeneratedNoteContent;
  }) => Promise<SavedNote>;
  deleteStudyNote: (noteId: string) => Promise<void>;

  // Quiz actions
  createQuiz: (params: {
    title: string;
    classNumber: number;
    boardId: string;
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    durationSeconds: number;
    questions: QuizQuestionItem[];
  }) => Promise<QuizItem>;
  submitQuizAttempt: (
    quizId: string,
    selectedAnswers: Record<string, number>
  ) => Promise<QuizAttemptRecord>;

  // Live Quiz Arena actions
  createLiveRoom: (params: {
    roomName: string;
    quizId: string;
    questionDurationSeconds: number;
  }) => Promise<LiveQuizRoom>;
  joinLiveRoom: (roomCode: string) => Promise<LiveQuizRoom>;
  controlLiveRoom: (
    roomCode: string,
    action: 'start' | 'next' | 'finish' | 'cancel'
  ) => Promise<LiveQuizRoom>;
  submitLiveRoomAnswer: (
    roomCode: string,
    questionIndex: number,
    selectedOptionIndex: number
  ) => Promise<{
    isCorrect: boolean;
    pointsAwarded: number;
    correctOptionIndex: number;
    explanation: string;
    room: LiveQuizRoom;
  }>;
  subscribeToRoomRealtime: (roomCode: string) => void;

  // Teacher Community actions
  postStudentQuestion: (params: {
    classNumber: number;
    boardId: string;
    subject: string;
    title: string;
    description: string;
  }) => Promise<CommunityQuestion>;
  postTeacherAnswer: (
    questionId: string,
    content: string,
    resourceTitle?: string,
    resourceUrl?: string
  ) => Promise<void>;
  markAnswerHelpful: (questionId: string, answerId: string) => Promise<void>;
  postPrivateFollowUp: (
    questionId: string,
    content: string,
    teacherId?: string
  ) => Promise<void>;
  reportContent: (
    targetType: 'question' | 'answer',
    targetId: string,
    reason: string
  ) => Promise<void>;

  // Study Planner actions
  addStudyTask: (params: {
    title: string;
    subject: string;
    topic: string;
    dueDate: string;
  }) => Promise<void>;
  toggleStudyTask: (taskId: string, completed: boolean) => Promise<void>;
  deleteStudyTask: (taskId: string) => Promise<void>;

  // Teacher Resources
  publishTeacherResource: (params: {
    title: string;
    description: string;
    classNumber: number;
    boardId: string;
    subject: string;
    resourceType: 'guide' | 'worksheet' | 'formula_sheet' | 'revision_notes';
    content: string;
  }) => Promise<void>;

  // Admin actions
  reviewTeacherVerification: (
    teacherId: string,
    status: TeacherVerificationStatus,
    reviewNotes: string
  ) => Promise<void>;
  setUserAccountStatus: (userId: string, status: 'active' | 'suspended') => Promise<void>;
  moderateReport: (
    reportId: string,
    action: 'remove_content' | 'dismiss'
  ) => Promise<void>;
  addOrUpdateCurriculum: (
    type: 'board' | 'subject',
    payload: Record<string, unknown>
  ) => Promise<void>;
  refreshPlatformState: () => Promise<void>;
}

const EduSphereContext = createContext<EduSphereContextValue | undefined>(undefined);

const SESSION_STORAGE_KEY = 'edusphere_active_user_id';

export const EduSphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [boards, setBoards] = useState<BoardConfig[]>([]);
  const [curriculum, setCurriculum] = useState<SubjectCurriculum[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRecord[]>([]);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [teacherResources, setTeacherResources] = useState<TeacherResource[]>([]);
  const [xpTransactions, setXpTransactions] = useState<XPTransaction[]>([]);
  const [liveRooms, setLiveRooms] = useState<LiveQuizRoom[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  const refreshPlatformState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to load platform state');
      const data = await res.json();
      setUsers(data.users || []);
      setBoards(data.boards || []);
      setCurriculum(data.curriculum || []);
      setQuizzes(data.quizzes || []);
      setQuizAttempts(data.quizAttempts || []);
      setSavedNotes(data.savedNotes || []);
      setQuestions(data.questions || []);
      setStudyTasks(data.studyTasks || []);
      setTeacherResources(data.teacherResources || []);
      setXpTransactions(data.xpTransactions || []);
      setLiveRooms(data.liveRooms || []);
      setReports(data.reports || []);

      const savedUserId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedUserId) {
        const found = (data.users || []).find((u: UserProfile) => u.id === savedUserId);
        if (found && found.status !== 'suspended') {
          setCurrentUser(found);
        }
      }
    } catch (err) {
      console.error('Error fetching initial platform state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect WebSocket for Realtime Quiz Arena & Room Synchronization
  useEffect(() => {
    refreshPlatformState();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.room) {
          const updatedRoom: LiveQuizRoom = payload.room;
          setLiveRooms((prev) => {
            const exists = prev.some((r) => r.id === updatedRoom.id || r.roomCode === updatedRoom.roomCode);
            if (exists) {
              return prev.map((r) =>
                r.id === updatedRoom.id || r.roomCode === updatedRoom.roomCode ? updatedRoom : r
              );
            }
            return [updatedRoom, ...prev];
          });
        }
      } catch {
        // Ignore malformed message
      }
    };

    return () => {
      ws.close();
    };
  }, [refreshPlatformState]);

  // Also subscribe to Supabase Realtime if configured
  const subscribeToRoomRealtime = useCallback((roomCode: string) => {
    const cleanCode = roomCode.toUpperCase().trim();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe_room', roomCode: cleanCode }));
    }
    if (isSupabaseConfigured && supabase) {
      const channel = supabase.channel(`live-room-${cleanCode}`);
      channel.subscribe();
    }
  }, []);

  const loginWithDemoAccount = useCallback(
    (role: 'student' | 'teacher' | 'admin', specificUserId?: string) => {
      let target: UserProfile | undefined;
      if (specificUserId) {
        target = users.find((u) => u.id === specificUserId);
      } else {
        target = users.find((u) => u.role === role);
      }
      if (target) {
        setCurrentUser(target);
        localStorage.setItem(SESSION_STORAGE_KEY, target.id);
        showToast(
          `Signed in as ${target.displayName}`,
          `Active Role: ${target.role.toUpperCase()} (Demo Environment)`,
          'info'
        );
      }
    },
    [users, showToast]
  );

  const loginWithEmail = useCallback(
    async (email: string, password?: string): Promise<UserProfile> => {
      const cleanEmail = email.trim().toLowerCase();
      if (isSupabaseConfigured && supabase && password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (error) {
          throw new Error(error.message);
        }
      }

      const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!matched) {
        throw new Error(
          'No account found with that email. Use one of the Demo Quick-Access accounts or register a new account.'
        );
      }
      if (matched.status === 'suspended') {
        throw new Error('This account has been suspended by a platform administrator.');
      }

      setCurrentUser(matched);
      localStorage.setItem(SESSION_STORAGE_KEY, matched.id);
      showToast(`Welcome back, ${matched.displayName}`, 'Session authenticated successfully.');
      return matched;
    },
    [users, showToast]
  );

  const registerAccount = useCallback(
    async (payload: RegisterPayload): Promise<UserProfile> => {
      if (isSupabaseConfigured && supabase && payload.password) {
        const { error } = await supabase.auth.signUp({
          email: payload.email.trim(),
          password: payload.password,
          options: {
            data: {
              display_name: payload.displayName,
              role: payload.role
            }
          }
        });
        if (error) {
          throw new Error(error.message);
        }
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      const newUser: UserProfile = data.user;
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem(SESSION_STORAGE_KEY, newUser.id);
      showToast(
        `Account created for ${newUser.displayName}`,
        newUser.role === 'teacher'
          ? 'Your teacher profile is currently pending administrator verification.'
          : 'Welcome to EduSphere AI! You earned 100 starter XP.'
      );
      return newUser;
    },
    [showToast]
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    showToast('Signed out', 'You have been safely logged out.', 'info');
  }, [showToast]);

  const updateCurrentUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!currentUser) return;
      const res = await fetch(`/api/profile/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }
      setCurrentUser(data.user);
      setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      showToast('Profile updated', 'Your changes have been saved.');
    },
    [currentUser, showToast]
  );

  const saveStudyNote = useCallback(
    async (params: {
      title: string;
      classNumber: number;
      boardId: string;
      subject: string;
      topic: string;
      format: 'comprehensive' | 'exam_revision' | 'flash_summary';
      content: GeneratedNoteContent;
    }): Promise<SavedNote> => {
      if (!currentUser) throw new Error('Please log in to save study notes.');
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          ...params
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save notes.');

      setSavedNotes((prev) => [data.note, ...prev]);
      if (data.user) {
        setCurrentUser(data.user);
        setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      }
      showToast(
        'Study notes saved',
        data.xpEarned > 0 ? `+${data.xpEarned} XP awarded for structured revision!` : 'Saved to your personal library.'
      );
      return data.note;
    },
    [currentUser, showToast]
  );

  const deleteStudyNote = useCallback(
    async (noteId: string) => {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note.');
      setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
      showToast('Note deleted', 'Removed from your saved notes library.', 'info');
    },
    [showToast]
  );

  const createQuiz = useCallback(
    async (params: {
      title: string;
      classNumber: number;
      boardId: string;
      subject: string;
      topic: string;
      difficulty: 'easy' | 'medium' | 'hard';
      durationSeconds: number;
      questions: QuizQuestionItem[];
    }): Promise<QuizItem> => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: currentUser.id,
          ...params
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create quiz.');
      setQuizzes((prev) => [data.quiz, ...prev]);
      return data.quiz;
    },
    [currentUser]
  );

  const submitQuizAttempt = useCallback(
    async (
      quizId: string,
      selectedAnswers: Record<string, number>
    ): Promise<QuizAttemptRecord> => {
      if (!currentUser) throw new Error('Authentication required to submit quiz.');
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          selectedAnswers
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to score quiz attempt.');

      setQuizAttempts((prev) => [data.attempt, ...prev]);
      if (data.user) {
        setCurrentUser(data.user);
        setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      }
      await refreshPlatformState();
      showToast(
        `Quiz Completed: ${data.attempt.percentage}%`,
        data.attempt.xpEarned > 0
          ? `You earned +${data.attempt.xpEarned} XP!`
          : 'Practice attempt recorded in your analytics.'
      );
      return data.attempt;
    },
    [currentUser, refreshPlatformState, showToast]
  );

  const createLiveRoom = useCallback(
    async (params: {
      roomName: string;
      quizId: string;
      questionDurationSeconds: number;
    }): Promise<LiveQuizRoom> => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch('/api/live-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: currentUser.id,
          ...params
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create live room.');

      setLiveRooms((prev) => {
        const exists = prev.some((r) => r.id === data.room.id);
        return exists ? prev : [data.room, ...prev];
      });
      showToast(`Live Room Created: ${data.room.roomCode}`, 'Share the room code with participants.');
      return data.room;
    },
    [currentUser, showToast]
  );

  const joinLiveRoom = useCallback(
    async (roomCode: string): Promise<LiveQuizRoom> => {
      if (!currentUser) throw new Error('Please log in to join a live quiz room.');
      const res = await fetch(`/api/live-rooms/${encodeURIComponent(roomCode.trim())}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          displayName: currentUser.displayName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join live room.');

      setLiveRooms((prev) =>
        prev.map((r) => (r.roomCode === data.room.roomCode ? data.room : r))
      );
      subscribeToRoomRealtime(data.room.roomCode);
      showToast(`Joined Room ${data.room.roomCode}`, data.room.roomName);
      return data.room;
    },
    [currentUser, subscribeToRoomRealtime, showToast]
  );

  const controlLiveRoom = useCallback(
    async (
      roomCode: string,
      action: 'start' | 'next' | 'finish' | 'cancel'
    ): Promise<LiveQuizRoom> => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch(`/api/live-rooms/${encodeURIComponent(roomCode)}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: currentUser.id,
          action
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Room control action failed.');

      setLiveRooms((prev) =>
        prev.map((r) => (r.roomCode === data.room.roomCode ? data.room : r))
      );
      if (action === 'finish') {
        await refreshPlatformState();
      }
      return data.room;
    },
    [currentUser, refreshPlatformState]
  );

  const submitLiveRoomAnswer = useCallback(
    async (roomCode: string, questionIndex: number, selectedOptionIndex: number) => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch(`/api/live-rooms/${encodeURIComponent(roomCode)}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          questionIndex,
          selectedOptionIndex
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit answer.');

      setLiveRooms((prev) =>
        prev.map((r) => (r.roomCode === data.room.roomCode ? data.room : r))
      );
      await refreshPlatformState();
      return data;
    },
    [currentUser, refreshPlatformState]
  );

  const postStudentQuestion = useCallback(
    async (params: {
      classNumber: number;
      boardId: string;
      subject: string;
      title: string;
      description: string;
    }): Promise<CommunityQuestion> => {
      if (!currentUser) throw new Error('Please log in to ask a question.');
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          ...params
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post question.');

      setQuestions((prev) => [data.question, ...prev]);
      await refreshPlatformState();
      showToast('Question Posted to Verified Teachers', '+10 XP awarded for curiosity!');
      return data.question;
    },
    [currentUser, refreshPlatformState, showToast]
  );

  const postTeacherAnswer = useCallback(
    async (
      questionId: string,
      content: string,
      resourceTitle?: string,
      resourceUrl?: string
    ) => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: currentUser.id,
          content,
          resourceTitle,
          resourceUrl
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish answer.');

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? data.question : q))
      );
      showToast('Official Explanation Published', 'Your answer is now visible to students.');
    },
    [currentUser, showToast]
  );

  const markAnswerHelpful = useCallback(
    async (questionId: string, answerId: string) => {
      if (!currentUser) return;
      const res = await fetch(
        `/api/questions/${questionId}/answers/${answerId}/helpful`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        }
      );
      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? data.question : q))
        );
        showToast('Marked as helpful', 'Thank you for recognizing this teacher explanation.');
      }
    },
    [currentUser, showToast]
  );

  const postPrivateFollowUp = useCallback(
    async (questionId: string, content: string, teacherId?: string) => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch(`/api/questions/${questionId}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          teacherId,
          content
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send private follow-up.');

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? data.question : q))
      );
      showToast('Private Follow-Up Sent', 'Visible only to you, the teacher, and moderators.');
    },
    [currentUser, showToast]
  );

  const reportContent = useCallback(
    async (targetType: 'question' | 'answer', targetId: string, reason: string) => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: currentUser.id,
          targetType,
          targetId,
          reason
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit report.');

      setReports((prev) => [data.report, ...prev]);
      showToast('Content Reported', 'Platform moderators will review this item.', 'info');
    },
    [currentUser, showToast]
  );

  const addStudyTask = useCallback(
    async (params: {
      title: string;
      subject: string;
      topic: string;
      dueDate: string;
    }) => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch('/api/study-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          ...params
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add task.');
      setStudyTasks((prev) => [data.task, ...prev]);
      showToast('Study task added', `Scheduled for ${params.dueDate}`);
    },
    [currentUser, showToast]
  );

  const toggleStudyTask = useCallback(
    async (taskId: string, completed: boolean) => {
      const res = await fetch(`/api/study-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task.');
      setStudyTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
      if (data.user) {
        setCurrentUser(data.user);
        setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      }
      if (completed && data.xpEarned > 0) {
        showToast('Study Task Completed!', `+${data.xpEarned} XP earned.`);
      }
    },
    [showToast]
  );

  const deleteStudyTask = useCallback(
    async (taskId: string) => {
      const res = await fetch(`/api/study-tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete study task.');
      setStudyTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('Task removed', undefined, 'info');
    },
    [showToast]
  );

  const publishTeacherResource = useCallback(
    async (params: {
      title: string;
      description: string;
      classNumber: number;
      boardId: string;
      subject: string;
      resourceType: 'guide' | 'worksheet' | 'formula_sheet' | 'revision_notes';
      content: string;
    }) => {
      if (!currentUser) throw new Error('Authentication required.');
      const res = await fetch('/api/teacher-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: currentUser.id,
          ...params
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish study material.');
      setTeacherResources((prev) => [data.resource, ...prev]);
      showToast('Study Resource Published', 'Available to students across the platform.');
    },
    [currentUser, showToast]
  );

  const reviewTeacherVerification = useCallback(
    async (
      teacherId: string,
      status: TeacherVerificationStatus,
      reviewNotes: string
    ) => {
      if (!currentUser) throw new Error('Admin authentication required.');
      const res = await fetch('/api/admin/teacher-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          teacherId,
          status,
          reviewNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification update failed.');
      setUsers((prev) => prev.map((u) => (u.id === teacherId ? data.teacher : u)));
      showToast(
        `Teacher Application ${status.toUpperCase()}`,
        `Updated verification status for ${data.teacher.displayName}.`
      );
    },
    [currentUser, showToast]
  );

  const setUserAccountStatus = useCallback(
    async (userId: string, status: 'active' | 'suspended') => {
      if (!currentUser) throw new Error('Admin authentication required.');
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser.id, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update account status.');
      setUsers((prev) => prev.map((u) => (u.id === userId ? data.user : u)));
      showToast(
        `User Account ${status === 'suspended' ? 'Suspended' : 'Activated'}`,
        `${data.user.displayName} is now ${status}.`,
        status === 'suspended' ? 'info' : 'success'
      );
    },
    [currentUser, showToast]
  );

  const moderateReport = useCallback(
    async (reportId: string, action: 'remove_content' | 'dismiss') => {
      if (!currentUser) throw new Error('Admin authentication required.');
      const res = await fetch(`/api/admin/reports/${reportId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser.id, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Moderation failed.');
      setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
      if (data.questions) setQuestions(data.questions);
      showToast(
        action === 'remove_content' ? 'Content Removed' : 'Report Dismissed',
        'Moderation log updated.'
      );
    },
    [currentUser, showToast]
  );

  const addOrUpdateCurriculum = useCallback(
    async (type: 'board' | 'subject', payload: Record<string, unknown>) => {
      if (!currentUser) throw new Error('Admin authentication required.');
      const res = await fetch('/api/admin/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser.id, type, payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update curriculum.');
      setBoards(data.boards);
      setCurriculum(data.curriculum);
      showToast('Curriculum Updated', 'Changes are now live across all student & teacher tools.');
    },
    [currentUser, showToast]
  );

  return (
    <EduSphereContext.Provider
      value={{
        isLoading,
        isDemoMode: !isSupabaseConfigured,
        isSupabaseConnected: isSupabaseConfigured,
        currentUser,
        users,
        boards,
        curriculum,
        quizzes,
        quizAttempts,
        savedNotes,
        questions,
        studyTasks,
        teacherResources,
        xpTransactions,
        liveRooms,
        reports,
        loginWithDemoAccount,
        loginWithEmail,
        registerAccount,
        logout,
        updateCurrentUserProfile,
        saveStudyNote,
        deleteStudyNote,
        createQuiz,
        submitQuizAttempt,
        createLiveRoom,
        joinLiveRoom,
        controlLiveRoom,
        submitLiveRoomAnswer,
        subscribeToRoomRealtime,
        postStudentQuestion,
        postTeacherAnswer,
        markAnswerHelpful,
        postPrivateFollowUp,
        reportContent,
        addStudyTask,
        toggleStudyTask,
        deleteStudyTask,
        publishTeacherResource,
        reviewTeacherVerification,
        setUserAccountStatus,
        moderateReport,
        addOrUpdateCurriculum,
        refreshPlatformState
      }}
    >
      {children}
    </EduSphereContext.Provider>
  );
};

export function useEduSphere(): EduSphereContextValue {
  const ctx = useContext(EduSphereContext);
  if (!ctx) throw new Error('useEduSphere must be used within an EduSphereProvider');
  return ctx;
}
