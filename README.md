# EduSphere AI — AI-Powered School Learning & Teacher Community Platform

**EduSphere AI** is a full-stack educational platform built for school students in **Classes 1–12** across **CBSE, SEBA / Assam State Board, ICSE, and IB/IGCSE** curricula. It combines a LinkedIn-style **Social Learning & Teacher Community Feed**, an interactive **AI Learning Tutor**, **Structured AI Study Notes**, a **Practice & Live Multiplayer Quiz Arena**, **Performance Analytics**, a **Personalized Study Planner**, and **Gamified XP & Leaderboards** with strict **Educator Credential Verification**.

---

## Key Highlights & Features

### 1. LinkedIn-Style Social Learning Community Feed (Default Home Screen)
- **Desktop 3-Column Layout**:
  - **Left Column**: Pinned compact User Profile Summary Card (Avatar, Display Name, Class/Board or Teacher Verification Status, XP Level & progress bar) + full workspace navigation.
  - **Center Column**: Prominent **"Create Post"** composer with quick-select Subject, Class (1–12), and Board tags, followed by a filterable feed of student questions and educator tips.
  - **Right Column**: Contextual widgets for **AI Learning Tutor Quick-Launch**, **Live Quiz Rooms Available**, and **Top Verified Teachers**.
- **Role-Based Feed Interactions**:
  - **Students** post syllabus questions, filter by subject/status, upvote helpful teacher explanations, share posts, and open permission-controlled private follow-up threads.
  - **Verified Teachers** share formula sheets and exam tips from the top composer and click **"Reply & Solve"** on any student question to publish highlighted, verified step-by-step solutions inline.

### 2. AI-Assisted Learning Suite (Replaceable `AIProvider` Architecture)
- **AI Learning Tutor (`/student/ai-tutor`)**: Delivers class-adapted, 5-part structured explanations:
  1. Simple Explanation
  2. Step-by-Step Breakdown
  3. Worked Example
  4. Important Board Exam Points
  5. Follow-Up Practice Question
- **AI Study Notes Generator (`/student/ai-notes`)**: Generates comprehensive chapter notes, board exam revision sheets, or quick flash summaries. Students can save notes (+15 XP), reopen saved notes, copy to clipboard, or delete notes.
- **Clean Provider Abstraction**: Implemented via `src/services/ai/AIProvider.ts` and `src/services/ai/MockAIProvider.ts` so a production LLM provider (such as `GeminiAIProvider`) can be swapped in without UI changes.

### 3. Practice Quiz Generator & Real-Time Live Quiz Arena
- **Practice Quizzes (`/student/quiz-arena`)**: Configure Class, Board, Subject, Topic, Difficulty (`easy`, `medium`, `hard`), and Question Count. Includes a timed quiz runner, server-authoritative scoring, step-by-step explanations, and 1-click weak-subtopic scheduling into the Study Planner.
- **Live Quiz Arena (`/student/live-quiz/:roomCode`, `/teacher/host-quiz`)**:
  - Create or join multiplayer rooms using 6-character codes (e.g., `ED1042`).
  - Real-time synchronization via WebSockets (`/ws`) and **Supabase Realtime** channels.
  - Host controls (`Start`, `Next Question`, `Finish`, `Cancel`), per-question countdown timer, duplicate/late answer rejection, and live leaderboard updates.

### 4. Educator Verification & Governance
- **Teacher Onboarding & Verification (`/teacher/verification`)**: Teachers submit academic qualifications and upload qualification certificates. Newly registered teachers start with `pending` status and are restricted from publishing official answers or hosting official competitions until approved by an administrator.
- **Permission-Controlled Private Follow-Ups**: Public questions support a private educational follow-up thread accessible strictly to the asking student, the participating verified teacher, and platform moderators.
- **Administrator Console (`/admin/*`)**:
  - Platform telemetry (Students, Teachers, Pending Verifications, Approved Teachers, Questions, Reports, Active Rooms).
  - Teacher Verification queue (`Approve`, `Reject`, `Request Resubmission` with admin attribution).
  - User Management (`Active` / `Suspended` account status controls).
  - Content Moderation (`Remove Content` / `Dismiss Report`).
  - Dynamic Multi-Board Curriculum Management (Boards, Classes 1–12, Subjects, Chapters).

### 5. Gamification, Analytics & Study Planner
- **XP & Levels (`/student/leaderboard`)**: Non-duplicate XP ledger awarding points for practice quizzes, study tasks, saved notes, and live arena participation.
- **Performance Analytics (`/student/performance`)**: Recharts visualizations for Quiz Score Progression and Subject-Wise Accuracy, plus explainable weak-topic detection.
- **Study Planner (`/student/study-planner`)**: Daily and weekly task checklist with automatic revision recommendations based on missed quiz subtopics.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4 (Light & Dark Mode with `@custom-variant dark`), React Router v7, Recharts, Lucide React
- **Backend Runtime**: Node.js + Express (`server.ts`) + WebSocket Server (`ws`) for authoritative quiz scoring, role enforcement, and real-time room state
- **Database, Auth, Storage & Realtime**: Supabase (`@supabase/supabase-js`) with full PostgreSQL schema and Row Level Security (RLS) policies in `supabase/migrations/001_edusphere_schema.sql`

