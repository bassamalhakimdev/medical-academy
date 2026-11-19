import { NextResponse } from "next/server";
import { z } from "zod";
import { getRawSqlite } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

import { getZodErrorMessage } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: getZodErrorMessage(result.error) },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const sqlite = getRawSqlite();

    const user = (await sqlite
      .prepare("SELECT id, name, email, password_hash, role, is_active, student_id, group_tag FROM users WHERE email = ?")
      .get(email.toLowerCase().trim())) as any;

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: "تم تعطيل هذا الحساب من قِبل إدارة الأكاديمية. يرجى التواصل مع المشرف." },
        { status: 403 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // Create session and set cookie
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.student_id,
        groupTag: user.group_tag,
      },
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع في الخادم أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
