import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: resultId } = await params;
    const sqlite = getRawSqlite();

    const result = (await sqlite
      .prepare(`
        SELECT 
          r.id, r.percentage, r.is_passed, r.completed_at, r.total_score, r.max_score,
          r.total_questions, r.answered_questions, r.correct_answers, r.feedback,
          u.id as user_id, u.name as student_name, u.email as student_email, u.student_id, u.group_tag,
          e.id as exam_id, e.title as exam_title, e.pass_percentage,
          a.id as attempt_id, a.start_time, a.submit_time
        FROM results r
        JOIN users u ON u.id = r.user_id
        JOIN exams e ON e.id = r.exam_id
        JOIN exam_attempts a ON a.id = r.attempt_id
        WHERE r.id = ?
      `)
      .get(resultId)) as any;

    if (!result) {
      return NextResponse.json({ error: "النتيجة غير موجودة" }, { status: 404 });
    }

    // Get questions with student answers and choices
    const questionsRows = (await sqlite
      .prepare(`
        SELECT 
          q.id, q.question_text, q.points, q.explanation, q.order_index,
          sa.selected_choice_id, sa.is_correct as student_is_correct, sa.points_awarded
        FROM questions q
        LEFT JOIN student_answers sa ON sa.question_id = q.id AND sa.attempt_id = ?
        WHERE q.exam_id = ?
        ORDER BY q.order_index ASC
      `)
      .all(result.attempt_id, result.exam_id)) as any[];

    const questionIds = questionsRows.map((q) => q.id);
    let allChoices: any[] = [];
    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => "?").join(",");
      allChoices = (await sqlite
        .prepare(`
          SELECT id, question_id, choice_text, is_correct, order_index
          FROM choices
          WHERE question_id IN (${placeholders})
          ORDER BY order_index ASC
        `)
        .all(...questionIds)) as any[];
    }

    const questionsDetails = questionsRows.map((q) => ({
      ...q,
      student_is_correct: q.student_is_correct !== null ? Boolean(q.student_is_correct) : null,
      choices: allChoices
        .filter((c) => c.question_id === q.id)
        .map((c) => ({
          ...c,
          is_correct: Boolean(c.is_correct),
        })),
    }));

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        is_passed: Boolean(result.is_passed),
        duration_seconds: result.submit_time && result.start_time ? Math.round((result.submit_time - result.start_time) / 1000) : null,
        questions: questionsDetails,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل استرجاع تفاصيل النتيجة" }, { status: 500 });
  }
}
