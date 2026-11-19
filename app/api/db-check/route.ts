import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = process.env.DATABASE_API_URL;
  const apiSecret = process.env.DATABASE_API_SECRET;

  if (!apiUrl || !apiSecret) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing environment variables",
        details: {
          DATABASE_API_URL: apiUrl ? "SET" : "MISSING",
          DATABASE_API_SECRET: apiSecret ? "SET" : "MISSING",
        },
        message:
          "يرجى ضبط متغيرات البيئة DATABASE_API_URL و DATABASE_API_SECRET في بيئة Vercel أو ملف .env",
      },
      { status: 500 }
    );
  }

  try {
    const cleanUrl = apiUrl.replace(/\/+$/, "");
    const targetEndpoint = cleanUrl.endsWith("/api/db-check")
      ? cleanUrl
      : `${cleanUrl}/api/db-check`;

    const response = await fetch(targetEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiSecret}`,
        "Content-Type": "application/json",
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          error: "Cloudflare Worker returned an error",
          workerResponse: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم التحقق من الاتصال بقاعدة بيانات Cloudflare D1 عبر Worker بنجاح!",
      d1Status: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "فشل الوصول إلى Cloudflare Worker",
        details: err?.message,
      },
      { status: 502 }
    );
  }
}
