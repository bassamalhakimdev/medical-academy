import { NextResponse } from "next/server";
import { requireStudent, generateId } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const saveAnswerSchema = z.object({
  questionId: z.string().min(1, "معرّف السؤال مطلوب"),
  choiceId: z.string().min(1, "معرّف الاختيار مطلوب"),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireStudent();
    const { id: attemptId } = await params;
    const sqlite = getRawSqlite();
    const now = Date.now();

    const attempt = sqlite
      .prepare(`
        SELECT 
          a.id, a.exam_id, a.start_time, a.max_end_time, a.status, a.submit_time,
          a.question_order, a.choice_orders,
          e.title as exam_title, e.duration_minutes, e.pass_percentage
        FROM exam_attempts a
        JOIN exams e ON e.id = a.exam_id
        WHERE a.id = ? AND a.user_id = ?
      `)
      .get(attemptId, student.id) as any;

    if (!attempt) {
      return NextResponse.json({ error: "محاولة الاختبار غير موجودة" }, { status: 404 });
    }

    // Check if time expired on server while in_progress (allow 15s grace period for network latency)
    const isExpired = now > attempt.max_end_time + 15000;
    if (attempt.status === "in_progress" && isExpired) {
      // Auto-submit attempt if time expired!
      return NextResponse.json({
        success: true,
        timedOut: true,
        status: "timed_out",
        message: "انتهت مدة الاختبار المحددة",
      });
    }

    const questionIds: string[] = JSON.parse(attempt.question_order || "[]");
    const choiceOrders: Record<string, string[]> = JSON.parse(attempt.choice_orders || "{}");

    // Fetch questions
    let questionsList: any[] = [];
    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => "?").join(",");
      const rawQuestions = sqlite
        .prepare(`
          SELECT id, question_text, points
          FROM questions
          WHERE id IN (${placeholders})
        `)
        .all(...questionIds) as any[];

      // Fetch all choices (strictly omitting is_correct!)
      const rawChoices = sqlite
        .prepare(`
          SELECT id, question_id, choice_text
          FROM choices
          WHERE question_id IN (${placeholders})
        `)
        .all(...questionIds) as any[];

      // Reconstruct strictly following student's saved shuffle orders
      questionsList = questionIds
        .map((qId) => {
          const q = rawQuestions.find((item) => item.id === qId);
          if (!q) return null;

          const qChoiceIds = choiceOrders[qId] || [];
          const qChoices = qChoiceIds.map((cId) => rawChoices.find((c) => c.id === cId)).filter(Boolean);

          return {
            id: q.id,
            questionText: q.question_text,
            points: q.points,
            choices: qChoices.map((c) => ({
              id: c.id,
              choiceText: c.choice_text,
            })),
          };
        })
        .filter(Boolean);
    }

    // Fetch already saved answers
    const savedAnswersRows = sqlite
      .prepare("SELECT question_id, selected_choice_id, saved_at FROM student_answers WHERE attempt_id = ?")
      .all(attemptId) as any[];

    const savedAnswers: Record<string, string> = {};
    for (const ans of savedAnswersRows) {
      savedAnswers[ans.question_id] = ans.selected_choice_id;
    }

    const remainingSeconds = Math.max(0, Math.floor((attempt.max_end_time - now) / 1000));

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        examId: attempt.exam_id,
        examTitle: attempt.exam_title,
        status: attempt.status,
        startTime: attempt.start_time,
        maxEndTime: attempt.max_end_time,
        remainingSeconds,
        serverTime: now,
        questions: questionsList,
        savedAnswers,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Get attempt error:", error);
    return NextResponse.json({ error: "فشل استرجاع محاولة الاختبار" }, { status: 500 });
  }
}

// Autosave Answer API
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireStudent();
    const { id: attemptId } = await params;
    const body = await req.json();
    const result = saveAnswerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const { questionId, choiceId } = result.data;
    const sqlite = getRawSqlite();
    const now = Date.now();

    // Verify attempt belongs to student and is in progress
    const attempt = sqlite
      .prepare("SELECT id, max_end_time, status FROM exam_attempts WHERE id = ? AND user_id = ?")
      .get(attemptId, student.id) as any;

    if (!attempt) {
      return NextResponse.json({ error: "المحاولة غير موجودة" }, { status: 404 });
    }

    if (attempt.status !== "in_progress") {
      return NextResponse.json({ error: "لا يمكن تعديل الإجابات بعد تسليم الاختبار" }, { status: 400 });
    }

    // Verify time on server (with 15s grace)
    if (now > attempt.max_end_time + 15000) {
      return NextResponse.json({ error: "انتهى وقت الاختبار المسموح به" }, { status: 400 });
    }

    // Verify choice belongs to question
    const choiceValid = sqlite
      .prepare("SELECT id FROM choices WHERE id = ? AND question_id = ?")
      .get(choiceId, questionId);

    if (!choiceValid) {
      return NextResponse.json({ error: "الاختيار المحدد غير صالح لهذا السؤال" }, { status: 400 });
    }

    // Upsert student answer
    const answerId = generateId();
    sqlite
      .prepare(`
        INSERT INTO student_answers (id, attempt_id, question_id, selected_choice_id, saved_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(attempt_id, question_id) 
        DO UPDATE SET selected_choice_id = excluded.selected_choice_id, saved_at = excluded.saved_at
      `)
      .run(answerId, attemptId, questionId, choiceId, now);

    return NextResponse.json({
      success: true,
      savedAt: now,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Save answer error:", error);
    return NextResponse.json({ error: "فشل حفظ الإجابة" }, { status: 500 });
  }
}
