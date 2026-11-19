/**
 * One-off migration: rename the demo accounts in an already-seeded database
 * to match lib/db/seed.ts (student names instead of "doctors").
 * Updates rows in place by email, so IDs, attempts and results are preserved.
 * Safe to run multiple times.
 *
 * Usage: npx tsx --env-file=.env scripts/rename-demo-users.ts
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is not set");
}
const sql = neon(databaseUrl);

const DOMAIN = "anesthesia-academy.com";

const renames = [
  { oldEmail: `admin@${DOMAIN}`, email: `admin@${DOMAIN}`, name: "د. عاصم المناري", phone: "+967770000001", groupTag: null },
  { oldEmail: `ahmed.zahrani@${DOMAIN}`, email: `bassam.abdulhakim@${DOMAIN}`, name: "بسام عبد الحكيم", phone: "+967771112233", groupTag: "دفعة 2026" },
  { oldEmail: `sara.mansoor@${DOMAIN}`, email: `zainab.ghamari@${DOMAIN}`, name: "زينب الغماري", phone: "+967772223344", groupTag: "دفعة 2026" },
  { oldEmail: `omar.qahtani@${DOMAIN}`, email: `ali.ahmed@${DOMAIN}`, name: "علي أحمد", phone: "+967773334455", groupTag: "دفعة 2026" },
  { oldEmail: `reem.dosari@${DOMAIN}`, email: `mohammed.ali@${DOMAIN}`, name: "محمد علي", phone: "+967774445566", groupTag: "دفعة 2025" },
];

async function main() {
  const now = Date.now();

  console.log("Before:");
  console.table(await sql`SELECT name, email, group_tag FROM users ORDER BY role, created_at`);

  for (const r of renames) {
    await sql`
      UPDATE users
      SET name = ${r.name},
          email = ${r.email},
          phone = ${r.phone},
          group_tag = COALESCE(${r.groupTag}, group_tag),
          updated_at = ${now}
      WHERE email = ${r.oldEmail} OR email = ${r.email}`;
  }

  // Old cohort labels that mentioned residents / fellowship
  await sql`UPDATE users SET group_tag = 'دفعة 2026' WHERE group_tag = 'دفعة 2026 - المقيمين (R1)'`;
  await sql`UPDATE users SET group_tag = 'دفعة 2025' WHERE group_tag = 'دفعة 2025 - زمالة التخدير (R2)'`;

  // Schedules
  await sql`UPDATE exam_schedules SET target_group = 'دفعة 2026' WHERE target_group = 'دفعة 2026 - المقيمين (R1)'`;
  await sql`UPDATE exam_schedules SET title = REPLACE(title, 'دفعة المقيمين 2026', 'دفعة 2026')`;
  await sql`UPDATE exam_schedules SET title = REPLACE(title, 'جميع المقيمين', 'جميع الطلاب')`;
  await sql`UPDATE exam_schedules SET title = REPLACE(title, 'د. ريم الدوسري', 'محمد علي')`;
  await sql`UPDATE exam_schedules SET title = REPLACE(title, 'ريم الدوسري', 'محمد علي')`;

  // New student: فهد صالح
  const fahadEmail = `fahad.saleh@${DOMAIN}`;
  const existing = await sql`SELECT id FROM users WHERE email = ${fahadEmail}`;
  if (existing.length === 0) {
    const fahadId = crypto.randomUUID();
    const hash = await bcrypt.hash("StudentPass123!", 10);
    await sql`
      INSERT INTO users (id, name, email, password_hash, role, is_active, student_id, phone, group_tag, created_at, updated_at)
      VALUES (${fahadId}, 'فهد صالح', ${fahadEmail}, ${hash}, 'student', 1, 'ANES-2026-004', '+967775556677', 'دفعة 2026', ${now}, ${now})`;

    // Give him the same open group ("all") assignments the other students have
    const schedules = await sql`
      SELECT id, exam_id, start_time, end_time, duration_minutes
      FROM exam_schedules WHERE schedule_type = 'group' AND target_group = 'all' AND is_active = 1`;
    for (const s of schedules) {
      await sql`
        INSERT INTO exam_assignments (id, exam_id, schedule_id, user_id, assigned_start_time, assigned_end_time, duration_minutes, status, created_at)
        VALUES (${crypto.randomUUID()}, ${s.exam_id}, ${s.id}, ${fahadId}, ${s.start_time}, ${s.end_time}, ${s.duration_minutes}, 'assigned', ${now})`;
    }
    console.log(`Added فهد صالح with ${schedules.length} assignments.`);
  }

  console.log("After:");
  console.table(await sql`SELECT name, email, group_tag FROM users ORDER BY role, created_at`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
