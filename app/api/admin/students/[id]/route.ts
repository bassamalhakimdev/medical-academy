import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const updateStudentSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل").optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف").optional().or(z.literal("")),
  studentId: z.string().min(1, "الرقم الأكاديمي مطلوب").optional(),
  phone: z.string().optional().nullable(),
  groupTag: z.string().min(1, "المجموعة مطلوبة").optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const sqlite = getRawSqlite();

    const student = sqlite
      .prepare(`
        SELECT id, name, email, is_active, student_id, phone, group_tag, created_at, updated_at
        FROM users
        WHERE id = ? AND role = 'student'
      `)
      .get(id) as any;

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    // Get exam history
    const history = sqlite
      .prepare(`
        SELECT 
          r.id as result_id, r.percentage, r.is_passed, r.completed_at, r.total_score, r.max_score,
          e.title as exam_title, e.id as exam_id,
          a.start_time, a.submit_time
        FROM results r
        JOIN exams e ON e.id = r.exam_id
        JOIN exam_attempts a ON a.id = r.attempt_id
        WHERE r.user_id = ?
        ORDER BY r.completed_at DESC
      `)
      .all(id);

    return NextResponse.json({
      success: true,
      student: {
        ...student,
        is_active: Boolean(student.is_active),
      },
      history,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل استرجاع بيانات الطالب" }, { status: 500 });
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
    const result = updateStudentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const data = result.data;
    const sqlite = getRawSqlite();

    const existing = sqlite.prepare("SELECT id FROM users WHERE id = ? AND role = 'student'").get(id);
    if (!existing) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    // If updating email, check uniqueness
    if (data.email) {
      const emailConflict = sqlite
        .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
        .get(data.email.toLowerCase().trim(), id);
      if (emailConflict) {
        return NextResponse.json({ error: "البريد الإلكتروني مسجل لطالب آخر" }, { status: 400 });
      }
    }

    // If updating studentId, check uniqueness
    if (data.studentId) {
      const idConflict = sqlite
        .prepare("SELECT id FROM users WHERE student_id = ? AND id != ?")
        .get(data.studentId.trim(), id);
      if (idConflict) {
        return NextResponse.json({ error: "الرقم الأكاديمي مسجل لطالب آخر" }, { status: 400 });
      }
    }

    const updates: string[] = ["updated_at = ?"];
    const values: any[] = [Date.now()];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name.trim());
    }
    if (data.email !== undefined) {
      updates.push("email = ?");
      values.push(data.email.toLowerCase().trim());
    }
    if (data.studentId !== undefined) {
      updates.push("student_id = ?");
      values.push(data.studentId.trim());
    }
    if (data.phone !== undefined) {
      updates.push("phone = ?");
      values.push(data.phone ? data.phone.trim() : null);
    }
    if (data.groupTag !== undefined) {
      updates.push("group_tag = ?");
      values.push(data.groupTag.trim());
    }
    if (data.isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(data.isActive ? 1 : 0);
    }
    if (data.password && data.password.trim().length >= 6) {
      const hash = await hashPassword(data.password.trim());
      updates.push("password_hash = ?");
      values.push(hash);
    }

    values.push(id);
    sqlite.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    return NextResponse.json({ success: true, message: "تم تحديث بيانات الطالب بنجاح" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Update student error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات الطالب" }, { status: 500 });
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

    const result = sqlite.prepare("DELETE FROM users WHERE id = ? AND role = 'student'").run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم حذف حساب الطالب بنجاح" });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    return NextResponse.json({ error: "فشل حذف حساب الطالب" }, { status: 500 });
  }
}
