import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const updateExamSchema = z.object({
  title: z.string().min(3, "عنوان الاختبار يجب أن لا يقل عن 3 أحرف").optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(1).optional(),
  passPercentage: z.number().int().min(1).max(100).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleChoices: z.boolean().optional(),
  showResultsImmediately: z.boolean().optional(),
  allowReviewAnswers: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const sqlite = getRawSqlite();

    const exam = sqlite
      .prepare(`
        SELECT 
          id, title, description, status, duration_minutes, pass_percentage,
          shuffle_questions, shuffle_choices, show_results_immediately, allow_review_answers,
          created_at, updated_at
        FROM exams
        WHERE id = ?
      `)
      .get(id) as any;

    if (!exam) {
      return NextResponse.json({ error: "الاختبار غير موجود" }, { status: 404 });
    }

    // Get questions with choices
    const questionsRows = sqlite
      .prepare(`
        SELECT id, question_text, points, explanation, order_index, created_at
        FROM questions
        WHERE exam_id = ?
        ORDER BY order_index ASC, created_at ASC
      `)
      .all(id) as any[];

    const questionIds = questionsRows.map((q) => q.id);
    let allChoices: any[] = [];
    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => "?").join(",");
      allChoices = sqlite
        .prepare(`
          SELECT id, question_id, choice_text, is_correct, order_index
          FROM choices
          WHERE question_id IN (${placeholders})
          ORDER BY order_index ASC
        `)
        .all(...questionIds) as any[];
    }

    const questionsWithChoices = questionsRows.map((q) => ({
      ...q,
      choices: allChoices
        .filter((c) => c.question_id === q.id)
        .map((c) => ({
          ...c,
          is_correct: Boolean(c.is_correct),
        })),
    }));

    return NextResponse.json({
      success: true,
      exam: {
        ...exam,
        shuffle_questions: Boolean(exam.shuffle_questions),
        shuffle_choices: Boolean(exam.shuffle_choices),
        show_results_immediately: Boolean(exam.show_results_immediately),
        allow_review_answers: Boolean(exam.allow_review_answers),
        questions: questionsWithChoices,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل استرجاع تفاصيل الاختبار" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const result = updateExamSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const data = result.data;
    const sqlite = getRawSqlite();

    const existing = sqlite.prepare("SELECT id FROM exams WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "الاختبار غير موجود" }, { status: 404 });
    }

    const updates: string[] = ["updated_at = ?"];
    const values: any[] = [Date.now()];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title.trim());
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description.trim());
    }
    if (data.durationMinutes !== undefined) {
      updates.push("duration_minutes = ?");
      values.push(data.durationMinutes);
    }
    if (data.passPercentage !== undefined) {
      updates.push("pass_percentage = ?");
      values.push(data.passPercentage);
    }
    if (data.shuffleQuestions !== undefined) {
      updates.push("shuffle_questions = ?");
      values.push(data.shuffleQuestions ? 1 : 0);
    }
    if (data.shuffleChoices !== undefined) {
      updates.push("shuffle_choices = ?");
      values.push(data.shuffleChoices ? 1 : 0);
    }
    if (data.showResultsImmediately !== undefined) {
      updates.push("show_results_immediately = ?");
      values.push(data.showResultsImmediately ? 1 : 0);
    }
    if (data.allowReviewAnswers !== undefined) {
      updates.push("allow_review_answers = ?");
      values.push(data.allowReviewAnswers ? 1 : 0);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
    }

    values.push(id);
    sqlite.prepare(`UPDATE exams SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    return NextResponse.json({ success: true, message: "تم تحديث الاختبار بنجاح" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل تحديث الاختبار" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const sqlite = getRawSqlite();

    const result = sqlite.prepare("DELETE FROM exams WHERE id = ?").run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "الاختبار غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم حذف الاختبار بنجاح" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل حذف الاختبار" }, { status: 500 });
  }
}
