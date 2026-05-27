import { NextRequest, NextResponse, after } from "next/server";

/**
 * POST /api/content/generate
 *
 * "Fire-and-forget" stratejisi:
 *  1. n8n webhook'una HTTP POST atar
 *  2. n8n yanıtını BEKLEMEZ, hemen `{ contentId, status: "generating" }` döner
 *  3. Frontend Firestore listener (onSnapshot) ile sonucu bekler
 *
 * Bu yaklaşımla Vercel serverless timeout sorunu yaşanmaz; n8n'in 30-60 sn
 * süren Gemini çağrısı arka planda tamamlanır.
 *
 * Request body: { userId: string, ideaId: string, requestId?: string }
 * Response: { success: true, contentId: string, status: "generating", requestId }
 *
 * NOT: n8n workflow `contentId = "content_" + ideaId` formülü ile deterministic
 * bir ID üretir; frontend bu sayede listener'ı kurabilir.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ideaId, requestId: incomingReqId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId zorunludur" },
        { status: 400 }
      );
    }
    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: "ideaId zorunludur" },
        { status: 400 }
      );
    }

    const requestId = incomingReqId || `req_${Date.now()}`;
    const contentId = `content_${ideaId}`;

    const n8nBase =
      process.env.N8N_WEBHOOK_BASE_URL ||
      "https://trendd.app.n8n.cloud";
    const webhookUrl = `${n8nBase}/webhook/generate-content-text`;

    // n8n çağrısını arka planda tetikle — yanıtı bekleme
    after(async () => {
      try {
        console.log(
          "[content/generate] Triggering n8n:",
          webhookUrl,
          "ideaId:",
          ideaId
        );
        const n8nResp = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ideaId, requestId }),
        });
        if (!n8nResp.ok) {
          console.error(
            "[content/generate] n8n returned error:",
            n8nResp.status,
            await n8nResp.text().catch(() => "")
          );
        } else {
          console.log("[content/generate] n8n completed for ideaId:", ideaId);
        }
      } catch (err) {
        console.error("[content/generate] n8n call failed:", err);
      }
    });

    return NextResponse.json({
      success: true,
      contentId,
      status: "generating",
      requestId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[content/generate] Sunucu hatası:", message);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası", detail: message },
      { status: 500 }
    );
  }
}
