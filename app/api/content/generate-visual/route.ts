import { NextRequest, NextResponse, after } from "next/server";

/**
 * POST /api/content/generate-visual
 *
 * "Fire-and-forget" — n8n yanıtını beklemez, hemen döner.
 * Frontend Firestore listener (`generatedContents/{contentId}` veya
 * `generatedVisuals` koleksiyonu) ile yeni görseli bekler.
 *
 * Hem ilk görsel üretimi hem "yeniden oluştur" için aynı endpoint.
 *
 * Request body: { userId, contentId, requestId? }
 * Response: { success: true, contentId, status: "generating_visual", requestId }
 *
 * NOT: n8n workflow textApproved === true kontrolü yapar; onaysız çağrı hatadan döner.
 * OPENAI_API_KEY n8n credentials'ında olmalı.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, contentId, requestId: incomingReqId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId zorunludur" },
        { status: 400 }
      );
    }
    if (!contentId) {
      return NextResponse.json(
        { success: false, error: "contentId zorunludur" },
        { status: 400 }
      );
    }

    const requestId = incomingReqId || `req_${Date.now()}`;

    const n8nBase =
      process.env.N8N_WEBHOOK_BASE_URL ||
      "https://trendd.app.n8n.cloud";
    const webhookUrl = `${n8nBase}/webhook/generate-visual`;

    after(async () => {
      try {
        console.log(
          "[content/generate-visual] Triggering n8n:",
          webhookUrl,
          "contentId:",
          contentId
        );
        const n8nResp = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, contentId, requestId }),
        });
        if (!n8nResp.ok) {
          console.error(
            "[content/generate-visual] n8n error:",
            n8nResp.status,
            await n8nResp.text().catch(() => "")
          );
        } else {
          console.log(
            "[content/generate-visual] n8n completed for contentId:",
            contentId
          );
        }
      } catch (err) {
        console.error("[content/generate-visual] n8n call failed:", err);
      }
    });

    return NextResponse.json({
      success: true,
      contentId,
      status: "generating_visual",
      requestId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[content/generate-visual] Sunucu hatası:", message);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası", detail: message },
      { status: 500 }
    );
  }
}
