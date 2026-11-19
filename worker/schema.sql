-- ============================================================
-- Medical Academy Platform - Cloudflare D1 SQLite Schema
-- Specialized in Anesthesiology Medical Education & Exams
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  is_active INTEGER NOT NULL DEFAULT 1,
  student_id TEXT,
  phone TEXT,
  group_tag TEXT DEFAULT 'عام',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  total_questions INTEGER NOT NULL DEFAULT 0,
  pass_percentage INTEGER NOT NULL DEFAULT 60,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  shuffle_questions INTEGER NOT NULL DEFAULT 1,
  shuffle_choices INTEGER NOT NULL DEFAULT 1,
  show_results_immediately INTEGER NOT NULL DEFAULT 1,
  allow_review_answers INTEGER NOT NULL DEFAULT 1,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  points REAL NOT NULL DEFAULT 1,
  explanation TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS choices (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exam_schedules (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL DEFAULT 'group',
  title TEXT NOT NULL,
  target_group TEXT,
  target_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_assignments (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  schedule_id TEXT NOT NULL REFERENCES exam_schedules(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_start_time INTEGER NOT NULL,
  assigned_end_time INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  schedule_id TEXT REFERENCES exam_schedules(id),
  assignment_id TEXT REFERENCES exam_assignments(id),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time INTEGER NOT NULL,
  max_end_time INTEGER NOT NULL,
  submit_time INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress',
  question_order TEXT NOT NULL,
  choice_orders TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS student_answers (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_choice_id TEXT REFERENCES choices(id),
  is_correct INTEGER,
  points_awarded REAL DEFAULT 0,
  saved_at INTEGER NOT NULL,
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL UNIQUE REFERENCES exam_attempts(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL,
  answered_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_score REAL NOT NULL,
  max_score REAL NOT NULL,
  percentage REAL NOT NULL,
  is_passed INTEGER NOT NULL,
  completed_at INTEGER NOT NULL,
  feedback TEXT DEFAULT ''
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_choices_question ON choices(question_id);
CREATE INDEX IF NOT EXISTS idx_schedules_exam ON exam_schedules(exam_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON exam_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_exam ON exam_attempts(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt ON student_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON results(user_id);
