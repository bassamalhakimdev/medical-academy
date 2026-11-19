import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is not set");
}
const sql = neon(databaseUrl);

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const rawQuestions = [
  {
    num: 1,
    q: "ما هو الهدف الأساسي من التخدير العام؟",
    choices: [
      { text: "فقدان الوعي فقط", isCorrect: false },
      { text: "فقدان الوعي + تسكين الألم + ارتخاء العضلات", isCorrect: true },
      { text: "خفض ضغط الدم", isCorrect: false },
      { text: "إحداث شلل مؤقت", isCorrect: false }
    ]
  },
  {
    num: 2,
    q: "أي من التالي يُعد من أدوية التخدير الاستنشاقي؟",
    choices: [
      { text: "البروبوفول", isCorrect: false },
      { text: "الكيتامين", isCorrect: false },
      { text: "السيفوفلوران", isCorrect: true },
      { text: "الإيتوميديت", isCorrect: false }
    ]
  },
  {
    num: 3,
    q: "ما هو دواء التخدير الوريدي الأكثر استخداماً لتحريض التخدير؟",
    choices: [
      { text: "البروبوفول", isCorrect: true },
      { text: "المورفين", isCorrect: false },
      { text: "الميدازولام", isCorrect: false },
      { text: "النيوستيغمين", isCorrect: false }
    ]
  },
  {
    num: 4,
    q: "أي دواء يُستخدم كمرخٍ للعضلات في التخدير؟",
    choices: [
      { text: "الأتروبين", isCorrect: false },
      { text: "السكسينيل كولين", isCorrect: true },
      { text: "الفنتانيل", isCorrect: false },
      { text: "الليدوكايين", isCorrect: false }
    ]
  },
  {
    num: 5,
    q: "ما هو الترياق المستخدم لعكس تأثير مرخيات العضلات غير المزيلة للاستقطاب؟",
    choices: [
      { text: "النالوكسون", isCorrect: false },
      { text: "الفلومازينيل", isCorrect: false },
      { text: "النيوستيغمين", isCorrect: true },
      { text: "الأتروبين", isCorrect: false }
    ]
  },
  {
    num: 6,
    q: "أي من التالي يُعتبر من الأدوية المسكنة للألم (Opioids) المستخدمة في التخدير؟",
    choices: [
      { text: "الفنتانيل", isCorrect: true },
      { text: "البروبوفول", isCorrect: false },
      { text: "الكيتامين", isCorrect: false },
      { text: "الليدوكايين", isCorrect: false }
    ]
  },
  {
    num: 7,
    q: "ما هو الدواء الذي يُستخدم لعكس تأثير البنزوديازيبينات؟",
    choices: [
      { text: "النالوكسون", isCorrect: false },
      { text: "الفلومازينيل", isCorrect: true },
      { text: "النيوستيغمين", isCorrect: false },
      { text: "الأتروبين", isCorrect: false }
    ]
  },
  {
    num: 8,
    q: "ما هو الدواء الذي يُستخدم لعكس تأثير الأفيونات؟",
    choices: [
      { text: "النالوكسون", isCorrect: true },
      { text: "الفلومازينيل", isCorrect: false },
      { text: "النيوستيغمين", isCorrect: false },
      { text: "السكوبولامين", isCorrect: false }
    ]
  },
  {
    num: 9,
    q: "أي من التالي يُعد من مضادات القيء المستخدمة في التخدير؟",
    choices: [
      { text: "الأوندانسيترون", isCorrect: true },
      { text: "الأتروبين", isCorrect: false },
      { text: "النيوستيغمين", isCorrect: false },
      { text: "الكيتامين", isCorrect: false }
    ]
  },
  {
    num: 10,
    q: "ما هو الدواء الذي يُستخدم لتقليل إفرازات الشعب الهوائية قبل التخدير؟",
    choices: [
      { text: "الأتروبين", isCorrect: true },
      { text: "المورفين", isCorrect: false },
      { text: "البروبوفول", isCorrect: false },
      { text: "السكسينيل كولين", isCorrect: false }
    ]
  },
  {
    num: 11,
    q: "أي من التالي يُعد من الأدوية المهدئة (Sedatives) قبل التخدير؟",
    choices: [
      { text: "الميدازولام", isCorrect: true },
      { text: "النيوستيغمين", isCorrect: false },
      { text: "السكسينيل كولين", isCorrect: false },
      { text: "الفلومازينيل", isCorrect: false }
    ]
  },
  {
    num: 12,
    q: "ما هو الغاز المستخدم في التخدير الاستنشاقي والذي يُعد من الغازات المضغوطة؟",
    choices: [
      { text: "الأكسجين", isCorrect: false },
      { text: "أكسيد النيتروز", isCorrect: true },
      { text: "النيتروجين", isCorrect: false },
      { text: "ثاني أكسيد الكربون", isCorrect: false }
    ]
  },
  {
    num: 13,
    q: "ما هي آلية عمل البروبوفول؟",
    choices: [
      { text: "تنشيط مستقبلات GABA-A", isCorrect: true },
      { text: "حصار مستقبلات NMDA", isCorrect: false },
      { text: "تنشيط مستقبلات الأفيونات", isCorrect: false },
      { text: "حصار قنوات الصوديوم", isCorrect: false }
    ]
  },
  {
    num: 14,
    q: "أي من التالي يُعد من مضاعفات السكسينيل كولين؟",
    choices: [
      { text: "فرط بوتاسيوم الدم", isCorrect: true },
      { text: "نقص سكر الدم", isCorrect: false },
      { text: "ارتفاع ضغط الدم المزمن", isCorrect: false },
      { text: "نقص الكالسيوم", isCorrect: false }
    ]
  },
  {
    num: 15,
    q: "ما هو التأثير الجانبي الأكثر شيوعاً للبروبوفول عند الحقن؟",
    choices: [
      { text: "ألم في موضع الحقن", isCorrect: true },
      { text: "ارتفاع ضغط الدم", isCorrect: false },
      { text: "بطء القلب الشديد", isCorrect: false },
      { text: "فرط الحرارة الخبيث", isCorrect: false }
    ]
  },
  {
    num: 16,
    q: "ما هو الدواء الذي يُستخدم لعلاج فرط الحرارة الخبيث؟",
    choices: [
      { text: "الدانترولين", isCorrect: true },
      { text: "النيوستيغمين", isCorrect: false },
      { text: "الأتروبين", isCorrect: false },
      { text: "النالوكسون", isCorrect: false }
    ]
  },
  {
    num: 17,
    q: "أي من التالي يُعد من الأدوية التي تُقلل ضغط الدم أثناء التخدير؟",
    choices: [
      { text: "البروبوفول", isCorrect: true },
      { text: "الكيتامين", isCorrect: false },
      { text: "الأتروبين", isCorrect: false },
      { text: "السكسينيل كولين", isCorrect: false }
    ]
  },
  {
    num: 18,
    q: "ما هو الدواء الذي يُستخدم كمهدئ ومضاد للقيء ويُعد من مضادات الدوبامين؟",
    choices: [
      { text: "الميتوكلوبراميد", isCorrect: false },
      { text: "الأوندانسيترون", isCorrect: false },
      { text: "الدروبيريدول", isCorrect: true },
      { text: "الأتروبين", isCorrect: false }
    ]
  },
  {
    num: 19,
    q: "ما هي آلية عمل الكيتامين؟",
    choices: [
      { text: "حصار مستقبلات NMDA", isCorrect: true },
      { text: "تنشيط مستقبلات GABA-A", isCorrect: false },
      { text: "تنشيط مستقبلات الأفيونات", isCorrect: false },
      { text: "حصار قنوات الكالسيوم", isCorrect: false }
    ]
  },
  {
    num: 20,
    q: "أي من التالي يُعد من التأثيرات الجانبية للكيتامين؟",
    choices: [
      { text: "الهلوسة والأحلام المزعجة", isCorrect: true },
      { text: "نقص ضغط الدم الشديد", isCorrect: false },
      { text: "بطء القلب", isCorrect: false },
      { text: "نقص بوتاسيوم الدم", isCorrect: false }
    ]
  },
  {
    num: 21,
    q: "ما هو الدواء الذي يُستخدم لتحريض التخدير عند مرضى القلب الحاد؟",
    choices: [
      { text: "الإيتوميديت", isCorrect: true },
      { text: "البروبوفول", isCorrect: false },
      { text: "الكيتامين", isCorrect: false },
      { text: "السيفوفلوران", isCorrect: false }
    ]
  },
  {
    num: 22,
    q: "ما هو التأثير الجانبي الرئيسي للإيتوميديت؟",
    choices: [
      { text: "كبت الكورتيزول", isCorrect: true },
      { text: "ارتفاع ضغط الدم", isCorrect: false },
      { text: "فرط بوتاسيوم الدم", isCorrect: false },
      { text: "الهلوسة", isCorrect: false }
    ]
  },
  {
    num: 23,
    q: "أي من التالي يُعد من مرخيات العضلات غير المزيلة للاستقطاب؟",
    choices: [
      { text: "السكسينيل كولين", isCorrect: false },
      { text: "الروكورونيوم", isCorrect: true },
      { text: "النيوستيغمين", isCorrect: false },
      { text: "الأتروبين", isCorrect: false }
    ]
  },
  {
    num: 24,
    q: "ما هو الدواء الذي يُستخدم لعكس تأثير مرخيات العضلات ويُسبب بطء القلب؟",
    choices: [
      { text: "النيوستيغمين", isCorrect: true },
      { text: "النالوكسون", isCorrect: false },
      { text: "الفلومازينيل", isCorrect: false },
      { text: "الدانترولين", isCorrect: false }
    ]
  },
  {
    num: 25,
    q: "ما هو الدواء الذي يُستخدم كمضاد للقيء من فئة مضادات 5-HT3؟",
    choices: [
      { text: "الأوندانسيترون", isCorrect: true },
      { text: "الميتوكلوبراميد", isCorrect: false },
      { text: "الدروبيريدول", isCorrect: false },
      { text: "الأتروبين", isCorrect: false }
    ]
  },
  {
    num: 26,
    q: "أي من التالي يُعد من الأدوية التي تُسبب ارتخاء العضلات عن طريق تثبيط الأسيتيل كولين؟",
    choices: [
      { text: "مرخيات العضلات غير المزيلة للاستقطاب", isCorrect: true },
      { text: "السكسينيل كولين", isCorrect: false },
      { text: "النيوستيغمين", isCorrect: false },
      { text: "الأتروبين", isCorrect: false }
    ]
  },
  {
    num: 27,
    q: "ما هو الدواء الذي يُستخدم لتقليل إفرازات المعدة قبل التخدير؟",
    choices: [
      { text: "الأوميبرازول", isCorrect: true },
      { text: "الأتروبين", isCorrect: false },
      { text: "الميدازولام", isCorrect: false },
      { text: "البروبوفول", isCorrect: false }
    ]
  },
  {
    num: 28,
    q: "أي من التالي يُعد من مضاعفات التخدير العام؟",
    choices: [
      { text: "نقص التهوية", isCorrect: true },
      { text: "ارتفاع سكر الدم", isCorrect: false },
      { text: "فرط نشاط الغدة الدرقية", isCorrect: false },
      { text: "زيادة الوزن", isCorrect: false }
    ]
  }
];

