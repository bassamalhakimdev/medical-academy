import { NextResponse } from "next/server";
import { requireAdmin, generateId } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { getRawSqlite } from "@/lib/db";
import { getZodErrorMessage } from "@/lib/utils";
import { z } from "zod";

const createStudentSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  studentId: z.string().min(1, "الرقم الأكاديمي مطلوب"),
  phone: z.string().optional(),
  groupTag: z.string().min(1, "المجموعة/الدفعة مطلوبة"),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const group = url.searchParams.get("group") || "";
    const status = url.searchParams.get("status") || "";

    const sqlite = getRawSqlite();

    let query = `
      SELECT 
        u.id, u.name, u.email, u.is_active, u.student_id, u.phone, u.group_tag, u.created_at,
        COUNT(DISTINCT r.id) as exams_taken_count,
        AVG(r.percentage) as avg_score
      FROM users u
      LEFT JOIN results r ON r.user_id = u.id
      WHERE u.role = 'student'
    `;
    const params: any[] = [];

    if (search.trim()) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (group.trim()) {
      query += ` AND u.group_tag = ?`;
      params.push(group.trim());
    }

    if (status === "active") {
      query += ` AND u.is_active = 1`;
    } else if (status === "inactive") {
      query += ` AND u.is_active = 0`;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const students = sqlite.prepare(query).all(...params).map((st: any) => ({
      ...st,
      is_active: Boolean(st.is_active),
      avg_score: st.avg_score ? Math.round(st.avg_score * 10) / 10 : null,
    }));

    // Also get distinct groups for filter dropdown
    const groups = sqlite
      .prepare("SELECT DISTINCT group_tag FROM users WHERE role = 'student' AND group_tag IS NOT NULL")
      .all()
      .map((g: any) => g.group_tag);

    return NextResponse.json({ success: true, students, groups });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Students list error:", error);
    return NextResponse.json({ error: "فشل استرجاع قائمة الطلاب" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const result = createStudentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const { name, email, password, studentId, phone, groupTag } = result.data;
    const sqlite = getRawSqlite();

    // Check if email already exists
    const existing = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل مسبقاً لطالب آخر" },
        { status: 400 }
      );
    }

    // Check if studentId already exists
    const existingId = sqlite.prepare("SELECT id FROM users WHERE student_id = ?").get(studentId.trim());
    if (existingId) {
      return NextResponse.json(
        { error: "الرقم الأكاديمي مسجل مسبقاً لطالب آخر" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newId = generateId();
    const now = Date.now();

    sqlite
      .prepare(`
        INSERT INTO users (id, name, email, password_hash, role, is_active, student_id, phone, group_tag, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'student', 1, ?, ?, ?, ?, ?)
      `)
      .run(newId, name.trim(), email.toLowerCase().trim(), passwordHash, studentId.trim(), phone?.trim() || null, groupTag.trim(), now, now);

    return NextResponse.json({
      success: true,
      student: {
        id: newId,
        name,
        email,
        studentId,
        phone,
        groupTag,
        isActive: true,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    console.error("Create student error:", error);
    return NextResponse.json({ error: "فشل إنشاء حساب الطالب" }, { status: 500 });
  }
}
