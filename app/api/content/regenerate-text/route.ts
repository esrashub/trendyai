import { NextRequest, NextResponse, after } from "next/server";

/**
 * POST /api/content/regenerate-text
 *
 * "Fire-and-forget" — n8n yanıtını beklemez, hemen döner.
 * Frontend Firestore listener ile güncellenmiş metni bekler
 * (status: text_generated, updatedAt değişir).
 *
 * Request body: { userId, contentId, feedback, requestId? }
 * Response: { success: true, contentId, status: "regenerating", requestId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, contentId, feedback, requestId: incomingReqId } = body;

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
    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { success: false, error: "feedback zorunludur (boş olamaz)" },
        { status: 400 }
      );
    }

    const requestId = incomingReqId || `req_${Date.now()}`;

    const n8nBase =
      process.env.N8N_WEBHOOK_BASE_URL ||
      "https://trendd.app.n8n.cloud";
    const webhookUrl = `${n8nBase}/webhook/regenerate-content-text`;

    after(async () => {
      try {
        console.log(
          "[content/regenerate-text] Triggering n8n:",
          webhookUrl,
          "contentId:",
          contentId
        );
        const n8nResp = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, contentId, feedback, requestId }),
        });
        if (!n8nResp.ok) {
          console.error(
            "[content/regenerate-text] n8n error:",
            n8nResp.status,
            await n8nResp.text().catch(() => "")
          );
        } else {
          console.log(
            "[content/regenerate-text] n8n completed for contentId:",
            contentId
          );
        }
      } catch (err) {
        console.error("[content/regenerate-text] n8n call failed:", err);
      }
    });

    return NextResponse.json({
      success: true,
      contentId,
      status: "regenerating",
      requestId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[content/regenerate-text] Sunucu hatası:", message);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası", detail: message },
      { status: 500 }
    );
  }
}
