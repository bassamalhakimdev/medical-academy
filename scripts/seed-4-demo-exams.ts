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

interface ChoiceItem {
  text: string;
  isCorrect: boolean;
}

interface QuestionItem {
  text: string;
  points: number;
  explanation: string;
  choices: ChoiceItem[];
}

interface ExamItem {
  title: string;
  description: string;
  durationMinutes: number;
  passPercentage: number;
  questions: QuestionItem[];
}

const newExams: ExamItem[] = [
  {
    title: "مراقبة العلامات الحيوية وتخطيط القلب أثناء التخدير (Intraoperative Monitoring & ECG)",
    description: "اختبار تجريبي سريع لتقييم مهارات مراقبة الدورة الدموية، تخطيط القلب الكهربائي، وقراءات مخطط غاز ثاني أكسيد الكربون (Capnography).",
    durationMinutes: 10,
    passPercentage: 70,
    questions: [
      {
        text: "ما هو التفسير السريري الأكثر ترجيحاً للهبوط المفاجئ والسريع لمنحنى قياس غاز ثاني أكسيد الكربون (End-Tidal CO2) إلى الصفر أثناء التهوية الآلية؟",
        points: 1,
        explanation: "الانخفاض المفاجئ التام لمستوى الـ ETCO2 إلى الصفر يشير إلى توقف تدفق الغاز الرئوي نحو الجهاز، وأشهر أسبابه انقطاع وصلة دارة التخدير أو خلع أنبوب التنبيب الرغامي (Accidental Extubation) أو توقف القلب الحاد.",
        choices: [
          { text: "انقطاع التوصيل الرغامي أو خلع أنبوب التنبيب (Accidental Extubation)", isCorrect: true },
          { text: "ارتفاع درجة حرارة المريض المفاجئ (Hyperthermia)", isCorrect: false },
          { text: "زيادة النتاج القلبي السريع", isCorrect: false },
          { text: "انسداد جزئي طفيف في مجرى اللعاب", isCorrect: false },
        ],
      },
      {
        text: "في مراقبة تخطيط القلب الكهربائي (ECG) القياسي داخل غرفة العمليات، أي اتجاه (Lead) يُعتبر الأكثر حساسية للكشف عن اضطرابات النظم ونقص تروية الجدار السفلي؟",
        points: 1,
        explanation: "الاتجاه الثاني (Lead II) يوازي المحور الكهربائي الرئيسي للأذينين والبطينين، مما يجعله الأمثل لرؤية موجة P وتشخيص اضطرابات النظم، وتحري نقص التروية في الشريان الإكليلي الأيمن والجدار السفلي.",
        choices: [
          { text: "الاتجاه الثاني (Lead II)", isCorrect: true },
          { text: "الاتجاه الأول (Lead I)", isCorrect: false },
          { text: "الاتجاه المعزول (Lead aVR)", isCorrect: false },
          { text: "الاتجاه الصدري الخامس (Lead V5)", isCorrect: false },
        ],
      },
    ],
  },
  {
    title: "إنعاش السوائل ونقل الدم في العمليات الجراحية (Fluid Resuscitation & Transfusion)",
    description: "اختبار تجريبي يركز على توازن السوائل، محاليل التبلور والغرائيات، وتدبير نقل الدم الكتلي ومضاعفاته.",
    durationMinutes: 10,
    passPercentage: 70,
    questions: [
      {
        text: "ما هي النسبة الموصى بها في بروتوكول نقل الدم الكتلي (Massive Transfusion Protocol - MTP) لمكونات (الدم المكدس pRBCs : البلازما الطازجة FFP : الصفائح Platelets) للحد من اعتلال التخثر؟",
        points: 1,
        explanation: "توصي بروتوكولات الإنعاش الهجومي ونقل الدم الكتلي بنسبة متوازنة 1:1:1 لمحاكاة تكوين الدم الكامل والوقاية من اعتلال التخثر التخفيفي القاتل لدى مرضى النزف الحاد.",
        choices: [
          { text: "1:1:1 (وحدة دم مكدس : وحدة بلازما : وحدة صفائح)", isCorrect: true },
          { text: "4:1:1 (أربع وحدات دم مكدس : وحدة بلازما : وحدة صفائح)", isCorrect: false },
          { text: "6:2:1 (ست وحدات دم مكدس : وحدتا بلازما : وحدة صفائح)", isCorrect: false },
          { text: "2:1:0 (وحدتا دم مكدس : وحدة بلازما دون صفائح)", isCorrect: false },
        ],
      },
      {
        text: "ما هو الاضطراب الإلكتروليتي الأكثر حدوثاً والمهدد للحياة الناتج عن نقل كميات كبيرة وسريعة من الدم المحفوظ بمادة السترات (Citrate Toxicity)؟",
        points: 1,
        explanation: "ترتبط مادة السترات الحافظة لأكياس الدم بالكالسيوم المتأين في دم المريض مسببة هبوطاً حاداً في الكالسيوم المتأين (Hypocalcemia)، مما قد يسبب هبوط النتاج القلبي والضغط وتطاول فترة QT.",
        choices: [
          { text: "نقص كالسيوم الدم المتأين الحاد (Hypocalcemia)", isCorrect: true },
          { text: "فرط كالسيوم الدم الشديد (Hypercalcemia)", isCorrect: false },
          { text: "فرط فوسفات الدم الحاد", isCorrect: false },
          { text: "نقص بوتاسيوم الدم المزمن", isCorrect: false },
        ],
      },
    ],
  },
  {
    title: "التخدير في طب التوليد وجراحة الأطفال (Obstetric & Pediatric Anesthesia)",
    description: "اختبار تقييمي سريع حول خصوصية التخدير لدى الحوامل والتغيرات الفسيولوجية، بالإضافة لتدبير مجرى الهواء للأطفال.",
    durationMinutes: 10,
    passPercentage: 70,
    questions: [
      {
        text: "لماذا يتم وضع الحامل في الثلث الثالث من الحمل بميلان جانبي أيسر (Left Lateral Tilt) بزاوية 15 درجة على طاولة العمليات؟",
        points: 1,
        explanation: "ضغط الرحم الحامل في وضعية الاستلقاء الظهري التام على الوريد الأجوف السفلي والأبهر يقلل العود الوريدي والنتاج القلبي بشدة، والميلان الجانبي الأيسر يزيح الرحم ويمنع متلازمة انضغاط الأوعية الكبرى.",
        choices: [
          { text: "لمنع متلازمة انضغاط الوريد الأجوف السفلي والشريان الأبهر (Aortocaval Compression)", isCorrect: true },
          { text: "لتسهيل إعطاء المخدر الوريدي فقط", isCorrect: false },
          { text: "لتسريع امتصاص أدوية التخدير الموضعي في الحبل الشوكي", isCorrect: false },
          { text: "لزيادة الضغط داخل المعدة لمنع الارتجاع", isCorrect: false },
        ],
      },
      {
        text: "ما هي أضيق نقطة تشريحية وظيفية في مجرى الهواء العلوي لدى الرضيع والطفل دون سن الثامنة؟",
        points: 1,
        explanation: "حنجرة الرضيع قمعية الشكل (Funnel-shaped) وتعتبر منطقة الغضروف الحلقي (Cricoid Ring) هي أضيق منطقة دائرية متكاملة غير قابلة للتمدد، بخلاف البالغين حيث أضيق نقطة هي فتحة المزمار.",
        choices: [
          { text: "منطقة الغضروف الحلقي (Cricoid Ring / Subglottic)", isCorrect: true },
          { text: "الحبال الصوتية الحقيقية (Vocal Cords)", isCorrect: false },
          { text: "لسان المزمار (Epiglottis)", isCorrect: false },
          { text: "البلعوم الفموي (Oropharynx)", isCorrect: false },
        ],
      },
    ],
  },
  {
    title: "طب الألم والتخدير الموضعي الموجه بالأمواج فوق الصوتية (Pain Management & Ultrasound Blocks)",
    description: "اختبار تجريبي لتشخيص وتسكين الألم الحاد، والمبادئ الأساسية لاستخدام السونار في حصارات الأعصاب الطرفية.",
    durationMinutes: 10,
    passPercentage: 70,
    questions: [
      {
        text: "عند إجراء حصار الضفيرة العضدية بين الأخمعيات (Interscalene Brachial Plexus Block)، ما هو الأثر الجانبي الحتمي الأكثر حدوثاً في نفس جهة الحقن؟",
        points: 1,
        explanation: "شلل العصب الحجابي المؤقت في نفس الجهة (Ipsilateral Phrenic Nerve Palsy) يحدث بنسبة تقارب 100% نتيجة قرب العصب الحجابي من الحزمة العصبية على العضلة الأخمعية الأمامية، مؤدياً لشلل نصفي مؤقت بالحجاب الحاجز.",
        choices: [
          { text: "شلل العصب الحجابي المؤقت وشلل نصف الحجاب الحاجز في جهة الحقن (Phrenic Palsy)", isCorrect: true },
          { text: "استرواح الصدر التوتري الحاد في جميع الحالات", isCorrect: false },
          { text: "شلل دائم في العصب الوجهي القحفي", isCorrect: false },
          { text: "فقدان السمع الحسي العصبي", isCorrect: false },
        ],
      },
      {
        text: "أي من المخدرات الموضعية التالية يتميز بأعلى درجة من السمية القلبية الحادة (Cardiotoxicity) وصعوبة الإنعاش عند حقنه الوريدي العرضي؟",
        points: 1,
        explanation: "البوبيفاكايين (Bupivacaine) يتميز بقابلية عالية للذوبان في الدهون وارتباط بطيء الانفكاك بقنوات الصوديوم القلبية السريعة، مما يجعله أكثر سمية لعضلة القلب وصعب الإنعاش عند حدوث LAST.",
        choices: [
          { text: "بوبيفاكايين (Bupivacaine)", isCorrect: true },
          { text: "ليدوكايين (Lidocaine)", isCorrect: false },
          { text: "بريلوكايين (Prilocaine)", isCorrect: false },
          { text: "ميفيباكايين (Mepivacaine)", isCorrect: false },
        ],
      },
    ],
  },
];

