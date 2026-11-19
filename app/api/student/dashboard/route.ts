import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";

export async function GET() {
  try {
    const student = await requireStudent();
    const sqlite = getRawSqlite();
    const now = Date.now();

    // 1. Get all assignments for this student
    const assignments = sqlite
      .prepare(`
        SELECT 
          a.id as assignment_id, a.status as assignment_status,
          a.assigned_start_time, a.assigned_end_time, a.duration_minutes,
          e.id as exam_id, e.title as exam_title, e.description as exam_description,
          e.total_questions, e.pass_percentage,
          s.id as schedule_id, s.title as schedule_title, s.schedule_type,
          att.id as attempt_id, att.status as attempt_status, att.start_time as attempt_start_time,
          att.max_end_time as attempt_max_end_time,
          r.id as result_id, r.percentage, r.is_passed, r.total_score, r.max_score
        FROM exam_assignments a
        JOIN exams e ON e.id = a.exam_id
        JOIN exam_schedules s ON s.id = a.schedule_id
        LEFT JOIN exam_attempts att ON att.assignment_id = a.id
        LEFT JOIN results r ON r.attempt_id = att.id
        WHERE a.user_id = ? AND e.status = 'published' AND s.is_active = 1
        ORDER BY a.assigned_start_time ASC
      `)
      .all(student.id) as any[];

    const available: any[] = [];
    const upcoming: any[] = [];
    const completed: any[] = [];

    for (const item of assignments) {
      const isCompleted = item.assignment_status === "completed" || item.attempt_status === "submitted" || item.attempt_status === "graded";
      const isInProgress = item.attempt_status === "in_progress" && (item.attempt_max_end_time ? now < item.attempt_max_end_time + 15000 : true);

      if (isCompleted) {
        completed.push({
          ...item,
          is_passed: item.is_passed !== null ? Boolean(item.is_passed) : null,
        });
      } else if (now >= item.assigned_start_time && now <= item.assigned_end_time) {
        available.push({
          ...item,
          in_progress: isInProgress,
          remaining_window_minutes: Math.max(0, Math.floor((item.assigned_end_time - now) / 60000)),
        });
      } else if (now < item.assigned_start_time) {
        upcoming.push({
          ...item,
          starts_in_minutes: Math.floor((item.assigned_start_time - now) / 60000),
        });
      } else {
        // Expired without taking
        completed.push({
          ...item,
          assignment_status: "missed",
        });
      }
    }

    // 2. Recent results
    const recentResults = sqlite
      .prepare(`
        SELECT 
          r.id, r.percentage, r.is_passed, r.completed_at, r.total_score, r.max_score,
          e.title as exam_title, e.id as exam_id,
          a.id as attempt_id
        FROM results r
        JOIN exams e ON e.id = r.exam_id
        JOIN exam_attempts a ON a.id = r.attempt_id
        WHERE r.user_id = ?
        ORDER BY r.completed_at DESC
        LIMIT 5
      `)
      .all(student.id)
      .map((r: any) => ({
        ...r,
        is_passed: Boolean(r.is_passed),
      }));

    return NextResponse.json({
      success: true,
      student,
      availableExams: available,
      upcomingExams: upcoming,
      completedExams: completed,
      recentResults,
      serverTime: now,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Student dashboard error:", error);
    return NextResponse.json({ error: "فشل استرجاع بيانات لوحة الطالب" }, { status: 500 });
  }
}
