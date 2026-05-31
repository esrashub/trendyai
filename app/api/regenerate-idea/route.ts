import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/regenerate-idea
 *
 * n8n "Regenerate Content Idea" webhook'una fire-and-forget proxy.
 * Kullanıcının feedback verdiği içerik fikrini yeniden oluşturur.
 * Frontend onSnapshot ile Firestore'u dinlediği için yanıt beklemiyoruz.
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
      "https://trendd.app.n8n.cloud";
    const webhookUrl = `${n8nBase}/webhook/regenerate-content-idea`;

    // Fire-and-forget: n8n'e isteği gönder ama yanıtı bekleme
    // Frontend zaten onSnapshot ile Firestore'u dinliyor
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, feedback }),
    }).catch((err) => {
      // Hataları logla ama UI'ı engelleme
      console.warn("[regenerate-idea] n8n webhook hatası:", err.message);
    });

    // Hemen başarı dön - n8n arka planda çalışacak
    return NextResponse.json({ success: true, queued: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[regenerate-idea] Hata:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
