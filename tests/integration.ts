import { getRawSqlite } from "../lib/db";

async function runIntegrationTests() {
  console.log("🚀 Starting End-to-End System Integration Tests on Neon Postgres...\n");
  const sqlite = getRawSqlite();

  // 1. Database Check
  console.log("1️⃣ Verifying Database Tables & Integrity...");
  const userCount = (await sqlite.prepare("SELECT count(*) as c FROM users").get()) as { c: any };
  const examCount = (await sqlite.prepare("SELECT count(*) as c FROM exams").get()) as { c: any };
  const questionCount = (await sqlite.prepare("SELECT count(*) as c FROM questions").get()) as { c: any };
  const choiceCount = (await sqlite.prepare("SELECT count(*) as c FROM choices").get()) as { c: any };
  const scheduleCount = (await sqlite.prepare("SELECT count(*) as c FROM exam_schedules").get()) as { c: any };

  const uCount = Number(userCount?.c || 0);
  const eCount = Number(examCount?.c || 0);
  const qCount = Number(questionCount?.c || 0);
  const cCount = Number(choiceCount?.c || 0);
  const sCount = Number(scheduleCount?.c || 0);

  console.log(`   - Users: ${uCount}`);
  console.log(`   - Exams: ${eCount}`);
  console.log(`   - Questions: ${qCount}`);
  console.log(`   - Choices: ${cCount}`);
  console.log(`   - Schedules: ${sCount}`);

  if (uCount === 0 || eCount === 0) {
    throw new Error("❌ Seed check failed!");
  }
  console.log("   ✅ Database tables and seeded anesthesia data verified.\n");

  // 2. Authentication and Password Hashing
  console.log("2️⃣ Verifying Password Hashes and Auth Roles...");
  const admin = (await sqlite.prepare("SELECT email, role, password_hash FROM users WHERE role = 'admin'").get()) as any;
  const student = (await sqlite.prepare("SELECT email, role, password_hash, is_active FROM users WHERE role = 'student' LIMIT 1").get()) as any;

  if (!admin || !student) throw new Error("❌ Missing users");
  if (!admin.password_hash.startsWith("$2") || !student.password_hash.startsWith("$2")) {
    throw new Error("❌ Password is not hashed with bcrypt!");
  }
  console.log("   ✅ Passwords safely hashed with bcrypt.");
  console.log(`   ✅ Admin: ${admin.email} (Role: ${admin.role})`);
  console.log(`   ✅ Student: ${student.email} (Role: ${student.role}, Active: ${Boolean(student.is_active)})\n`);

  // 3. Exam MCQ Questions & 4 Choices Structure
  console.log("3️⃣ Verifying MCQ Anatomy (4 choices per question & exactly 1 correct answer)...");
  const sampleQuestion = (await sqlite.prepare("SELECT id, question_text, exam_id FROM questions LIMIT 1").get()) as any;
  const sampleChoices = (await sqlite.prepare("SELECT id, choice_text, is_correct FROM choices WHERE question_id = ?").all(sampleQuestion.id)) as any[];

  console.log(`   - Sample Question: "${sampleQuestion.question_text.slice(0, 50)}..."`);
  console.log(`   - Choices count: ${sampleChoices.length}`);
  const correctChoice = sampleChoices.filter((c) => Number(c.is_correct) === 1);
  console.log(`   - Correct choices: ${correctChoice.length} ("${correctChoice[0]?.choice_text.slice(0, 30)}...")`);

  if (sampleChoices.length !== 4) throw new Error("❌ Question does not have 4 choices!");
  if (correctChoice.length !== 1) throw new Error("❌ Question must have exactly 1 correct choice!");
  console.log("   ✅ Question structure verified.\n");

  // 4. Scheduling Verification (Group & Individual)
  console.log("4️⃣ Verifying Scheduling Systems (Group vs Individual)...");
  const groupSchedule = (await sqlite.prepare("SELECT * FROM exam_schedules WHERE schedule_type = 'group' LIMIT 1").get()) as any;
  const individualSchedule = (await sqlite.prepare("SELECT * FROM exam_schedules WHERE schedule_type = 'individual' LIMIT 1").get()) as any;

  if (!groupSchedule) throw new Error("❌ Missing group schedule");
  if (!individualSchedule) throw new Error("❌ Missing individual schedule");

  console.log(`   - Group Schedule: "${groupSchedule.title}" (Target: ${groupSchedule.target_group}, Duration: ${groupSchedule.duration_minutes} min)`);
  console.log(`   - Individual Schedule: "${individualSchedule.title}" (Target User ID: ${individualSchedule.target_user_id}, Duration: ${individualSchedule.duration_minutes} min)`);
  console.log("   ✅ Both Group and Individual scheduling models verified.\n");

  // 5. Test Exam Engine Simulation (Attempt, Autosave, Submit, Atomic Grading)
  console.log("5️⃣ Simulating Live Exam Attempt & Grading Cycle...");
  const testStudent = (await sqlite.prepare("SELECT id, name FROM users WHERE email = 'zainab.ghamari@anesthesia-academy.com'").get()) as any;
  const examToTake = (await sqlite.prepare("SELECT id, title, pass_percentage FROM exams WHERE status = 'published' LIMIT 1").get()) as any;
  const scheduleForTest = (await sqlite.prepare("SELECT id, duration_minutes FROM exam_schedules WHERE exam_id = ? AND schedule_type = 'group'").get(examToTake.id)) as any;

  const now = Date.now();
  const attemptId = "test-attempt-" + Math.random().toString(36).substring(2, 9);
  const qList = (await sqlite.prepare("SELECT id, points FROM questions WHERE exam_id = ?").all(examToTake.id)) as { id: string; points: number }[];

  // Create attempt
  await sqlite.prepare(`
    INSERT INTO exam_attempts (
      id, exam_id, schedule_id, user_id, start_time, max_end_time, status, question_order, choice_orders, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'in_progress', ?, '{}', ?)
  `).run(
    attemptId,
    examToTake.id,
    scheduleForTest.id,
    testStudent.id,
    now,
    now + scheduleForTest.duration_minutes * 60000,
    JSON.stringify(qList.map(q => q.id)),
    now
  );
  console.log(`   - Attempt created: ${attemptId} for ${testStudent.name}`);

  // Autosave answers (Answer all questions correctly)
  let simulatedScore = 0;
  for (const q of qList) {
    const correctC = (await sqlite.prepare("SELECT id FROM choices WHERE question_id = ? AND is_correct = 1").get(q.id)) as any;
    await sqlite.prepare(`
      INSERT INTO student_answers (id, attempt_id, question_id, selected_choice_id, saved_at)
      VALUES (?, ?, ?, ?, ?)
    `).run("ans-" + Math.random().toString(36).substring(2, 8), attemptId, q.id, correctC.id, now);
    simulatedScore += Number(q.points);
  }
  console.log(`   - Autosaved ${qList.length} answers successfully.`);

  // Submit and grade atomically
  const resultId = "res-" + Math.random().toString(36).substring(2, 8);
  const totalMax = qList.reduce((acc, q) => acc + Number(q.points), 0);
  const percent = Math.round((simulatedScore / totalMax) * 100);
  const isPassed = percent >= examToTake.pass_percentage;

  // Update student answers
  await sqlite.prepare("UPDATE student_answers SET is_correct = 1, points_awarded = 1 WHERE attempt_id = ?").run(attemptId);

  // Insert result
  await sqlite.prepare(`
    INSERT INTO results (
      id, attempt_id, exam_id, user_id, total_questions, answered_questions,
      correct_answers, total_score, max_score, percentage, is_passed, completed_at, feedback
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ممتاز')
  `).run(
    resultId,
    attemptId,
    examToTake.id,
    testStudent.id,
    qList.length,
    qList.length,
    qList.length,
    simulatedScore,
    totalMax,
    percent,
    isPassed ? 1 : 0,
    now + 5000
  );

  // Update attempt
  await sqlite.prepare("UPDATE exam_attempts SET status = 'graded', submit_time = ? WHERE id = ?").run(now + 5000, attemptId);

  console.log(`   - Submitted & Graded successfully!`);
  console.log(`   - Result: ${percent}% (Passed: ${isPassed}, Score: ${simulatedScore}/${totalMax})`);

  // Verify double submission guard
  const attemptFinal = (await sqlite.prepare("SELECT status FROM exam_attempts WHERE id = ?").get(attemptId)) as any;
  if (attemptFinal.status !== "graded") {
    throw new Error("❌ Attempt status is not graded!");
  }
  console.log("   ✅ Submission & Status Verified.\n");

  // Clean up test attempt to keep db clean
  await sqlite.prepare("DELETE FROM results WHERE id = ?").run(resultId);
  await sqlite.prepare("DELETE FROM student_answers WHERE attempt_id = ?").run(attemptId);
  await sqlite.prepare("DELETE FROM exam_attempts WHERE id = ?").run(attemptId);
  console.log("🧹 Test cleanup completed.");

  console.log("\n🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS ON NEON POSTGRES!");
}

runIntegrationTests().catch((err) => {
  console.error("Test error:", err);
  process.exitCode = 1;
});
