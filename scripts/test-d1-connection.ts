import fs from "fs";
import path from "path";

// Simple .env parser to read variables without external deps
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

  console.log("🔍 فحص الاتصال بـ Cloudflare D1 عبر Cloudflare Worker...");
  console.log("------------------------------------------------------------");

  const apiUrl = process.env.DATABASE_API_URL;
  const apiSecret = process.env.DATABASE_API_SECRET;

  console.log(`- DATABASE_API_URL:    ${apiUrl ? apiUrl : "❌ غير مضبوط (NOT SET)"}`);
  console.log(`- DATABASE_API_SECRET: ${apiSecret ? "•••••••••••• (SET)" : "❌ غير مضبوط (NOT SET)"}`);
  console.log(`- Database Name:       medical-academy-db`);
  console.log(`- Worker Binding:      DB`);
  console.log("------------------------------------------------------------");

  if (!apiUrl || !apiSecret) {
    console.log("\n⚠️ تنبيه: يرجى وضع الرابط والمفتاح السري في ملف .env بالصيغة التالية:");
    console.log('DATABASE_API_URL="https://your-worker-url.workers.dev"');
    console.log('DATABASE_API_SECRET="your-secret-key"');
    console.log("\nبانتظار تزويد المتغيرات لإجراء الفحص الفعلي.");
    return false;
  }

  const cleanUrl = apiUrl.replace(/\/+$/, "");
  const targetEndpoint = cleanUrl.endsWith("/api/db-check") ? cleanUrl : `${cleanUrl}/api/db-check`;

  console.log(`\n📡 جاري إرسال طلب GET إلى: ${targetEndpoint}`);
  console.log(`🔑 الترويسة: Authorization: Bearer DATABASE_API_SECRET`);

  try {
    const response = await fetch(targetEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiSecret}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    console.log(`\n📥 رمز الاستجابة (Status Code): ${response.status} ${response.statusText}`);
    const text = await response.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
      console.log("📋 محتوى الاستجابة (JSON):", JSON.stringify(json, null, 2));
    } catch {
      console.log("📋 محتوى الاستجابة (Text):", text);
    }

    if (response.ok && (json?.success || response.status === 200)) {
      console.log("\n✅ نجح فحص الاتصال بقاعدة بيانات Cloudflare D1 عبر Worker بنجاح!");
      return true;
    } else {
      console.log("\n❌ فشل فحص الاتصال. يرجى التحقق من صحة الرابط والمفتاح السري وصلاحيات الـ Worker.");
      return false;
    }
  } catch (err: any) {
    console.error("\n❌ حدث خطأ في الاتصال بالشبكة:", err?.message);
    return false;
  }
}

testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});