async function run() {
  console.log("🚀 Starting seeding 4 demo exams...");

  const now = Date.now();
  const oneMonthAhead = now + 30 * 24 * 60 * 60 * 1000;

  // 1. Get or confirm admin user
  const adminUsers = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
  const adminId = adminUsers.length > 0 ? adminUsers[0].id : null;

  // 2. Clean up any broken test exams if they exist
  await sql`DELETE FROM exams WHERE title = 'رززرزبنب'`;

  // 3. Get all students
  const students = await sql`SELECT id FROM users WHERE role = 'student'`;
  console.log(`Found ${students.length} students to assign exams to.`);

  for (let eIdx = 0; eIdx < newExams.length; eIdx++) {
    const examData = newExams[eIdx];

    // Check if this exam title already exists to avoid duplicates
    const existing = await sql`SELECT id FROM exams WHERE title = ${examData.title}`;
    if (existing.length > 0) {
      console.log(`ℹ️ Exam "${examData.title}" already exists. Skipping.`);
      continue;
    }

    const examId = generateId();

    // Insert Exam
    await sql`
      INSERT INTO exams (
        id, title, description, status, total_questions, pass_percentage,
        duration_minutes, shuffle_questions, shuffle_choices, show_results_immediately,
        allow_review_answers, created_by, created_at, updated_at
      ) VALUES (
        ${examId},
        ${examData.title},
        ${examData.description},
        'published',
        ${examData.questions.length},
        ${examData.passPercentage},
        ${examData.durationMinutes},
        1,
        1,
        1,
        1,
        ${adminId},
        ${now},
        ${now}
      )
    `;

    // Insert Questions & Choices
    for (let qIdx = 0; qIdx < examData.questions.length; qIdx++) {
      const q = examData.questions[qIdx];
      const questionId = generateId();

      await sql`
        INSERT INTO questions (
          id, exam_id, question_text, points, explanation, order_index, created_at
        ) VALUES (
          ${questionId},
          ${examId},
          ${q.text},
          ${q.points},
          ${q.explanation},
          ${qIdx + 1},
          ${now}
        )
      `;

      for (let cIdx = 0; cIdx < q.choices.length; cIdx++) {
        const c = q.choices[cIdx];
        const choiceId = generateId();

        await sql`
          INSERT INTO choices (
            id, question_id, choice_text, is_correct, order_index
          ) VALUES (
            ${choiceId},
            ${questionId},
            ${c.text},
            ${c.isCorrect ? 1 : 0},
            ${cIdx + 1}
          )
        `;
      }
    }

    // Schedule the exam
    const scheduleId = generateId();
    await sql`
      INSERT INTO exam_schedules (
        id, exam_id, schedule_type, title, target_group, start_time, end_time, duration_minutes, is_active, created_at
      ) VALUES (
        ${scheduleId},
        ${examId},
        'group',
        ${`جدولة تجريبية: ${examData.title}`},
        'all',
        ${now - 60 * 1000},
        ${oneMonthAhead},
        ${examData.durationMinutes},
        1,
        ${now}
      )
    `;

    // Assign to all students
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
          ${now - 60 * 1000},
          ${oneMonthAhead},
          ${examData.durationMinutes},
          'assigned',
          ${now}
        )
      `;
    }

    console.log(`✅ Exam [${eIdx + 1}/4] inserted & scheduled: "${examData.title}" (2 Questions)`);
  }

  console.log("🎉 All 4 ready-made demo exams have been successfully created!");
}

run().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
