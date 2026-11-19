import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is not set");
}
const sql = neon(databaseUrl);

async function main() {
  const exams = await sql`SELECT id, title, total_questions FROM exams`;
  console.log("EXAMS_LIST:", JSON.stringify(exams, null, 2));

  const questions = await sql`SELECT id, exam_id, question_text FROM questions ORDER BY order_index ASC`;
  console.log("TOTAL_QUESTIONS_COUNT:", questions.length);
  console.log("QUESTIONS_SAMPLE:", JSON.stringify(questions.slice(0, 10), null, 2));
}

main().catch(console.error);
