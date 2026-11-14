-- =============================================================================
-- EduSphere AI — Complete Supabase PostgreSQL Schema & RLS Policies
-- Supports Classes 1–12 across CBSE, SEBA / Assam State Board, ICSE & custom boards
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Curriculum & Identity Tables
-- -----------------------------------------------------------------------------

create table if not exists public.boards (
  id text primary key,
  name text not null unique,
  full_name text not null,
  region text not null default 'India',
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id integer primary key check (id between 1 and 12),
  class_number integer not null unique check (class_number between 1 and 12),
  stage text not null
);

create table if not exists public.subjects (
  id text primary key,
  board_id text not null references public.boards(id) on delete cascade,
  class_id integer not null references public.classes(id) on delete cascade,
  name text not null,
  chapters jsonb not null default '[]'::jsonb,
  unique (board_id, class_id, name)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  role text not null check (role in ('student', 'teacher', 'admin')) default 'student',
  status text not null check (status in ('active', 'suspended')) default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  class_id integer not null references public.classes(id) default 10,
  board_id text not null references public.boards(id) default 'CBSE',
  subjects text[] not null default array['Mathematics', 'Science', 'English'],
  learning_goal text default 'Board Exam Preparation'
);

create table if not exists public.teacher_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  qualifications text not null,
  institution text not null default '',
  experience_years integer not null default 1,
  subjects text[] not null default array['Mathematics'],
  verification_status text not null check (verification_status in ('pending', 'approved', 'rejected', 'resubmit_requested')) default 'pending',
  reviewed_by uuid references public.profiles(id),
  review_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_documents (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(user_id) on delete cascade,
  storage_path text not null,
  document_type text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Teacher Community (Questions, Answers, Private Follow-ups, Reports)
-- -----------------------------------------------------------------------------

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  student_name text not null,
  title text not null,
  description text not null,
  class_id integer not null references public.classes(id),
  board_id text not null references public.boards(id),
  subject_id text not null,
  status text not null check (status in ('open', 'answered', 'closed', 'reported')) default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  teacher_name text not null,
  teacher_qualification text not null default 'Verified Educator',
  content text not null,
  resource_url text,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text not null,
  sender_role text not null check (sender_role in ('student', 'teacher', 'admin')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reporter_name text not null,
  target_type text not null check (target_type in ('question', 'answer')),
  target_id uuid not null,
  target_excerpt text not null,
  reason text not null,
  status text not null check (status in ('pending', 'resolved', 'dismissed')) default 'pending',
  moderated_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. Learning, Notes, Quizzes, Study Planner & Teacher Resources
-- -----------------------------------------------------------------------------

create table if not exists public.generated_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  class_id integer not null,
  board_id text not null,
  subject_id text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_quizzes (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  creator_role text not null default 'student',
  title text not null,
  class_id integer not null,
  board_id text not null,
  subject_id text not null,
  topic text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  duration_seconds integer not null default 300,
  questions jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.generated_quizzes(id) on delete cascade,
  quiz_title text not null,
  subject_id text not null,
  topic text not null,
  score integer not null,
  total_questions integer not null,
  percentage integer not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subject_id text not null,
  topic text not null,
  due_date date not null,
  completed boolean not null default false,
  is_recommended boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_resources (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  teacher_name text not null,
  title text not null,
  description text not null,
  class_id integer not null,
  board_id text not null,
  subject_id text not null,
  resource_type text not null check (resource_type in ('guide', 'worksheet', 'formula_sheet', 'revision_notes')),
  content text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. Gamification (XP & Badges)
-- -----------------------------------------------------------------------------

create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('practice_quiz', 'study_task', 'live_quiz_participation', 'live_quiz_correct', 'ask_question', 'study_notes')),
  reference_id text not null,
  points integer not null check (points > 0),
  created_at timestamptz not null default now(),
  unique (user_id, activity_type, reference_id)
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null,
  badge_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- -----------------------------------------------------------------------------
-- 5. Live Quiz Arena (Multiplayer Rooms)
-- -----------------------------------------------------------------------------

create table if not exists public.quiz_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  room_name text not null,
  host_id uuid not null references public.profiles(id) on delete cascade,
  host_name text not null,
  host_role text not null,
  quiz_id uuid not null references public.generated_quizzes(id) on delete cascade,
  status text not null check (status in ('waiting', 'active', 'finished', 'cancelled')) default 'waiting',
  current_question_index integer not null default 0,
  question_duration_seconds integer not null default 30,
  created_at timestamptz not null default now()
);

create table if not exists public.room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.quiz_rooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  score integer not null default 0,
  correct_count integer not null default 0,
  joined_at timestamptz not null default now(),
  unique (room_id, student_id)
);

create table if not exists public.live_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.quiz_rooms(id) on delete cascade,
  participant_id uuid not null references public.room_participants(id) on delete cascade,
  question_index integer not null,
  selected_answer integer not null,
  is_correct boolean not null default false,
  points_awarded integer not null default 0,
  submitted_at timestamptz not null default now(),
  unique (room_id, participant_id, question_index)
);

