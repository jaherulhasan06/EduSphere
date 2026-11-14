import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { EduSphereProvider } from './contexts/EduSphereContext';
import { RoleWorkspaceLayout } from './app/layouts/RoleLayouts';
import { LandingPage } from './features/public/LandingPage';
import { AboutPage } from './features/public/AboutPage';
import { LoginPage, RegisterPage } from './features/authentication/AuthPages';
import { StudentDashboard } from './features/dashboard/StudentDashboard';
import { AITutorPage } from './features/ai-tutor/AITutorPage';
import { AINotesPage } from './features/ai-notes/AINotesPage';
import { QuizArenaPage } from './features/quizzes/QuizArenaPage';
import { LiveQuizRoomPage } from './features/live-quiz/LiveQuizRoomPage';
import {
  AskTeacherListPage,
  QuestionDetailPage
} from './features/teacher-community/CommunityPages';
import { SocialLearningFeedPage } from './features/teacher-community/SocialLearningFeedPage';
import {
  LeaderboardPage,
  ProfilePage,
  StudentPerformancePage,
  StudyPlannerPage
} from './features/analytics/StudentAnalyticsAndPlannerPages';
import {
  TeacherContributionsPage,
  TeacherCreateQuizPage,
  TeacherDashboardPage,
  TeacherHostQuizPage,
  TeacherResourcesPage,
  TeacherVerificationPage
} from './features/teacher-verification/TeacherPages';
import {
  AdminCurriculumPage,
  AdminDashboardPage,
  AdminModerationPage,
  AdminQuizzesPage,
  AdminSettingsPage,
  AdminTeacherVerificationPage,
  AdminUsersPage
} from './features/administration/AdminPages';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <EduSphereProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Student Protected Workspace Routes — Default Home is LinkedIn-style Social Learning Feed */}
              <Route
                path="/student"
                element={<RoleWorkspaceLayout allowedRole="student" />}
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SocialLearningFeedPage />} />
                <Route path="ask-teacher" element={<SocialLearningFeedPage />} />
                <Route path="overview" element={<StudentDashboard />} />
                <Route path="ai-tutor" element={<AITutorPage />} />
                <Route path="ai-notes" element={<AINotesPage />} />
                <Route path="quiz-arena" element={<QuizArenaPage />} />
                <Route path="live-quiz/:roomCode" element={<LiveQuizRoomPage />} />
                <Route path="questions/:questionId" element={<QuestionDetailPage />} />
                <Route path="performance" element={<StudentPerformancePage />} />
                <Route path="study-planner" element={<StudyPlannerPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Teacher Protected Workspace Routes — Default Home is LinkedIn-style Social Learning Feed */}
              <Route
                path="/teacher"
                element={<RoleWorkspaceLayout allowedRole="teacher" />}
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SocialLearningFeedPage />} />
                <Route path="overview" element={<TeacherDashboardPage />} />
                <Route path="verification" element={<TeacherVerificationPage />} />
                <Route path="questions" element={<AskTeacherListPage />} />
                <Route path="questions/:questionId" element={<QuestionDetailPage />} />
                <Route path="create-quiz" element={<TeacherCreateQuizPage />} />
                <Route path="host-quiz" element={<TeacherHostQuizPage />} />
                <Route path="resources" element={<TeacherResourcesPage />} />
                <Route path="contributions" element={<TeacherContributionsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Administrator Protected Workspace Routes */}
              <Route
                path="/admin"
                element={<RoleWorkspaceLayout allowedRole="admin" />}
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route
                  path="teacher-verification"
                  element={<AdminTeacherVerificationPage />}
                />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="moderation" element={<AdminModerationPage />} />
                <Route path="curriculum" element={<AdminCurriculumPage />} />
                <Route path="quizzes" element={<AdminQuizzesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </EduSphereProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
