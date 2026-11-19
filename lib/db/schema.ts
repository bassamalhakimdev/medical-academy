import { pgTable, text, integer, doublePrecision } from "drizzle-orm/pg-core";

// -------------------------------------------------------------
// 1. Users Table (Admin & Student)
// -------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "student"] }).notNull().default("student"),
  isActive: integer("is_active").notNull().default(1),
  studentId: text("student_id"), // e.g. "ANES-2026-001"
  phone: text("phone"),
  groupTag: text("group_tag").default("عام"), // e.g. "دفعة 2026 - تخدير سريري"
  createdAt: doublePrecision("created_at").notNull(),
  updatedAt: doublePrecision("updated_at").notNull(),
});

// -------------------------------------------------------------
// 2. Sessions Table
// -------------------------------------------------------------
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: doublePrecision("expires_at").notNull(),
  createdAt: doublePrecision("created_at").notNull(),
});

// -------------------------------------------------------------
// 3. Exams Table
// -------------------------------------------------------------
export const exams = pgTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  totalQuestions: integer("total_questions").notNull().default(0),
  passPercentage: integer("pass_percentage").notNull().default(60),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  shuffleQuestions: integer("shuffle_questions").notNull().default(1),
  shuffleChoices: integer("shuffle_choices").notNull().default(1),
  showResultsImmediately: integer("show_results_immediately").notNull().default(1),
  allowReviewAnswers: integer("allow_review_answers").notNull().default(1),
  createdBy: text("created_by").references(() => users.id),
  createdAt: doublePrecision("created_at").notNull(),
  updatedAt: doublePrecision("updated_at").notNull(),
});

// -------------------------------------------------------------
// 4. Questions Table (MCQ)
// -------------------------------------------------------------
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  points: doublePrecision("points").notNull().default(1),
  explanation: text("explanation").default(""),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: doublePrecision("created_at").notNull(),
});

// -------------------------------------------------------------
// 5. Choices Table (4 choices per question)
// -------------------------------------------------------------
export const choices = pgTable("choices", {
  id: text("id").primaryKey(),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  choiceText: text("choice_text").notNull(),
  isCorrect: integer("is_correct").notNull().default(0),
  orderIndex: integer("order_index").notNull().default(0),
});

// -------------------------------------------------------------
// 6. Exam Schedules Table (Group & Individual)
// -------------------------------------------------------------
export const examSchedules = pgTable("exam_schedules", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  scheduleType: text("schedule_type", { enum: ["group", "individual"] }).notNull().default("group"),
  title: text("title").notNull(),
  targetGroup: text("target_group"),
  targetUserId: text("target_user_id").references(() => users.id, { onDelete: "cascade" }),
  startTime: doublePrecision("start_time").notNull(),
  endTime: doublePrecision("end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: doublePrecision("created_at").notNull(),
});

// -------------------------------------------------------------
// 7. Exam Assignments Table
// -------------------------------------------------------------
export const examAssignments = pgTable("exam_assignments", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  scheduleId: text("schedule_id").notNull().references(() => examSchedules.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedStartTime: doublePrecision("assigned_start_time").notNull(),
  assignedEndTime: doublePrecision("assigned_end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  status: text("status", { enum: ["assigned", "in_progress", "completed", "missed"] }).notNull().default("assigned"),
  createdAt: doublePrecision("created_at").notNull(),
});

// -------------------------------------------------------------
// 8. Exam Attempts Table
// -------------------------------------------------------------
export const examAttempts = pgTable("exam_attempts", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  scheduleId: text("schedule_id").references(() => examSchedules.id),
  assignmentId: text("assignment_id").references(() => examAssignments.id),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startTime: doublePrecision("start_time").notNull(),
  maxEndTime: doublePrecision("max_end_time").notNull(),
  submitTime: doublePrecision("submit_time"),
  status: text("status", { enum: ["in_progress", "submitted", "timed_out", "graded"] }).notNull().default("in_progress"),
  questionOrder: text("question_order").notNull(),
  choiceOrders: text("choice_orders").notNull(),
  createdAt: doublePrecision("created_at").notNull(),
});

// -------------------------------------------------------------
// 9. Student Answers Table
// -------------------------------------------------------------
export const studentAnswers = pgTable("student_answers", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id").notNull().references(() => examAttempts.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedChoiceId: text("selected_choice_id").references(() => choices.id),
  isCorrect: integer("is_correct"),
  pointsAwarded: doublePrecision("points_awarded").default(0),
  savedAt: doublePrecision("saved_at").notNull(),
});

// -------------------------------------------------------------
// 10. Results Table
// -------------------------------------------------------------
export const results = pgTable("results", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id").notNull().unique().references(() => examAttempts.id, { onDelete: "cascade" }),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalQuestions: integer("total_questions").notNull(),
  answeredQuestions: integer("answered_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalScore: doublePrecision("total_score").notNull(),
  maxScore: doublePrecision("max_score").notNull(),
  percentage: doublePrecision("percentage").notNull(),
  isPassed: integer("is_passed").notNull(),
  completedAt: doublePrecision("completed_at").notNull(),
  feedback: text("feedback").default(""),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Choice = typeof choices.$inferSelect;
export type NewChoice = typeof choices.$inferInsert;

export type ExamSchedule = typeof examSchedules.$inferSelect;
export type NewExamSchedule = typeof examSchedules.$inferInsert;

export type ExamAssignment = typeof examAssignments.$inferSelect;
export type NewExamAssignment = typeof examAssignments.$inferInsert;

export type ExamAttempt = typeof examAttempts.$inferSelect;
export type NewExamAttempt = typeof examAttempts.$inferInsert;

export type StudentAnswer = typeof studentAnswers.$inferSelect;
export type NewStudentAnswer = typeof studentAnswers.$inferInsert;

export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
