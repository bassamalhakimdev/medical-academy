import { NextResponse } from "next/server";
import { requireStudent, generateId } from "@/lib/auth/session";
import { getRawSqlite } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireStudent();
    const { id: attemptId } = await params;
    const sqlite = getRawSqlite();
    const now = Date.now();

    // 1. Fetch attempt and exam
    const attempt = sqlite
      .prepare(`
        SELECT 
          a.id, a.exam_id, a.assignment_id, a.start_time, a.max_end_time, a.status,
          e.title as exam_title, e.pass_percentage, e.show_results_immediately, e.allow_review_answers
        FROM exam_attempts a
        JOIN exams e ON e.id = a.exam_id
        WHERE a.id = ? AND a.user_id = ?
      `)
      .get(attemptId, student.id) as any;

    if (!attempt) {
      return NextResponse.json({ error: "محاولة الاختبار غير موجودة" }, { status: 404 });
    }

    // 2. Prevent double submission (Atomic Guard)
    if (attempt.status === "submitted" || attempt.status === "graded") {
      const existingResult = sqlite
        .prepare("SELECT * FROM results WHERE attempt_id = ?")
        .get(attemptId) as any;

      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        message: "تم تسليم هذا الاختبار مسبقاً",
        result: existingResult ? {
          ...existingResult,
          is_passed: Boolean(existingResult.is_passed),
        } : null,
      });
    }

    // 3. Fetch questions and their correct choices
    const questionsRows = sqlite
      .prepare("SELECT id, points FROM questions WHERE exam_id = ?")
      .all(attempt.exam_id) as { id: string; points: number }[];

    const questionIds = questionsRows.map((q) => q.id);
    let choicesRows: any[] = [];
    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => "?").join(",");
      choicesRows = sqlite
        .prepare(`
          SELECT id, question_id, is_correct 
          FROM choices 
          WHERE question_id IN (${placeholders})
        `)
        .all(...questionIds) as any[];
    }

    // 4. Fetch student's answers
    const studentAnswersRows = sqlite
      .prepare("SELECT question_id, selected_choice_id FROM student_answers WHERE attempt_id = ?")
      .all(attemptId) as { question_id: string; selected_choice_id: string }[];

    const answerMap = new Map<string, string>();
    for (const ans of studentAnswersRows) {
      answerMap.set(ans.question_id, ans.selected_choice_id);
    }

    // 5. Grading calculation on server
    let totalScore = 0;
    let maxScore = 0;
    let correctAnswersCount = 0;
    let answeredQuestionsCount = 0;

    const answersToUpdate: Array<{ questionId: string; isCorrect: boolean; points: number }> = [];

    for (const q of questionsRows) {
      maxScore += q.points;
      const selectedChoiceId = answerMap.get(q.id);

      if (selectedChoiceId) {
        answeredQuestionsCount++;
        const choice = choicesRows.find((c) => c.id === selectedChoiceId);
        const isCorrect = choice ? Boolean(choice.is_correct) : false;
        const awarded = isCorrect ? q.points : 0;

        if (isCorrect) {
          correctAnswersCount++;
          totalScore += awarded;
        }

        answersToUpdate.push({
          questionId: q.id,
          isCorrect,
          points: awarded,
        });
      } else {
        // Unanswered
        answersToUpdate.push({
          questionId: q.id,
          isCorrect: false,
          points: 0,
        });
      }
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const isPassed = percentage >= attempt.pass_percentage;
    const resultId = generateId();

    // 6. Execute atomic transaction
    const submitTransaction = sqlite.transaction(() => {
      // Update each student answer with grading details
      for (const item of answersToUpdate) {
        sqlite
          .prepare(`
            UPDATE student_answers 
            SET is_correct = ?, points_awarded = ?
            WHERE attempt_id = ? AND question_id = ?
          `)
          .run(item.isCorrect ? 1 : 0, item.points, attemptId, item.questionId);
      }

      // Insert final result record
      sqlite
        .prepare(`
          INSERT INTO results (
            id, attempt_id, exam_id, user_id, total_questions, answered_questions,
            correct_answers, total_score, max_score, percentage, is_passed, completed_at, feedback
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          resultId,
          attemptId,
          attempt.exam_id,
          student.id,
          questionsRows.length,
          answeredQuestionsCount,
          correctAnswersCount,
          totalScore,
          maxScore,
          percentage,
          isPassed ? 1 : 0,
          now,
          isPassed ? "تهانينا! لقد اجتزت الاختبار بنجاح." : "لم يتم اجتياز الاختبار. يمكنك مراجعة المحتوى وإعادة المحاولة في الجدولة القادمة."
        );

      // Update attempt status to graded
      sqlite
        .prepare(`
          UPDATE exam_attempts 
          SET status = 'graded', submit_time = ?
          WHERE id = ?
        `)
        .run(now, attemptId);

      // Update assignment status to completed
      if (attempt.assignment_id) {
        sqlite
          .prepare(`
            UPDATE exam_assignments 
            SET status = 'completed'
            WHERE id = ?
          `)
          .run(attempt.assignment_id);
      }
    });

    submitTransaction();

    return NextResponse.json({
      success: true,
      message: "تم تسليم الاختبار وتصحيحه بنجاح",
      showResultsImmediately: Boolean(attempt.show_results_immediately),
      result: attempt.show_results_immediately
        ? {
            id: resultId,
            examTitle: attempt.exam_title,
            totalQuestions: questionsRows.length,
            answeredQuestions: answeredQuestionsCount,
            correctAnswers: correctAnswersCount,
            totalScore,
            maxScore,
            percentage,
            isPassed,
            passPercentage: attempt.pass_percentage,
            completedAt: now,
          }
        : null,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Submit attempt error:", error);
    return NextResponse.json({ error: "فشل تسليم وتصحيح الاختبار" }, { status: 500 });
  }
}
