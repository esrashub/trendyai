import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "GEMINI_API_KEY tanımlı değil" },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();

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

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[brand-summary] Gemini API hatası:", res.status, errText);
      return NextResponse.json(
        { success: false, error: "Gemini API hatası", detail: errText },
        { status: 500 }
      );
    }

    const json = await res.json();
    const summary = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ success: true, summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[brand-summary] Hata:", message);
    return NextResponse.json(
      { success: false, error: "Özet oluşturulamadı", detail: message },
      { status: 500 }
    );
  }
}
