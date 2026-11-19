import { NextResponse } from "next/server";
import { requireStudent, generateId } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";

// Fisher-Yates array shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireStudent();
    const { id: examId } = await params;
    const sqlite = getRawSqlite();
    const now = Date.now();

    // 1. Verify exam exists and is published
    const exam = (await sqlite
      .prepare(`
        SELECT id, title, duration_minutes, shuffle_questions, shuffle_choices, status
        FROM exams
        WHERE id = ?
      `)
      .get(examId)) as any;

    if (!exam || exam.status !== "published") {
      return NextResponse.json({ error: "الاختبار غير متاح حالياً" }, { status: 404 });
    }

    // 2. Verify student has an active assignment for this exam within the allowed time window
    const assignment = (await sqlite
      .prepare(`
        SELECT a.id, a.schedule_id, a.assigned_start_time, a.assigned_end_time, a.duration_minutes, a.status
        FROM exam_assignments a
        JOIN exam_schedules s ON s.id = a.schedule_id
        WHERE a.user_id = ? AND a.exam_id = ? AND s.is_active = 1
        ORDER BY a.assigned_start_time DESC
        LIMIT 1
      `)
      .get(student.id, examId)) as any;

    if (!assignment) {
      return NextResponse.json(
        { error: "أنت غير مسجل أو مجدول لهذا الاختبار. يرجى مراجعة إدارة الأكاديمية." },
        { status: 403 }
      );
    }

    if (now < assignment.assigned_start_time) {
      return NextResponse.json(
        { error: "لم يحن موعد بدء الاختبار بعد وفق الجدولة المحددة" },
        { status: 400 }
      );
    }

    if (now > assignment.assigned_end_time) {
      return NextResponse.json(
        { error: "انتهت الفترة الزمنية المسموح فيها ببدء هذا الاختبار" },
        { status: 400 }
      );
    }

    // 3. Check for existing attempts
    const existingAttempt = (await sqlite
      .prepare(`
        SELECT id, start_time, max_end_time, status, question_order, choice_orders
        FROM exam_attempts
        WHERE assignment_id = ? AND user_id = ?
      `)
      .get(assignment.id, student.id)) as any;

    if (existingAttempt) {
      if (existingAttempt.status === "submitted" || existingAttempt.status === "graded") {
        return NextResponse.json(
          { error: "تم تسليم هذا الاختبار مسبقاً، ولا يُسمح بإعادة المحاولة." },
          { status: 400 }
        );
      }

      // Check if attempt time expired
      if (now > existingAttempt.max_end_time + 15000) {
        return NextResponse.json(
          { error: "انتهى الوقت المسموح به لهذا الاختبار." },
          { status: 400 }
        );
      }

      // Resume existing attempt
      return NextResponse.json({
        success: true,
        resumed: true,
        attemptId: existingAttempt.id,
        serverTime: now,
        maxEndTime: existingAttempt.max_end_time,
      });
    }

    // 4. Create new attempt
    // Calculate max_end_time based on duration, but capped by assignment.assigned_end_time
    const durationMs = assignment.duration_minutes * 60 * 1000;
    const maxEndTime = Math.min(now + durationMs, assignment.assigned_end_time);

    // Fetch questions
    const questionsRows = (await sqlite
      .prepare("SELECT id FROM questions WHERE exam_id = ? ORDER BY order_index ASC")
      .all(examId)) as { id: string }[];

    if (questionsRows.length === 0) {
      return NextResponse.json({ error: "لا توجد أسئلة مضافة في هذا الاختبار بعد" }, { status: 400 });
    }

    let questionIds = questionsRows.map((q) => q.id);
    if (exam.shuffle_questions) {
      questionIds = shuffleArray(questionIds);
    }

    // Fetch choices for all questions
    const placeholders = questionIds.map(() => "?").join(",");
    const choicesRows = (await sqlite
      .prepare(`SELECT id, question_id FROM choices WHERE question_id IN (${placeholders}) ORDER BY order_index ASC`)
      .all(...questionIds)) as { id: string; question_id: string }[];

    const choiceOrdersMap: Record<string, string[]> = {};
    for (const qId of questionIds) {
      let qChoiceIds = choicesRows.filter((c) => c.question_id === qId).map((c) => c.id);
      if (exam.shuffle_choices) {
        qChoiceIds = shuffleArray(qChoiceIds);
      }
      choiceOrdersMap[qId] = qChoiceIds;
    }

    const attemptId = generateId();

    await sqlite
      .prepare(`
        INSERT INTO exam_attempts (
          id, exam_id, schedule_id, assignment_id, user_id, start_time, max_end_time,
          status, question_order, choice_orders, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, ?, ?)
      `)
      .run(
        attemptId,
        examId,
        assignment.schedule_id,
        assignment.id,
        student.id,
        now,
        maxEndTime,
        JSON.stringify(questionIds),
        JSON.stringify(choiceOrdersMap),
        now
      );

    await sqlite
      .prepare("UPDATE exam_assignments SET status = 'in_progress' WHERE id = ?")
      .run(assignment.id);

    return NextResponse.json({
      success: true,
      resumed: false,
      attemptId,
      serverTime: now,
      maxEndTime,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Start exam error:", error);
    return NextResponse.json({ error: "فشل بدء الاختبار" }, { status: 500 });
  }
}
