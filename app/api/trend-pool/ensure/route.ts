import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/trend-pool/ensure
 *
 * n8n "Weekly Trend Pool Builder" workflow'unun webhook trigger'ına proxy.
 * Body: { niche: string, userId?: string }
 *
 * Trend pool zaten bu hafta için varsa frontend bu route'u çağırmaz.
 * Bu route çağrıldıysa pool eksik → builder tetiklenir, ~60-100sn sürer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche, userId } = body;

    if (!niche || typeof niche !== "string") {
      return NextResponse.json(
        { success: false, error: "niche zorunludur (string)" },
        { status: 400 }
      );
    }

    const n8nBase =
      process.env.N8N_WEBHOOK_BASE_URL ||
      "https://baprojectie326.app.n8n.cloud";
    const webhookUrl = `${n8nBase}/webhook/ensure-trend-pool`;

    console.log("[trend-pool/ensure] Calling:", webhookUrl, "niche:", niche);

    const controller = new AbortController();
    // SerpApi + OpenAI analizi 60-90 saniye sürebilir
    const timeoutId = setTimeout(() => controller.abort(), 150_000);

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, userId }),
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
      console.error(
        "[trend-pool/ensure] n8n hata:",
        n8nResponse.status,
        errorText
      );
      return NextResponse.json(
        {
          success: false,
          error: "Trend pool oluşturulamadı",
          detail: errorText,
        },
        { status: n8nResponse.status }
      );
    }

    const rawText = await n8nResponse.text();
    let data: Record<string, unknown> = { success: true };
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        console.warn(
          "[trend-pool/ensure] n8n non-JSON response:",
          rawText.substring(0, 200)
        );
      }
    }
    return NextResponse.json({ success: true, ...data });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[trend-pool/ensure] Sunucu hatası:", message);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası", detail: message },
      { status: 500 }
    );
  }
}
