import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/brand-summary
 *
 * Marka bilgilerinden AI özeti oluşturur (gpt-4.1-mini).
 * Onboarding "Brand Identity" sayfasında "AI Marka Özeti Oluştur" butonu çağırır.
 *
 * Gemini quota sorunları nedeniyle OpenAI'a taşındı (29 May 2026).
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[brand-summary] OPENAI_API_KEY env eksik");
      return NextResponse.json(
        { success: false, error: "Sunucu yapılandırma hatası (OPENAI_API_KEY)" },
        { status: 500 }
      );
    }

    const prompt = `Sen bir sosyal medya pazarlama uzmanısın. Aşağıdaki marka bilgilerini analiz ederek kısa ve etkili bir marka kimliği özeti oluştur.

Marka Bilgileri:
- Marka Adı: ${data.brandName || "Belirtilmedi"}
- Sektör: ${data.sector || "Belirtilmedi"}
- Açıklama: ${data.description || "Belirtilmedi"}
- Hedef Kitle: ${data.targetAudienceDescription || "Belirtilmedi"}
- Yaş Aralığı: ${data.ageRange || "Belirtilmedi"}
- Cinsiyet Odağı: ${data.genderFocus || "Belirtilmedi"}
- Müşteri Sorunları: ${data.problems || "Belirtilmedi"}
- Müşteri Beklentileri: ${data.expectations || "Belirtilmedi"}
- Marka Tonu: ${Array.isArray(data.tones) ? data.tones.join(", ") : "Belirtilmedi"}
- Duygusal Anahtar Kelimeler: ${data.emotionalKeywords || "Belirtilmedi"}
- Kaçınılacak Kelimeler: ${data.wordsToAvoid || "Belirtilmedi"}
- İletişim Tarzı: ${data.communicationStyle || "Belirtilmedi"}
- İçerik Hedefleri: ${Array.isArray(data.goals) ? data.goals.join(", ") : "Belirtilmedi"}
- İçerik Temaları: ${data.themes || "Belirtilmedi"}
- CTA Tercihi: ${data.ctaPreference || "Belirtilmedi"}
- Görsel Stil: ${data.visualStyle || "Belirtilmedi"}
- Ana Renkler: ${data.mainColors || "Belirtilmedi"}

Aşağıdaki formatta, her başlık için 1-2 cümle yaz. Tam olarak bu formatı kullan:

**Marka Kişiliği:** [marka adı ve sektörü, ne sunduğu]

**Hedef Kitle:** [kitle tanımı, yaş, cinsiyet, sorunları]

**Marka Tonu:** [ton ve iletişim tarzı]

**İçerik Dili:** [dil ve anlatım biçimi]

**İçerik Hedefleri:** [hedefler ve CTA tercihi]

**Görsel Yön:** [görsel stil ve renkler]`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    let openaiRes: Response;
    try {
      openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "Sen profesyonel bir sosyal medya pazarlama uzmanısın. Türkçe, samimi ve özlü yaz.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text().catch(() => "");
      console.error(
        "[brand-summary] OpenAI hata:",
        openaiRes.status,
        errorText.slice(0, 300)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Özet oluşturulamadı",
          detail: `OpenAI ${openaiRes.status}`,
        },
        { status: openaiRes.status }
      );
    }

    const json = await openaiRes.json();
    const text: string = json?.choices?.[0]?.message?.content || "";

    if (!text) {
      console.error("[brand-summary] OpenAI boş yanıt:", JSON.stringify(json).slice(0, 300));
      return NextResponse.json(
        { success: false, error: "AI boş yanıt döndü" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, summary: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[brand-summary] Hata:", message);
    return NextResponse.json(
      { success: false, error: "Özet oluşturulamadı", detail: message },
      { status: 500 }
    );
  }
}
