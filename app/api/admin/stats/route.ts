import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const sqlite = getRawSqlite();

    // 1. Total students
    const totalStudentsRow = (await sqlite
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'")
      .get()) as { count: any };
    const activeStudentsRow = (await sqlite
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1")
      .get()) as { count: any };

    // 2. Exams
    const totalExamsRow = (await sqlite
      .prepare("SELECT COUNT(*) as count FROM exams")
      .get()) as { count: any };
    const publishedExamsRow = (await sqlite
      .prepare("SELECT COUNT(*) as count FROM exams WHERE status = 'published'")
      .get()) as { count: any };

    // 3. Attempts and Results
    const totalAttemptsRow = (await sqlite
      .prepare("SELECT COUNT(*) as count FROM exam_attempts WHERE status IN ('submitted', 'graded')")
      .get()) as { count: any };

    // 4. Score stats
    const scoreStatsRow = (await sqlite
      .prepare(`
        SELECT 
          AVG(percentage) as avg_score,
          SUM(CASE WHEN is_passed = 1 THEN 1 ELSE 0 END) as passed_count,
          COUNT(*) as total_results
        FROM results
      `)
      .get()) as { avg_score: any; passed_count: any; total_results: any };

    const avgScore = scoreStatsRow?.avg_score ? Math.round(Number(scoreStatsRow.avg_score) * 10) / 10 : 0;
    const totalResults = Number(scoreStatsRow?.total_results || 0);
    const passedCount = Number(scoreStatsRow?.passed_count || 0);
    const passRate = totalResults > 0
      ? Math.round((passedCount / totalResults) * 100)
      : 0;

    // 5. Active Schedules
    const now = Date.now();
    const activeSchedulesRow = (await sqlite
      .prepare("SELECT COUNT(*) as count FROM exam_schedules WHERE is_active = 1 AND end_time >= ?")
      .get(now)) as { count: any };

    // 6. Recent Submissions
    const recentSubmissions = await sqlite
      .prepare(`
        SELECT 
          r.id, r.percentage, r.is_passed, r.completed_at, r.total_score, r.max_score,
          u.name as student_name, u.email as student_email, u.student_id,
          e.title as exam_title
        FROM results r
        JOIN users u ON u.id = r.user_id
        JOIN exams e ON e.id = r.exam_id
        ORDER BY r.completed_at DESC
        LIMIT 6
      `)
      .all();

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: Number(totalStudentsRow?.count || 0),
        activeStudents: Number(activeStudentsRow?.count || 0),
        totalExams: Number(totalExamsRow?.count || 0),
        publishedExams: Number(publishedExamsRow?.count || 0),
        totalAttempts: Number(totalAttemptsRow?.count || 0),
        averageScore: avgScore,
        passRate: passRate,
        activeSchedules: Number(activeSchedulesRow?.count || 0),
      },
      recentSubmissions,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "صلاحية الإدارة مطلوبة" }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "فشل استرجاع الإحصائيات" }, { status: 500 });
  }
}