async function seedExam() {
  console.log("Seeding Pharmacology Exam with 28 questions...");
  const now = Date.now();
  const examId = generateId();

  // 1. Create Exam
  await sql`
    INSERT INTO exams (
      id, title, description, status, total_questions, pass_percentage,
      duration_minutes, shuffle_questions, shuffle_choices, show_results_immediately,
      allow_review_answers, created_at, updated_at
    ) VALUES (
      ${examId},
      'أساسيات أدوية التخدير والإنعاش الطبي',
      'اختبار شامل يغطي أساسيات أدوية التخدير: أدوية التحريض، مرخيات العضلات، المسكنات الأفيونية، المهدئات، مضادات القيء، الأدوية العاكسة، ومضاعفات التخدير.',
      'published',
      ${rawQuestions.length},
      60,
      30,
      1,
      1,
      1,
      1,
      ${now},
      ${now}
    )
  `;
  console.log("Exam created with ID:", examId);

  // 2. Insert Questions and Choices
  for (let i = 0; i < rawQuestions.length; i++) {
    const qData = rawQuestions[i];
    const questionId = generateId();

    await sql`
      INSERT INTO questions (
        id, exam_id, question_text, points, explanation, order_index, created_at
      ) VALUES (
        ${questionId},
        ${examId},
        ${qData.q},
        1,
        '',
        ${i + 1},
        ${now}
      )
    `;

    for (let j = 0; j < qData.choices.length; j++) {
      const c = qData.choices[j];
      const choiceId = generateId();
      await sql`
        INSERT INTO choices (
          id, question_id, choice_text, is_correct, order_index
        ) VALUES (
          ${choiceId},
          ${questionId},
          ${c.text},
          ${c.isCorrect ? 1 : 0},
          ${j + 1}
        )
      `;
    }
  }

  // 3. Schedule this exam for all students so it's ready to take!
  const scheduleId = generateId();
  const oneMonthAhead = now + 30 * 24 * 60 * 60 * 1000;
  await sql`
    INSERT INTO exam_schedules (
      id, exam_id, schedule_type, title, target_group, start_time, end_time, duration_minutes, is_active, created_at
    ) VALUES (
      ${scheduleId},
      ${examId},
      'group',
      'جدولة اختبار أساسيات أدوية التخدير - الدفعة العامة',
      'عام',
      ${now - 60000},
      ${oneMonthAhead},
      30,
      1,
      ${now}
    )
  `;

  // Assign to all students
  const students = await sql`SELECT id FROM users WHERE role = 'student'`;
  for (const st of students) {
    const assignId = generateId();
    await sql`
      INSERT INTO exam_assignments (
        id, exam_id, schedule_id, user_id, assigned_start_time, assigned_end_time, duration_minutes, status, created_at
      ) VALUES (
        ${assignId},
        ${examId},
        ${scheduleId},
        ${st.id},
        ${now - 60000},
        ${oneMonthAhead},
        30,
        'assigned',
        ${now}
      )
    `;
  }

  console.log(`Successfully added all ${rawQuestions.length} questions and scheduled the exam for ${students.length} students!`);
}

seedExam().catch(console.error);
