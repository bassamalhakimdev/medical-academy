import { getDb, getRawSqlite } from "./index";
import { users, exams, questions, choices, examSchedules, examAssignments, examAttempts, studentAnswers, results } from "./schema";
import bcrypt from "bcryptjs";

// Fallback UUID generator if crypto uuid isn't available
function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function seedDatabase() {
  const db = getDb();
  const sqlite = getRawSqlite();

  console.log("🌱 Starting database seeding...");

  // Check if admin already exists
  const existingAdmin = sqlite.prepare("SELECT id FROM users WHERE email = ?").get("admin@anesthesia-academy.com");
  if (existingAdmin) {
    console.log("ℹ️ Database is already seeded.");
    return;
  }

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  // Passwords
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const studentPasswordHash = await bcrypt.hash("StudentPass123!", 10);

  // 1. Insert Users
  const adminId = generateId();
  const student1Id = generateId();
  const student2Id = generateId();
  const student3Id = generateId();
  const student4Id = generateId();

  await db.insert(users).values([
    {
      id: adminId,
      name: "د. طارق الحكيم",
      email: "admin@anesthesia-academy.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      isActive: true,
      studentId: "ADMIN-01",
      phone: "+966500000001",
      groupTag: "الإدارة الأكاديمية",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: student1Id,
      name: "د. أحمد سامي الزهراني",
      email: "ahmed.zahrani@anesthesia-academy.com",
      passwordHash: studentPasswordHash,
      role: "student",
      isActive: true,
      studentId: "ANES-2026-001",
      phone: "+966501112233",
      groupTag: "دفعة 2026 - المقيمين (R1)",
      createdAt: now - 30 * oneDay,
      updatedAt: now,
    },
    {
      id: student2Id,
      name: "د. سارة خالد المنصور",
      email: "sara.mansoor@anesthesia-academy.com",
      passwordHash: studentPasswordHash,
      role: "student",
      isActive: true,
      studentId: "ANES-2026-002",
      phone: "+966502223344",
      groupTag: "دفعة 2026 - المقيمين (R1)",
      createdAt: now - 28 * oneDay,
      updatedAt: now,
    },
    {
      id: student3Id,
      name: "د. عمر عبد العزيز القحطاني",
      email: "omar.qahtani@anesthesia-academy.com",
      passwordHash: studentPasswordHash,
      role: "student",
      isActive: true,
      studentId: "ANES-2026-003",
      phone: "+966503334455",
      groupTag: "دفعة 2026 - المقيمين (R1)",
      createdAt: now - 25 * oneDay,
      updatedAt: now,
    },
    {
      id: student4Id,
      name: "د. ريم محمد الدوسري",
      email: "reem.dosari@anesthesia-academy.com",
      passwordHash: studentPasswordHash,
      role: "student",
      isActive: true,
      studentId: "ANES-2025-015",
      phone: "+966504445566",
      groupTag: "دفعة 2025 - زمالة التخدير (R2)",
      createdAt: now - 40 * oneDay,
      updatedAt: now,
    },
  ]);

  console.log("✅ Users created (1 Admin + 4 Students).");

  // 2. Exam 1: Airway Management & General Anesthesia
  const exam1Id = generateId();
  await db.insert(exams).values({
    id: exam1Id,
    title: "التقييم قبل التخدير وإدارة المجرى الهوائي المتقدم",
    description: "اختبار تخصصي في علوم التخدير يركز على تصنيف المجرى الهوائي الصعب، خوارزميات التنبيب الرغامي، وأدوية التحريض التخديري وتدبير فرط الحرارة الخبيث.",
    status: "published",
    totalQuestions: 6,
    passPercentage: 70,
    durationMinutes: 20,
    shuffleQuestions: true,
    shuffleChoices: true,
    showResultsImmediately: true,
    allowReviewAnswers: true,
    createdBy: adminId,
    createdAt: now - 10 * oneDay,
    updatedAt: now - 10 * oneDay,
  });

  const exam1QuestionsData = [
    {
      text: "في تصنيف مالامباتي (Mallampati Classification) لتقييم المجرى الهوائي، عندما تكون الرؤية مقتصرة فقط على الحنك الرخو وقاعدة اللهاة دون رؤية اللوزتين أو الجدار الخلفي للبلعوم، ما هو التصنيف الدقيق؟",
      points: 1,
      explanation: "تصنيف مالامباتي الفئة الثالثة (Class III) يتميز برؤية الحنك الرخو وقاعدة اللهاة فقط، وهو مؤشر قوي على احتمالية صعوبة التنبيب الرغامي بالتنظير الحنجري المباشر.",
      choices: [
        { text: "الفئة الأولى (Class I)", isCorrect: false },
        { text: "الفئة الثانية (Class II)", isCorrect: false },
        { text: "الفئة الثالثة (Class III)", isCorrect: true },
        { text: "الفئة الرابعة (Class IV)", isCorrect: false },
      ],
    },
    {
      text: "ما هو العقار المضاد النوعي (Specific Antidote) المعتمد لعلاج أزمة فرط الحرارة الخبيث (Malignant Hyperthermia Crisis) والجرعة الأولية الموصى بها وريدياً؟",
      points: 1,
      explanation: "عقار دانترولين الصوديوم (Dantrolene sodium) بجرعة أولية 2.5 ملغ/كغ وريدياً سريعاً هو العلاج المنقذ للحياة؛ حيث يثبط تحرر الكالسيوم من الشبكة الساركوبلازمية عبر مستقبلات الريانودين (RYR1).",
      choices: [
        { text: "دانترولين (Dantrolene) بجرعة 2.5 ملغ/كغ", isCorrect: true },
        { text: "نيوستغمين (Neostigmine) بجرعة 0.05 ملغ/كغ", isCorrect: false },
        { text: "سوجاماديكس (Sugammadex) بجرعة 16 ملغ/كغ", isCorrect: false },
        { text: "بيكربونات الصوديوم بجرعة 1 ملمول/كغ", isCorrect: false },
      ],
    },
    {
      text: "أي من الحالات التالية يعتبر مضاد استطباب مطلق (Absolute Contraindication) لاستخدام مرخي العضلات سكسينيل كولين (Succinylcholine / Suxamethonium) بعد مرور 24 ساعة على الإصابة؟",
      points: 1,
      explanation: "تسبب الحروق الشديدة والرضوض الهرسية وإصابات الحبل الشوكي بعد 24-48 ساعة تكاثراً واسعاً لمستقبلات الأسيتيل كولين خارج المشبك (Extrajunctional AChRs)، مما يؤدي إلى فرط بوتاسيوم الدم الحاد والمهدد للحياة عند إعطاء السكسينيل كولين.",
      choices: [
        { text: "الربو القصبي الحاد", isCorrect: false },
        { text: "الحروق الواسعة أو الرضوض الهرسية الحادة بعد 48 ساعة", isCorrect: true },
        { text: "ارتفاع الضغط الشرياني المعتدل", isCorrect: false },
        { text: "قصور الغدة الدرقية المستقر", isCorrect: false },
      ],
    },
    {
      text: "وفقاً لإرشادات جمعية المجرى الهوائي الصعب (DAS Guidelines)، في حالة الفشل في التنبيب الرغامي وفشل التهوية بالقناع (Cannot Intubate, Cannot Oxygenate - CICO)، ما هي الخطوة الحاسمة الأولى في الخطة (Plan D)؟",
      points: 1,
      explanation: "في حالة CICO، يجب فوراً الانتقال إلى المجرى الهوائي الجراحي الطارئ عبر الغشاء الحلقي الدرقي (Emergency Front of Neck Access - eFONA / Cricothyroidotomy) لإنقاذ حياة المريض من نقص الأكسجة المميت.",
      choices: [
        { text: "محاولة تنبيب أخرى باستخدام منظار الحنجرة المباشر", isCorrect: false },
        { text: "المجرى الهوائي الجراحي المفتوح عبر الرقبة (Emergency Front of Neck Access - eFONA)", isCorrect: true },
        { text: "إعطاء جرعة إضافية من الفينتانيل ومحاولة التهوية", isCorrect: false },
        { text: "إيقاف العملية فوراً وإيقاظ المريض", isCorrect: false },
      ],
    },
    {
      text: "ما هي الميزة الفسيولوجية الأساسية لعقار إيتوميدات (Etomidate) في الحث التخديري مقارنة بالبروبوفول؟",
      points: 1,
      explanation: "يتميز الإيتوميدات باستقرار ديناميكي دموي ملحوظ (Hemodynamic stability) مع تأثير ضئيل جداً على الضغط الشرياني والنتاج القلبي، مما يجعله مثالياً لمرضى الصدمة وقصور القلب.",
      choices: [
        { text: "تسكين ألم قوي ومستمر", isCorrect: false },
        { text: "استقرار الدورة الدموية وقلة تثبيط عضلة القلب والضغط", isCorrect: true },
        { text: "توسيع القصبات الهوائية بشكل مماثل للكيتامين", isCorrect: false },
        { text: "انعدام أي تأثير على إفراز الكورتيزول الكظري", isCorrect: false },
      ],
    },
    {
      text: "في مناورة سيليك (Sellick's maneuver) أثناء التحريض التخديري سريع التسلسل (RSI)، أين يطبق الضغط المباشر لإغلاق المريء ومنع القلس؟",
      points: 1,
      explanation: "يطبق الضغط الخلفي مباشرة على الغضروف الحلقي (Cricoid Cartilage) لأنه الغضروف الكامل الوحيد دائرياً الذي يضغط المريء ضد الفقرات العنقية خلفه.",
      choices: [
        { text: "الغضروف الدرقي (Thyroid Cartilage)", isCorrect: false },
        { text: "الغضروف الحلقي (Cricoid Cartilage)", isCorrect: true },
        { text: "عظم اللامي (Hyoid Bone)", isCorrect: false },
        { text: "الحلقة الرغامية الثالثة", isCorrect: false },
      ],
    },
  ];

  for (let i = 0; i < exam1QuestionsData.length; i++) {
    const qData = exam1QuestionsData[i];
    const questionId = generateId();
    await db.insert(questions).values({
      id: questionId,
      examId: exam1Id,
      questionText: qData.text,
      points: qData.points,
      explanation: qData.explanation,
      orderIndex: i + 1,
      createdAt: now,
    });

    for (let j = 0; j < qData.choices.length; j++) {
      const cData = qData.choices[j];
      await db.insert(choices).values({
        id: generateId(),
        questionId: questionId,
        choiceText: cData.text,
        isCorrect: cData.isCorrect,
        orderIndex: j + 1,
      });
    }
  }

  // 3. Exam 2: Regional & Neuraxial Anesthesia
  const exam2Id = generateId();
  await db.insert(exams).values({
    id: exam2Id,
    title: "التخدير الناحي والتخدير العصبي المحوري (Spinal & Epidural)",
    description: "اختبار تقييمي في تقنيات التخدير الشوكي وفوق الجافية، تدبير السمية الحادة للمخدرات الموضعية (LAST)، والمستويات الجلدية التخديرية للجراحات المختلفة.",
    status: "published",
    totalQuestions: 5,
    passPercentage: 65,
    durationMinutes: 15,
    shuffleQuestions: true,
    shuffleChoices: true,
    showResultsImmediately: true,
    allowReviewAnswers: true,
    createdBy: adminId,
    createdAt: now - 8 * oneDay,
    updatedAt: now - 8 * oneDay,
  });

  const exam2QuestionsData = [
    {
      text: "ما هو المستوى الجلدي التخديري الحسي (Sensory Dermatome Level) المطلوب تحقيقه لضمان تخدير كافٍ وغير مؤلم لإجراء عملية قيصرية قياسية (Cesarean Section) تحت التخدير الشوكي؟",
      points: 1,
      explanation: "المستوى الحسي T4 (مستوى حلمة الثدي) مطلوب لضمان منع الألم الناتج عن شد الصفاق الرحمي واللمس الجراحي في البطن العلوي.",
      choices: [
        { text: "المستوى T10 (مستوى السرة)", isCorrect: false },
        { text: "المستوى T6 (الناتئ الرهابي)", isCorrect: false },
        { text: "المستوى T4 (مستوى حلمة الثدي)", isCorrect: true },
        { text: "المستوى L1 (الرباط الإربي)", isCorrect: false },
      ],
    },
    {
      text: "في حالة الاشتباه بالتسمم الجهازي بالمخدرات الموضعية (LAST) المترافق مع هبوط حاد في وظائف القلب، ما هو المستحلب الوريدي المنقذ للبروتوكول المعياري؟",
      points: 1,
      explanation: "مستحلب الدهون 20% (Intralipid 20%) بجرعة مبدئية 1.5 مل/كغ وريدياً هو العلاج الأساسي لامتصاص المخدر الموضعي الدهني واستعادة النشاط القلبي.",
      choices: [
        { text: "مستحلب الدهون 20% (Intralipid 20%)", isCorrect: true },
        { text: "محلول الدكستروز 50%", isCorrect: false },
        { text: "محلول الألبومين البشري 5%", isCorrect: false },
        { text: "محلول المانيتول 20%", isCorrect: false },
      ],
    },
    {
      text: "أي من الحالات السريرية التالية تعتبر مضاد استطباب مطلق (Absolute Contraindication) للتخدير العصبي الشوكي (Spinal Anesthesia)؟",
      points: 1,
      explanation: "رفض المريض التام للإجراء، أو وجود اضطراب حاد في تخثر الدم، أو نقص حاد غير مصحح في حجم الدم، أو التهاب نشط في موقع الحقن هي مضادات استطباب مطلقة.",
      choices: [
        { text: "رفض المريض الواعي المستنير أو اعتلال خثري حاد غير معالج", isCorrect: true },
        { text: "تاريخ عائلي لمرض السكري من النمط الثاني", isCorrect: false },
        { text: "إجراء عملية سابقة في الركبة قبل خمس سنوات", isCorrect: false },
        { text: "ارتفاع طفيف في الكولسترول", isCorrect: false },
      ],
    },
    {
      text: "ما هي الآلية الفسيولوجية الأساسية لحدوث الصداع بعد بزل الجافية (Post-Dural Puncture Headache - PDPH)؟",
      points: 1,
      explanation: "تسرب السائل الدماغي الشوكي (CSF) عبر ثقب الجافية يؤدي إلى انخفاض ضغطه وشد الهياكل الحساسة للألم في السحايا والأوعية الدموية الدماغية، ويزداد الصداع في وضعية الوقوف.",
      choices: [
        { text: "انخفاض حجم وضغط السائل الدماغي الشوكي بسبب تسربه عبر ثقب الجافية", isCorrect: true },
        { text: "ارتفاع مفاجئ ومستمر في الضغط داخل الجمجمة", isCorrect: false },
        { text: "تفاعل تحسسي للمادة المخدرة المحقونة", isCorrect: false },
        { text: "تشنج العضلات الرقبية الخلفية فقط", isCorrect: false },
      ],
    },
    {
      text: "في حال حدوث حصار شوكي مرتفع (High Spinal) مترافق مع بطء قلب حاد وهبوط في ضغط الدم، ما هو التفسير الفسيولوجي المباشر؟",
      points: 1,
      explanation: "حصار الألياف الودية القلبية المسرعة (Cardioaccelerator fibers) الصادرة من المستويات النخاعية T1-T4 يزيل التأثير الودي ويؤدي إلى بطء القلب الحاد وهبوط المقاومة الوعائية الجهازية.",
      choices: [
        { text: "تثبيط الألياف الودية القلبية المسرعة (T1-T4) وتوسع الأوعية المحيطية الشديد", isCorrect: true },
        { text: "تحفيز زائد للعصب المبهم ناجم عن ألم المعدة", isCorrect: false },
        { text: "تسمم دوائي بالباراسيتامول الوريدي", isCorrect: false },
        { text: "انسداد الشريان الرئوي الخثاري الحاد", isCorrect: false },
      ],
    },
  ];

  for (let i = 0; i < exam2QuestionsData.length; i++) {
    const qData = exam2QuestionsData[i];
    const questionId = generateId();
    await db.insert(questions).values({
      id: questionId,
      examId: exam2Id,
      questionText: qData.text,
      points: qData.points,
      explanation: qData.explanation,
      orderIndex: i + 1,
      createdAt: now,
    });

    for (let j = 0; j < qData.choices.length; j++) {
      const cData = qData.choices[j];
      await db.insert(choices).values({
        id: generateId(),
        questionId: questionId,
        choiceText: cData.text,
        isCorrect: cData.isCorrect,
        orderIndex: j + 1,
      });
    }
  }

  // 4. Exam 3: Pharmacology & Clinical Hemodynamics
  const exam3Id = generateId();
  await db.insert(exams).values({
    id: exam3Id,
    title: "علم أدوية التخدير وحركيات الغازات الاستنشاقية",
    description: "مفاهيم التركيز السنخي الأصغري (MAC)، حركيات السيفوفلوران والدسفلوران، وانعكاس الحصار العضلي بسوجاماديكس.",
    status: "draft",
    totalQuestions: 4,
    passPercentage: 60,
    durationMinutes: 15,
    shuffleQuestions: true,
    shuffleChoices: true,
    showResultsImmediately: true,
    allowReviewAnswers: true,
    createdBy: adminId,
    createdAt: now - 5 * oneDay,
    updatedAt: now - 5 * oneDay,
  });

  const exam3QuestionsData = [
    {
      text: "ما هو التعريف الدقيق للتركيز السنخي الأصغري (Minimum Alveolar Concentration - MAC)؟",
      points: 1,
      explanation: "الـ MAC هو تركيز المخدر الاستنشاقي في الحويصلات الهوائية عند ضغط جوي واحد الذي يمنع الحركة استجابة لشق جراحي معياري لدى 50% من المرضى.",
      choices: [
        { text: "تركيز المخدر الذي يمنع الاستجابة الحركية لشق جراحي لدى 50% من المرضى", isCorrect: true },
        { text: "تركيز المخدر الذي يسبب فقدان الوعي لدى 99% من المرضى", isCorrect: false },
        { text: "الجرعة القاتلة لـ 50% من حيوانات التجارب", isCorrect: false },
        { text: "أقل تركيز يحدث تثبيطاً لتخطيط الدماغ الكهربائي", isCorrect: false },
      ],
    },
    {
      text: "عقار سوجاماديكس (Sugammadex) يعاكس تأثير مرخيات العضلات الستيرويدية مثل الروكورونيوم من خلال أي آلية؟",
      points: 1,
      explanation: "السوجاماديكس هو جزيء سايكلوديكسترين حلقي معدل يغلف جزيء الروكورونيوم بنسبة 1:1 في البلازما (Direct encapsulation chelator) ويمنع ارتباطه بمستقبلات النيكوتين.",
      choices: [
        { text: "التغليف الكيميائي المباشر (Direct encapsulation) لجزيئات الروكورونيوم في البلازما", isCorrect: true },
        { text: "تثبيط إنزيم أستيل كولين إستراز وزيادة تركيز الأستيل كولين في المشبك", isCorrect: false },
        { text: "تنشيط مستقبلات الكولين المسكارينية في القلب", isCorrect: false },
        { text: "تحفيز إفراز الكالسيوم داخل الخلية العضلية", isCorrect: false },
      ],
    },
    {
      text: "أي من الغازات الاستنشاقية التالية يتميز بأقل معامل ذوبان في الدم:الغاز (Blood:Gas Partition Coefficient)، مما يمنحه سرعة استيقاظ فائقة؟",
      points: 1,
      explanation: "غاز الدسفلوران (Desflurane) يمتلك معامل ذوبان في الدم:الغاز يبلغ حوالي 0.42، وهو الأقل بين الغازات الهالوجينية الحديثة، مما يجعله الأسرع في الإفاقة.",
      choices: [
        { text: "دسفلوران (Desflurane)", isCorrect: true },
        { text: "آيزوفلوران (Isoflurane)", isCorrect: false },
        { text: "هالو Microhalothane", isCorrect: false },
        { text: "سيفوفلوران (Sevoflurane)", isCorrect: false },
      ],
    },
    {
      text: "متلازمة التسريب المستمر للبروبوفول (Propofol Infusion Syndrome - PRIS) ترتبط عموماً بـ:",
      points: 1,
      explanation: "ترتبط PRIS بجرعات عالية من البروبوفول (> 4-5 ملغ/كغ/ساعة) لفترات ممتدة تزيد عن 48 ساعة، وتتجلى بحماض استقلابي عنيف وانحلال عضلي وهبوط قلب.",
      choices: [
        { text: "تسريب جرعات تفوق 4-5 ملغ/كغ/ساعة لمدة تزيد عن 48 ساعة مع حماض استقلابي وانحلال رُبيدات", isCorrect: true },
        { text: "إعطاء جرعة بلعة واحدة 2 ملغ/كغ عند الحث", isCorrect: false },
        { text: "استخدام البروبوفول مع المضادات الحيوية فقط", isCorrect: false },
        { text: "الاستيقاظ المبكر خلال 10 دقائق من العملية", isCorrect: false },
      ],
    },
  ];

  for (let i = 0; i < exam3QuestionsData.length; i++) {
    const qData = exam3QuestionsData[i];
    const questionId = generateId();
    await db.insert(questions).values({
      id: questionId,
      examId: exam3Id,
      questionText: qData.text,
      points: qData.points,
      explanation: qData.explanation,
      orderIndex: i + 1,
      createdAt: now,
    });

    for (let j = 0; j < qData.choices.length; j++) {
      const cData = qData.choices[j];
      await db.insert(choices).values({
        id: generateId(),
        questionId: questionId,
        choiceText: cData.text,
        isCorrect: cData.isCorrect,
        orderIndex: j + 1,
      });
    }
  }

  // 5. Schedules (Group & Individual)
  // Schedule 1: Group Schedule for Exam 1 (Active right now! From 2 hours ago to 24 hours later)
  const schedule1Id = generateId();
  await db.insert(examSchedules).values({
    id: schedule1Id,
    examId: exam1Id,
    scheduleType: "group",
    title: "الاختبار الدوري الأول - دفعة المقيمين 2026",
    targetGroup: "دفعة 2026 - المقيمين (R1)",
    startTime: now - 2 * oneHour,
    endTime: now + 24 * oneHour,
    durationMinutes: 20,
    isActive: true,
    createdAt: now - 2 * oneHour,
  });

  // Assign Schedule 1 to student1, student2, student3
  const assignment1Student1 = generateId();
  await db.insert(examAssignments).values([
    {
      id: assignment1Student1,
      examId: exam1Id,
      scheduleId: schedule1Id,
      userId: student1Id,
      assignedStartTime: now - 2 * oneHour,
      assignedEndTime: now + 24 * oneHour,
      durationMinutes: 20,
      status: "completed", // Student 1 already completed it to give realistic stats!
      createdAt: now - 2 * oneHour,
    },
    {
      id: generateId(),
      examId: exam1Id,
      scheduleId: schedule1Id,
      userId: student2Id,
      assignedStartTime: now - 2 * oneHour,
      assignedEndTime: now + 24 * oneHour,
      durationMinutes: 20,
      status: "assigned", // Student 2 has it available right now to take!
      createdAt: now - 2 * oneHour,
    },
    {
      id: generateId(),
      examId: exam1Id,
      scheduleId: schedule1Id,
      userId: student3Id,
      assignedStartTime: now - 2 * oneHour,
      assignedEndTime: now + 24 * oneHour,
      durationMinutes: 20,
      status: "assigned", // Student 3 has it available!
      createdAt: now - 2 * oneHour,
    },
  ]);

  // Schedule 2: Upcoming Group Schedule for Exam 2 (Starts tomorrow)
  const schedule2Id = generateId();
  await db.insert(examSchedules).values({
    id: schedule2Id,
    examId: exam2Id,
    scheduleType: "group",
    title: "التقييم الشهري للتخدير الناحي - جميع المقيمين",
    targetGroup: "all",
    startTime: now + 24 * oneHour,
    endTime: now + 48 * oneHour,
    durationMinutes: 15,
    isActive: true,
    createdAt: now,
  });

  // Schedule 3: Individual Schedule for Student 4 (Custom schedule)
  const schedule3Id = generateId();
  await db.insert(examSchedules).values({
    id: schedule3Id,
    examId: exam2Id,
    scheduleType: "individual",
    title: "اختبار تعويضي فردي - د. ريم الدوسري",
    targetUserId: student4Id,
    startTime: now - 1 * oneHour,
    endTime: now + 12 * oneHour,
    durationMinutes: 25, // custom independent duration!
    isActive: true,
    createdAt: now - 1 * oneHour,
  });

  await db.insert(examAssignments).values({
    id: generateId(),
    examId: exam2Id,
    scheduleId: schedule3Id,
    userId: student4Id,
    assignedStartTime: now - 1 * oneHour,
    assignedEndTime: now + 12 * oneHour,
    durationMinutes: 25,
    status: "assigned",
    createdAt: now - 1 * oneHour,
  });

  // 6. Historical completed attempt and result for Student 1 on Exam 1
  const attempt1Id = generateId();
  const qListExam1 = sqlite.prepare("SELECT id FROM questions WHERE exam_id = ? ORDER BY order_index ASC").all(exam1Id) as { id: string }[];
  const qIds = qListExam1.map(q => q.id);

  const attemptStartTime = now - 90 * 60 * 1000;
  const attemptSubmitTime = attemptStartTime + 14 * 60 * 1000; // 14 minutes taken

  await db.insert(examAttempts).values({
    id: attempt1Id,
    examId: exam1Id,
    scheduleId: schedule1Id,
    assignmentId: assignment1Student1,
    userId: student1Id,
    startTime: attemptStartTime,
    maxEndTime: attemptStartTime + 20 * 60 * 1000,
    submitTime: attemptSubmitTime,
    status: "graded",
    questionOrder: JSON.stringify(qIds),
    choiceOrders: JSON.stringify({}),
    createdAt: attemptStartTime,
  });

  // Record student answers for Student 1 (Got 5 out of 6 correct!)
  let correctCount = 0;
  for (let idx = 0; idx < qIds.length; idx++) {
    const qId = qIds[idx];
    const qChoices = sqlite.prepare("SELECT id, is_correct FROM choices WHERE question_id = ?").all(qId) as { id: string; is_correct: number }[];
    const correctChoice = qChoices.find(c => c.is_correct === 1);
    const incorrectChoice = qChoices.find(c => c.is_correct === 0);

    // Make question #3 incorrect, rest correct
    const isThisCorrect = idx !== 2;
    const chosenChoiceId = isThisCorrect ? (correctChoice?.id || qChoices[0].id) : (incorrectChoice?.id || qChoices[0].id);

    if (isThisCorrect) correctCount++;

    await db.insert(studentAnswers).values({
      id: generateId(),
      attemptId: attempt1Id,
      questionId: qId,
      selectedChoiceId: chosenChoiceId,
      isCorrect: isThisCorrect,
      pointsAwarded: isThisCorrect ? 1 : 0,
      savedAt: attemptStartTime + (idx + 1) * 2 * 60 * 1000,
    });
  }

  // Insert Result for Student 1
  const totalScore = correctCount;
  const maxScore = qIds.length;
  const percentage = Math.round((totalScore / maxScore) * 100);

  await db.insert(results).values({
    id: generateId(),
    attemptId: attempt1Id,
    examId: exam1Id,
    userId: student1Id,
    totalQuestions: maxScore,
    answeredQuestions: maxScore,
    correctAnswers: correctCount,
    totalScore: totalScore,
    maxScore: maxScore,
    percentage: percentage,
    isPassed: percentage >= 70,
    completedAt: attemptSubmitTime,
    feedback: "أداء ممتاز في تدبير المجرى الهوائي والإنعاش التخديري.",
  });

  console.log("✅ Exams, Questions, Schedules, Assignments, Attempts, and Results seeded successfully!");
  console.log("--------------------------------------------------------------------------------");
  console.log("🔑 حساب الإدارة (Admin): admin@anesthesia-academy.com / AdminPassword123!");
  console.log("🎓 حساب الطالب (Student): ahmed.zahrani@anesthesia-academy.com / StudentPass123!");
  console.log("🎓 حساب الطالب (Student 2): sara.mansoor@anesthesia-academy.com / StudentPass123!");
  console.log("--------------------------------------------------------------------------------");
}

// Auto-run if executed directly via CLI
if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}
