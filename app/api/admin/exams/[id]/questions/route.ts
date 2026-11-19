import { NextResponse } from "next/server";
import { requireAdmin, generateId } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const createQuestionSchema = z.object({
  questionText: z.string().min(5, "نص السؤال يجب أن لا يقل عن 5 أحرف"),
  points: z.number().min(0.5, "الدرجة يجب أن تكون 0.5 على الأقل").default(1),
  explanation: z.string().optional().default(""),
  choices: z
    .array(
      z.object({
        choiceText: z.string().min(1, "نص الاختيار لا يمكن أن يكون فارغاً"),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(2, "يجب إضافة اختيارين على الأقل")
    .max(6, "الحد الأقصى للاختيارات هو 6"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: examId } = await params;
    const body = await req.json();
    const result = createQuestionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const { questionText, points, explanation, choices } = result.data;

    // Verify exactly one or at least one choice is marked correct
    const correctCount = choices.filter((c) => c.isCorrect).length;
    if (correctCount === 0) {
      return NextResponse.json(
        { error: "يجب تحديد إجابة صحيحة واحدة على الأقل" },
        { status: 400 }
      );
    }

    const sqlite = getRawSqlite();
    const exam = sqlite.prepare("SELECT id FROM exams WHERE id = ?").get(examId);
    if (!exam) {
      return NextResponse.json({ error: "الاختبار غير موجود" }, { status: 404 });
    }

    const maxOrderRow = sqlite
      .prepare("SELECT MAX(order_index) as max_order FROM questions WHERE exam_id = ?")
      .get(examId) as { max_order: number | null };
    const nextOrder = (maxOrderRow?.max_order ?? 0) + 1;

    const questionId = generateId();
    const now = Date.now();

    // Use transaction
    const insertQuestionTx = sqlite.transaction(() => {
      sqlite
        .prepare(`
          INSERT INTO questions (id, exam_id, question_text, points, explanation, order_index, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(questionId, examId, questionText.trim(), points, explanation?.trim() || "", nextOrder, now);

      for (let i = 0; i < choices.length; i++) {
        const c = choices[i];
        sqlite
          .prepare(`
            INSERT INTO choices (id, question_id, choice_text, is_correct, order_index)
            VALUES (?, ?, ?, ?, ?)
          `)
          .run(generateId(), questionId, c.choiceText.trim(), c.isCorrect ? 1 : 0, i + 1);
      }

      // Update total_questions in exam
      sqlite
        .prepare(`
          UPDATE exams 
          SET total_questions = (SELECT COUNT(*) FROM questions WHERE exam_id = ?),
              updated_at = ?
          WHERE id = ?
        `)
        .run(examId, now, examId);
    });

    insertQuestionTx();

    return NextResponse.json({
      success: true,
      questionId,
      message: "تمت إضافة السؤال بنجاح",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Add question error:", error);
    return NextResponse.json({ error: "فشل إضافة السؤال" }, { status: 500 });
  }
}
