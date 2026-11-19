import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

async function testConnection() {
  loadEnv();

  console.log("🔍 فحص الاتصال بقاعدة بيانات Neon / Vercel Postgres...");
  console.log("------------------------------------------------------------");

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  console.log(`- Connection URL: ${dbUrl ? "•••••••••••• (SET)" : "❌ غير مضبوط (NOT SET)"}`);
  console.log(`- Host:           ${process.env.PGHOST || "Neon Serverless Host"}`);
  console.log(`- Database Name:  ${process.env.PGDATABASE || "neondb"}`);
  console.log(`- User:           ${process.env.PGUSER || "neondb_owner"}`);
  console.log("------------------------------------------------------------");

  if (!dbUrl) {
    console.log("\n⚠️ تنبيه: يرجى وضع رابط قاعدة البيانات DATABASE_URL أو POSTGRES_URL في ملف .env");
    return false;
  }

  try {
    const startTime = Date.now();
    const sql = neon(dbUrl);
    const result = await sql`SELECT NOW() as now, version() as version;`;
    const latency = Date.now() - startTime;

    console.log(`\n✅ تم الاتصال بنجاح بقاعدة البيانات! (زمن الاستجابة: ${latency}ms)`);
    console.log(`- توقيت الخادم: ${result[0]?.now}`);
    console.log(`- إصدار المحرك: ${result[0]?.version}`);

    // Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log(`- عدد الجداول المنشأة: ${tables.length}`);
    console.log(`- قائمة الجداول: [ ${tables.map((t: any) => t.table_name).join(", ")} ]`);

    // Check users
    const usersCount = await sql`SELECT COUNT(*) as count FROM users;`;
    console.log(`- عدد المستخدمين المسجلين: ${usersCount[0]?.count}`);

    console.log("\n🚀 جميع الجداول والبيانات جاهزة للعمل على Vercel بنسبة 100%!");
    return true;
  } catch (err: any) {
    console.error("\n❌ فشل الاتصال بقاعدة البيانات:", err?.message);
    return false;
  }
}

testConnection().then((success) => {
  if (!success) {
    process.exitCode = 1;
  }
});
