import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/weekly-flow
 *
 * n8n "Start Weekly Flow / Personalized Planner" webhook'una proxy görevi görür.
 * CORS sorununu önlemek için istemci tarafı yerine server-side'dan n8n'e istek gönderir.
 *
 * Request body: { userId: string }
 * Response:     { success: boolean, weeklyPlanId?: string, ideasCount?: number, status?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId zorunludur" },
        { status: 400 }
      );
    }

    const n8nBase =
      process.env.N8N_WEBHOOK_BASE_URL ||
      "https://baprojectie326.app.n8n.cloud";
    const webhookUrl = `${n8nBase}/webhook/start-weekly-flow`;

    console.log("[weekly-flow] Calling:", webhookUrl, "userId:", userId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!n8nResponse.ok) {
      let errorText = "";
      try {
        errorText = await n8nResponse.text();
      } catch {
        errorText = "n8n yanıt okunamadı";
      }
      console.error("[weekly-flow] n8n hata:", n8nResponse.status, errorText);
      return NextResponse.json(
        { success: false, error: "Akış başlatılamadı", detail: errorText },
        { status: n8nResponse.status }
      );
    }

    // n8n bazen boş body döner — güvenli parse
    const rawText = await n8nResponse.text();
    let data: Record<string, unknown> = { success: true };
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        // n8n non-JSON cevap verdi, success varsay
        console.warn("[weekly-flow] n8n non-JSON response:", rawText.substring(0, 200));
      }
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[weekly-flow] Sunucu hatası:", message);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası", detail: message },
      { status: 500 }
    );
  }
}
