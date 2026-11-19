import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const examId = url.searchParams.get("examId") || "";
    const status = url.searchParams.get("status") || ""; // 'passed', 'failed'

    const sqlite = getRawSqlite();

    let query = `
      SELECT 
        r.id, r.percentage, r.is_passed, r.completed_at, r.total_score, r.max_score,
        r.total_questions, r.answered_questions, r.correct_answers,
        u.id as user_id, u.name as student_name, u.email as student_email, u.student_id, u.group_tag,
        e.id as exam_id, e.title as exam_title, e.pass_percentage,
        a.id as attempt_id, a.start_time, a.submit_time
      FROM results r
      JOIN users u ON u.id = r.user_id
      JOIN exams e ON e.id = r.exam_id
      JOIN exam_attempts a ON a.id = r.attempt_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search.trim()) {
      query += ` AND (u.name LIKE ? OR u.student_id LIKE ? OR e.title LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (examId.trim()) {
      query += ` AND e.id = ?`;
      params.push(examId.trim());
    }

    if (status === "passed") {
      query += ` AND r.is_passed = 1`;
    } else if (status === "failed") {
      query += ` AND r.is_passed = 0`;
    }

    query += ` ORDER BY r.completed_at DESC`;

    const resultsList = (await sqlite.prepare(query).all(...params)).map((r: any) => ({
      ...r,
      is_passed: Boolean(r.is_passed),
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
