import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";

export async function GET() {
  try {
    const student = await requireStudent();
    const sqlite = getRawSqlite();

    const resultsList = (await sqlite
      .prepare(`
        SELECT 
          r.id, r.percentage, r.is_passed, r.completed_at, r.total_score, r.max_score,
          r.total_questions, r.answered_questions, r.correct_answers,
          e.id as exam_id, e.title as exam_title, e.pass_percentage, e.allow_review_answers,
          a.id as attempt_id, a.start_time, a.submit_time
        FROM results r
        JOIN exams e ON e.id = r.exam_id
        JOIN exam_attempts a ON a.id = r.attempt_id
        WHERE r.user_id = ?
        ORDER BY r.completed_at DESC
      `)
      .all(student.id))
      .map((r: any) => ({
        ...r,
        is_passed: Boolean(r.is_passed),
        allow_review_answers: Boolean(r.allow_review_answers),
        duration_seconds: r.submit_time && r.start_time ? Math.round((r.submit_time - r.start_time) / 1000) : null,
      }));

    return NextResponse.json({ success: true, results: resultsList });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل استرجاع النتائج" }, { status: 500 });
  }
}
