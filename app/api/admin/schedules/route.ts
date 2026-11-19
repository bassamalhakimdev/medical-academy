import { NextResponse } from "next/server";
import { requireAdmin, generateId } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const createScheduleSchema = z.object({
  examId: z.string().min(1, "الاختبار مطلوب"),
  scheduleType: z.enum(["group", "individual"]),
  title: z.string().min(3, "عنوان الجدولة مطلوب"),
  targetGroup: z.string().optional().nullable(),
  targetUserId: z.string().optional().nullable(),
  startTime: z.number().int().min(1, "وقت البداية غير صالح"),
  endTime: z.number().int().min(1, "وقت النهاية غير صالح"),
  durationMinutes: z.number().int().min(1, "مدة الاختبار بالدقائق مطلوبة"),
});

export async function GET() {
  try {
    await requireAdmin();
    const sqlite = getRawSqlite();

    const schedules = sqlite
      .prepare(`
        SELECT 
          s.id, s.exam_id, s.schedule_type, s.title, s.target_group, s.target_user_id,
          s.start_time, s.end_time, s.duration_minutes, s.is_active, s.created_at,
          e.title as exam_title, e.status as exam_status,
          u.name as target_user_name, u.student_id as target_student_id,
          COUNT(DISTINCT a.id) as assigned_count,
          SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_count
        FROM exam_schedules s
        JOIN exams e ON e.id = s.exam_id
        LEFT JOIN users u ON u.id = s.target_user_id
        LEFT JOIN exam_assignments a ON a.schedule_id = s.id
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `)
      .all()
      .map((sc: any) => ({
        ...sc,
        is_active: Boolean(sc.is_active),
      }));

    return NextResponse.json({ success: true, schedules });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل استرجاع الجداول" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const result = createScheduleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const {
      examId,
      scheduleType,
      title,
      targetGroup,
      targetUserId,
      startTime,
      endTime,
      durationMinutes,
    } = result.data;

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "وقت النهاية يجب أن يكون بعد وقت البداية" },
        { status: 400 }
      );
    }

    const totalWindowMinutes = Math.floor((endTime - startTime) / (60 * 1000));
    if (durationMinutes > totalWindowMinutes) {
      return NextResponse.json(
        { error: "مدة الاختبار لا يمكن أن تتجاوز النافذة الزمنية المتاحة بين البداية والنهاية" },
        { status: 400 }
      );
    }

    const sqlite = getRawSqlite();

    // Verify exam exists and is published
    const exam = sqlite.prepare("SELECT id, title, status FROM exams WHERE id = ?").get(examId) as any;
    if (!exam) {
      return NextResponse.json({ error: "الاختبار المحدد غير موجود" }, { status: 404 });
    }

    if (exam.status !== "published") {
      return NextResponse.json(
        { error: "لا يمكن جدولة اختبار غير منشور. يرجى نشر الاختبار أولاً." },
        { status: 400 }
      );
    }

    const scheduleId = generateId();
    const now = Date.now();

    const createScheduleTx = sqlite.transaction(() => {
      // 1. Insert schedule
      sqlite
        .prepare(`
          INSERT INTO exam_schedules (
            id, exam_id, schedule_type, title, target_group, target_user_id,
            start_time, end_time, duration_minutes, is_active, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        `)
        .run(
          scheduleId,
          examId,
          scheduleType,
          title.trim(),
          targetGroup || null,
          targetUserId || null,
          startTime,
          endTime,
          durationMinutes,
          now
        );

      // 2. Insert assignments
      if (scheduleType === "individual" && targetUserId) {
        sqlite
          .prepare(`
            INSERT INTO exam_assignments (
              id, exam_id, schedule_id, user_id, assigned_start_time, assigned_end_time,
              duration_minutes, status, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'assigned', ?)
          `)
          .run(generateId(), examId, scheduleId, targetUserId, startTime, endTime, durationMinutes, now);
      } else if (scheduleType === "group") {
        let studentsQuery = "SELECT id FROM users WHERE role = 'student' AND is_active = 1";
        const params: any[] = [];
        if (targetGroup && targetGroup !== "all") {
          studentsQuery += " AND group_tag = ?";
          params.push(targetGroup);
        }

        const eligibleStudents = sqlite.prepare(studentsQuery).all(...params) as { id: string }[];
        for (const st of eligibleStudents) {
          sqlite
            .prepare(`
              INSERT INTO exam_assignments (
                id, exam_id, schedule_id, user_id, assigned_start_time, assigned_end_time,
                duration_minutes, status, created_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, 'assigned', ?)
            `)
            .run(generateId(), examId, scheduleId, st.id, startTime, endTime, durationMinutes, now);
        }
      }
    });

    createScheduleTx();

    return NextResponse.json({
      success: true,
      scheduleId,
      message: "تم حفظ وجدولة الاختبار بنجاح",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Create schedule error:", error);
    return NextResponse.json({ error: "فشل إنشاء الجدولة" }, { status: 500 });
  }
}
