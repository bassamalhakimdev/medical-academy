import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!dbUrl) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing database connection URL",
        message: "يرجى ضبط متغير البيئة DATABASE_URL أو POSTGRES_URL في بيئة Vercel أو ملف .env",
      },
      { status: 500 }
    );
  }

  try {
    const startTime = Date.now();
    const result = await sql`SELECT NOW() as now, version() as version;`;
    const latencyMs = Date.now() - startTime;

    // Check count of tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    // Check user count
    const usersCount = await sql`SELECT COUNT(*) as count FROM users;`;

    return NextResponse.json({
      success: true,
      message: "تم التحقق من الاتصال بقاعدة بيانات Neon / Vercel Postgres بنجاح 100%!",
      database: "Neon / Vercel Serverless Postgres",
      latencyMs: `${latencyMs}ms`,
      serverInfo: {
        now: result[0]?.now,
        version: result[0]?.version?.split(" ")[0] + " " + result[0]?.version?.split(" ")[1],
      },
      tablesCount: tables.length,
      tables: tables.map((t: any) => t.table_name),
      seededUsers: Number(usersCount[0]?.count || 0),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "فشل الاتصال بقاعدة بيانات Postgres",
        details: err?.message,
      },
      { status: 502 }
    );
  }
}
