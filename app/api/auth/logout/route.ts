import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ error: "فشل تسجيل الخروج" }, { status: 500 });
  }
}
