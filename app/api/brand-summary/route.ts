import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

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