-- -----------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.teacher_documents enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.followups enable row level security;
alter table public.content_reports enable row level security;
alter table public.generated_notes enable row level security;
alter table public.generated_quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.study_tasks enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.quiz_rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.live_answers enable row level security;

-- Helper function to check user role safely
create or replace function public.get_user_role(uid uuid)
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = uid;
$$;

-- Helper function to check teacher verification status
create or replace function public.is_verified_teacher(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.teacher_profiles
    where user_id = uid and verification_status = 'approved'
  );
$$;

-- Profiles: Anyone authenticated can read basic profiles; users can only update display_name (never role)
create policy "Profiles readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own display_name without changing role"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Student profiles: students read/write own; admins read all
create policy "Student profiles self or admin access"
  on public.student_profiles for all
  to authenticated
  using (auth.uid() = user_id or public.get_user_role(auth.uid()) = 'admin')
  with check (auth.uid() = user_id or public.get_user_role(auth.uid()) = 'admin');

-- Teacher profiles: readable by all authenticated; teachers insert/update own; only admins change verification_status
create policy "Teacher profiles readable by authenticated"
  on public.teacher_profiles for select
  to authenticated
  using (true);

create policy "Admins can update teacher verification status"
  on public.teacher_profiles for update
  to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');

-- Teacher documents: strictly restricted to owning teacher and admins
create policy "Teacher documents restricted to owner and admin"
  on public.teacher_documents for select
  to authenticated
  using (auth.uid() = teacher_id or public.get_user_role(auth.uid()) = 'admin');

create policy "Teachers can upload own verification documents"
  on public.teacher_documents for insert
  to authenticated
  with check (auth.uid() = teacher_id);

-- Questions & Answers
create policy "Public questions readable by all authenticated"
  on public.questions for select
  to authenticated
  using (status != 'reported' or student_id = auth.uid() or public.get_user_role(auth.uid()) = 'admin');

create policy "Students can create own questions"
  on public.questions for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Only verified teachers can publish official answers"
  on public.answers for insert
  to authenticated
  with check (auth.uid() = teacher_id and public.is_verified_teacher(auth.uid()));

create policy "Answers readable by all authenticated"
  on public.answers for select
  to authenticated
  using (true);

-- Followups: strictly restricted to question student, participating teacher, and admins
create policy "Private followups restricted to participants and admins"
  on public.followups for select
  to authenticated
  using (
    auth.uid() = student_id
    or auth.uid() = teacher_id
    or public.get_user_role(auth.uid()) = 'admin'
  );

create policy "Participants can post followups"
  on public.followups for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and (auth.uid() = student_id or (auth.uid() = teacher_id and public.is_verified_teacher(auth.uid())))
  );

-- Student private learning records
create policy "Students manage own notes"
  on public.generated_notes for all
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "Students manage own quiz attempts"
  on public.quiz_attempts for all
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "Students manage own study tasks"
  on public.study_tasks for all
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);
