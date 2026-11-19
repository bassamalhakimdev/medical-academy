import { NextResponse } from "next/server";
import { requireAdmin, generateId } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const createExamSchema = z.object({
  title: z.string().min(3, "عنوان الاختبار يجب أن لا يقل عن 3 أحرف"),
  description: z.string().optional().default(""),
  durationMinutes: z.number().int().min(1, "مدة الاختبار يجب أن تكون دقيقة واحدة على الأقل"),
  passPercentage: z.number().int().min(1).max(100, "نسبة النجاح يجب أن تكون بين 1 و 100"),
  shuffleQuestions: z.boolean().default(true),
  shuffleChoices: z.boolean().default(true),
  showResultsImmediately: z.boolean().default(true),
  allowReviewAnswers: z.boolean().default(true),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export async function GET() {
  try {
    await requireAdmin();
    const sqlite = getRawSqlite();

    const examsList = (await sqlite
      .prepare(`
        SELECT 
          e.id, e.title, e.description, e.status, e.duration_minutes, e.pass_percentage,
          e.shuffle_questions, e.shuffle_choices, e.show_results_immediately, e.allow_review_answers,
          e.created_at, e.updated_at,
          COUNT(DISTINCT q.id) as question_count,
          COUNT(DISTINCT a.id) as attempts_count,
          COUNT(DISTINCT s.id) as schedules_count
        FROM exams e
        LEFT JOIN questions q ON q.exam_id = e.id
        LEFT JOIN exam_attempts a ON a.exam_id = e.id AND a.status IN ('submitted', 'graded')
        LEFT JOIN exam_schedules s ON s.exam_id = e.id
        GROUP BY e.id
        ORDER BY e.created_at DESC
      `)
      .all())
      .map((ex: any) => ({
        ...ex,
        shuffle_questions: Boolean(ex.shuffle_questions),
        shuffle_choices: Boolean(ex.shuffle_choices),
        show_results_immediately: Boolean(ex.show_results_immediately),
        allow_review_answers: Boolean(ex.allow_review_answers),
      }));

    return NextResponse.json({ success: true, exams: examsList });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل استرجاع الاختبارات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const result = createExamSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const data = result.data;
    const examId = generateId();
    const now = Date.now();
    const sqlite = getRawSqlite();

    await sqlite
      .prepare(`
        INSERT INTO exams (
          id, title, description, status, total_questions, pass_percentage, duration_minutes,
          shuffle_questions, shuffle_choices, show_results_immediately, allow_review_answers,
          created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        examId,
        data.title.trim(),
        data.description?.trim() || "",
        data.status,
        data.passPercentage,
        data.durationMinutes,
        data.shuffleQuestions ? 1 : 0,
        data.shuffleChoices ? 1 : 0,
        data.showResultsImmediately ? 1 : 0,
        data.allowReviewAnswers ? 1 : 0,
        admin.id,
        now,
        now
      );

    return NextResponse.json({
      success: true,
      examId,
      message: "تم إنشاء الاختبار بنجاح",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل إنشاء الاختبار" }, { status: 500 });
  }
}
