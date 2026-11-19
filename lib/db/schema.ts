import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// -------------------------------------------------------------
// 1. Users Table (Admin & Student)
// -------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // uuid
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "student"] }).notNull().default("student"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  studentId: text("student_id"), // e.g. "ANES-2026-001"
  phone: text("phone"),
  groupTag: text("group_tag").default("عام"), // e.g. "دفعة 2026 - تخدير سريري"
  createdAt: integer("created_at").notNull(), // timestamp ms
  updatedAt: integer("updated_at").notNull(),
});

// -------------------------------------------------------------
// 2. Sessions Table
// -------------------------------------------------------------
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at").notNull(), // timestamp ms
  createdAt: integer("created_at").notNull(),
});

// -------------------------------------------------------------
// 3. Exams Table
// -------------------------------------------------------------
export const exams = sqliteTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  totalQuestions: integer("total_questions").notNull().default(0),
  passPercentage: integer("pass_percentage").notNull().default(60), // e.g. 60%
  durationMinutes: integer("duration_minutes").notNull().default(30), // default duration
  shuffleQuestions: integer("shuffle_questions", { mode: "boolean" }).notNull().default(true),
  shuffleChoices: integer("shuffle_choices", { mode: "boolean" }).notNull().default(true),
  showResultsImmediately: integer("show_results_immediately", { mode: "boolean" }).notNull().default(true),
  allowReviewAnswers: integer("allow_review_answers", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by").references(() => users.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// -------------------------------------------------------------
// 4. Questions Table (MCQ)
// -------------------------------------------------------------
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  points: real("points").notNull().default(1),
  explanation: text("explanation").default(""), // Optional clinical/medical explanation
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

// -------------------------------------------------------------
// 5. Choices Table (4 choices per question)
// -------------------------------------------------------------
export const choices = sqliteTable("choices", {
  id: text("id").primaryKey(),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  choiceText: text("choice_text").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false), // Hidden from students
  orderIndex: integer("order_index").notNull().default(0),
});

// -------------------------------------------------------------
// 6. Exam Schedules Table (Group & Individual)
// -------------------------------------------------------------
export const examSchedules = sqliteTable("exam_schedules", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  scheduleType: text("schedule_type", { enum: ["group", "individual"] }).notNull().default("group"),
  title: text("title").notNull(), // e.g. "اختبار التخدير النصفي - المجموعة أ"
  targetGroup: text("target_group"), // e.g. "all" or specific group name
  targetUserId: text("target_user_id").references(() => users.id, { onDelete: "cascade" }), // For individual schedule
  startTime: integer("start_time").notNull(), // timestamp ms
  endTime: integer("end_time").notNull(), // timestamp ms
  durationMinutes: integer("duration_minutes").notNull(), // in minutes
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull(),
});

// -------------------------------------------------------------
// 7. Exam Assignments Table
// -------------------------------------------------------------
export const examAssignments = sqliteTable("exam_assignments", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  scheduleId: text("schedule_id").notNull().references(() => examSchedules.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedStartTime: integer("assigned_start_time").notNull(),
  assignedEndTime: integer("assigned_end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  status: text("status", { enum: ["assigned", "in_progress", "completed", "missed"] }).notNull().default("assigned"),
  createdAt: integer("created_at").notNull(),
});

// -------------------------------------------------------------
// 8. Exam Attempts Table
// -------------------------------------------------------------
export const examAttempts = sqliteTable("exam_attempts", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  scheduleId: text("schedule_id").references(() => examSchedules.id),
  assignmentId: text("assignment_id").references(() => examAssignments.id),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startTime: integer("start_time").notNull(), // server timestamp ms
  maxEndTime: integer("max_end_time").notNull(), // server calculated max end time ms
  submitTime: integer("submit_time"), // server timestamp ms when submitted
  status: text("status", { enum: ["in_progress", "submitted", "timed_out", "graded"] }).notNull().default("in_progress"),
  questionOrder: text("question_order").notNull(), // JSON string: string[] of question IDs
  choiceOrders: text("choice_orders").notNull(), // JSON string: Record<questionId, string[]> of choice IDs
  createdAt: integer("created_at").notNull(),
});

// -------------------------------------------------------------
// 9. Student Answers Table
// -------------------------------------------------------------
export const studentAnswers = sqliteTable("student_answers", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id").notNull().references(() => examAttempts.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedChoiceId: text("selected_choice_id").references(() => choices.id),
  isCorrect: integer("is_correct", { mode: "boolean" }), // calculated at grading
  pointsAwarded: real("points_awarded").default(0), // calculated at grading
  savedAt: integer("saved_at").notNull(),
});

// -------------------------------------------------------------
// 10. Results Table
// -------------------------------------------------------------
export const results = sqliteTable("results", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id").notNull().unique().references(() => examAttempts.id, { onDelete: "cascade" }),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalQuestions: integer("total_questions").notNull(),
  answeredQuestions: integer("answered_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalScore: real("total_score").notNull(),
  maxScore: real("max_score").notNull(),
  percentage: real("percentage").notNull(),
  isPassed: integer("is_passed", { mode: "boolean" }).notNull(),
  completedAt: integer("completed_at").notNull(),
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
