import { NextResponse } from "next/server";
import { requireAdmin, generateId } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const updateQuestionSchema = z.object({
  questionText: z.string().min(5, "نص السؤال يجب أن لا يقل عن 5 أحرف"),
  points: z.number().min(0.5, "الدرجة يجب أن تكون 0.5 على الأقل").default(1),
  explanation: z.string().optional().default(""),
  choices: z
    .array(
      z.object({
        id: z.string().optional(),
        choiceText: z.string().min(1, "نص الاختيار لا يمكن أن يكون فارغاً"),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(2, "يجب إضافة اختيارين على الأقل"),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: questionId } = await params;
    const body = await req.json();
    const result = updateQuestionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const { questionText, points, explanation, choices } = result.data;
    const correctCount = choices.filter((c) => c.isCorrect).length;
    if (correctCount === 0) {
      return NextResponse.json(
        { error: "يجب تحديد إجابة صحيحة واحدة على الأقل" },
        { status: 400 }
      );
    }

    const sqlite = getRawSqlite();
    const question = sqlite.prepare("SELECT exam_id FROM questions WHERE id = ?").get(questionId) as any;
    if (!question) {
      return NextResponse.json({ error: "السؤال غير موجود" }, { status: 404 });
    }

    const updateTx = sqlite.transaction(() => {
      // Update question details
      sqlite
        .prepare(`
          UPDATE questions 
          SET question_text = ?, points = ?, explanation = ?
          WHERE id = ?
        `)
        .run(questionText.trim(), points, explanation?.trim() || "", questionId);

      // Recreate or update choices
      sqlite.prepare("DELETE FROM choices WHERE question_id = ?").run(questionId);

      for (let i = 0; i < choices.length; i++) {
        const c = choices[i];
        sqlite
          .prepare(`
            INSERT INTO choices (id, question_id, choice_text, is_correct, order_index)
            VALUES (?, ?, ?, ?, ?)
          `)
          .run(generateId(), questionId, c.choiceText.trim(), c.isCorrect ? 1 : 0, i + 1);
      }

      sqlite.prepare("UPDATE exams SET updated_at = ? WHERE id = ?").run(Date.now(), question.exam_id);
    });

    updateTx();

    return NextResponse.json({ success: true, message: "تم تعديل السؤال بنجاح" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل تعديل السؤال" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: questionId } = await params;
    const sqlite = getRawSqlite();

    const question = sqlite.prepare("SELECT exam_id FROM questions WHERE id = ?").get(questionId) as any;
    if (!question) {
      return NextResponse.json({ error: "السؤال غير موجود" }, { status: 404 });
    }

    const deleteTx = sqlite.transaction(() => {
      sqlite.prepare("DELETE FROM questions WHERE id = ?").run(questionId);
      sqlite
        .prepare(`
          UPDATE exams 
          SET total_questions = (SELECT COUNT(*) FROM questions WHERE exam_id = ?),
              updated_at = ?
          WHERE id = ?
        `)
        .run(question.exam_id, Date.now(), question.exam_id);
    });

    deleteTx();

    return NextResponse.json({ success: true, message: "تم حذف السؤال بنجاح" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل حذف السؤال" }, { status: 500 });
  }
}
