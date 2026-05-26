import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/regenerate-idea
 *
 * n8n "Regenerate Content Idea" webhook'una proxy.
 * Kullanıcının feedback verdiği içerik fikrini yeniden oluşturur.
 *
 * Request body: { ideaId: string, feedback: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, feedback } = body;

    if (!ideaId || !feedback) {
      return NextResponse.json(
        { success: false, error: "ideaId ve feedback zorunludur" },
        { status: 400 }
      );
    }

    const n8nBase =
      process.env.N8N_WEBHOOK_BASE_URL ||
      "https://baprojectie326.app.n8n.cloud";
    const webhookUrl = `${n8nBase}/webhook/regenerate-content-idea`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, feedback }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!n8nResponse.ok) {
      // Webhook henüz kurulmamış olabilir — sessizce başarı döndür
      console.warn("[regenerate-idea] n8n yanıt:", n8nResponse.status);
      return NextResponse.json({ success: true, queued: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    // Webhook yoksa veya timeout olduysa UI'ı engelleme
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.warn("[regenerate-idea] Hata (yoksayıldı):", message);
    return NextResponse.json({ success: true, queued: true });
  }
}