---

## Project Structure

```text
├── server.ts                                      # Express + Vite + WebSocket full-stack server
├── supabase/
│   └── migrations/
│       └── 001_edusphere_schema.sql               # PostgreSQL tables, constraints & RLS policies
├── src/
│   ├── App.tsx                                    # Role-protected application router
│   ├── index.css                                  # Tailwind v4 + Dark Mode + Typography setup
│   ├── app/
│   │   └── layouts/
│   │       └── RoleLayouts.tsx                    # 3-Column LinkedIn-style sidebar, top bar & mobile nav
│   ├── constants/
│   │   └── curriculum.ts                          # Multi-board (CBSE, SEBA, ICSE, IB) & XP rules
│   ├── contexts/
│   │   ├── EduSphereContext.tsx                   # Unified state, API, WebSocket & Supabase integration
│   │   ├── ThemeContext.tsx                       # Light / Dark theme persistence
│   │   └── ToastContext.tsx                       # Accessible toast notifications
│   ├── features/
│   │   ├── administration/AdminPages.tsx          # Admin dashboard, verification, users, moderation, curriculum
│   │   ├── ai-notes/AINotesPage.tsx               # Structured AI Study Notes generator & library
│   │   ├── ai-tutor/AITutorPage.tsx               # Interactive 5-part AI Learning Tutor
│   │   ├── analytics/StudentAnalyticsAndPlannerPages.tsx # Recharts analytics, Study Planner, Leaderboard, Profile
│   │   ├── authentication/AuthPages.tsx           # Login, Demo Switcher & Student/Teacher Registration
│   │   ├── dashboard/StudentDashboard.tsx         # Academic overview & telemetry
│   │   ├── live-quiz/LiveQuizRoomPage.tsx         # Real-time multiplayer Live Quiz Arena
│   │   ├── public/
│   │   │   ├── LandingPage.tsx                    # Public product landing page
│   │   │   └── AboutPage.tsx                      # Interactive curriculum explorer
│   │   ├── quizzes/QuizArenaPage.tsx              # AI Quiz generator, timed quiz runner & results review
│   │   ├── teacher-community/
│   │   │   ├── SocialLearningFeedPage.tsx         # LinkedIn-style 3-column Community Feed (Default Home)
│   │   │   └── CommunityPages.tsx                 # Question directory, detail thread & private follow-ups
│   │   └── teacher-verification/TeacherPages.tsx  # Teacher overview, verification, custom quiz & resources
│   ├── services/
│   │   ├── supabase.ts                            # Official Supabase client initialization
│   │   └── ai/
│   │       ├── AIProvider.ts                      # Replaceable AIProvider interface
│   │       └── MockAIProvider.ts                  # Curriculum-aware MockAIProvider implementation
│   └── types/
│       └── edusphere.ts                           # Strict TypeScript domain models
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```env
# Supabase Configuration (Frontend / Public)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key

# Application Mode & AI Provider
# When VITE_SUPABASE_URL is omitted, the platform runs in clearly labelled Demo Mode
# backed by the Express + WebSocket server.
VITE_DEMO_MODE=true
VITE_AI_PROVIDER=mock

# Server-Side Secrets (Never exposed to browser)
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Database Setup (Supabase PostgreSQL)

1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Copy and execute the full contents of `supabase/migrations/001_edusphere_schema.sql`.
   - This creates all identity, curriculum, community, learning, gamification, and live quiz tables along with **Row Level Security (RLS)** policies (`get_user_role`, `is_verified_teacher`, participant-restricted private follow-ups, and self-owned student records).
4. Create a private storage bucket named `teacher-certificates` in **Supabase Storage** for educator qualification documents.
5. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.

---

## Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the full-stack development server (Port 3000)**:
   ```bash
   npm run dev
   ```

3. **Type-check and build for production**:
   ```bash
   npm run lint
   npm run build
   ```

4. **Start the production server**:
   ```bash
   npm start
   ```

---

## Preconfigured Demo Accounts

When exploring in Demo Mode (or via the quick-switch controls on `/login` and the left sidebar), the following accounts are preconfigured:

| Role | Name | Email | Highlights |
| :--- | :--- | :--- | :--- |
| **Student Demo** | Aarav Sharma | `aarav.student@edusphere.demo` | Class 10 · CBSE · 640 XP (Level 3) · Saved Notes & Quiz History |
| **Verified Teacher Demo** | Dr. Meera Krishnan | `meera.teacher@edusphere.demo` | `approved` status · Can Reply & Solve in Feed, Create & Host Live Quizzes |
| **Pending Teacher Demo** | Prof. Bhaskar Jyoti Kalita | `bhaskar.teacher@edusphere.demo` | `pending` status · Demonstrates unverified educator safeguards |
| **Admin Demo** | Vikramaditya Sen | `admin@edusphere.demo` | Full access to Teacher Verification, Moderation, Users & Curriculum |
