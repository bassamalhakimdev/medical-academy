import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const sqlite = getRawSqlite();

    // 1. Total students
    const totalStudentsRow = sqlite
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'")
      .get() as { count: number };
    const activeStudentsRow = sqlite
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1")
      .get() as { count: number };

    // 2. Exams
    const totalExamsRow = sqlite
      .prepare("SELECT COUNT(*) as count FROM exams")
      .get() as { count: number };
    const publishedExamsRow = sqlite
      .prepare("SELECT COUNT(*) as count FROM exams WHERE status = 'published'")
      .get() as { count: number };

    // 3. Attempts and Results
    const totalAttemptsRow = sqlite
      .prepare("SELECT COUNT(*) as count FROM exam_attempts WHERE status IN ('submitted', 'graded')")
      .get() as { count: number };

    // 4. Score stats
    const scoreStatsRow = sqlite
      .prepare(`
        SELECT 
          AVG(percentage) as avg_score,
          SUM(CASE WHEN is_passed = 1 THEN 1 ELSE 0 END) as passed_count,
          COUNT(*) as total_results
        FROM results
      `)
      .get() as { avg_score: number | null; passed_count: number | null; total_results: number };

    const avgScore = scoreStatsRow.avg_score ? Math.round(scoreStatsRow.avg_score * 10) / 10 : 0;
    const passRate = scoreStatsRow.total_results > 0
      ? Math.round(((scoreStatsRow.passed_count || 0) / scoreStatsRow.total_results) * 100)
      : 0;

    // 5. Active Schedules
    const now = Date.now();
    const activeSchedulesRow = sqlite
      .prepare("SELECT COUNT(*) as count FROM exam_schedules WHERE is_active = 1 AND end_time >= ?")
      .get(now) as { count: number };

    // 6. Recent Submissions
    const recentSubmissions = sqlite
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
        totalStudents: totalStudentsRow.count,
        activeStudents: activeStudentsRow.count,
        totalExams: totalExamsRow.count,
        publishedExams: publishedExamsRow.count,
        totalAttempts: totalAttemptsRow.count,
        averageScore: avgScore,
        passRate: passRate,
        activeSchedules: activeSchedulesRow.count,
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
