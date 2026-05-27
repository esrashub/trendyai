/**
 * n8n task runner, UTF-8 Türkçe karakterleri (ş, ı, ğ, ü, ö, ç vb.)
 * Big5 / CJK encoding olarak yanlış yorumlayıp Firestore'a bozuk kaydeder.
 *
 * Bozulma örneği: ı → 謀, ö → 枚, ş → 腹
 * Sebebi: UTF-8 baytları (ör. 0xC4 0xB1 for ı) Big5 olarak okunuyor → Çince karakter çıkıyor.
 *
 * Düzeltme yöntemi:
 *   1. Bozuk metni Big5 olarak encode et → orijinal UTF-8 baytlarını geri al
 *   2. O baytları UTF-8 olarak decode et → doğru Türkçe metin
 */

import iconv from "iconv-lite";

/**
 * Tek bir string alanındaki bozukluğu düzeltir.
 * CJK karakteri içermiyorsa dokunmaz (güvenli fallback).
 */
export function fixGarbledText(text: string | undefined | null): string {
  if (!text || typeof text !== "string") return text ?? "";

  // CJK Unicode aralığı: 0x2E80–0x9FFF, 0xF900–0xFAFF
  // Bu karakterler yoksa metin zaten doğru → olduğu gibi döndür
  if (!/[⺀-鿿豈-﫿]/.test(text)) return text;

  try {
    // Bozuk metni Big5 olarak encode et → orijinal UTF-8 byte dizisi
    const bytes = iconv.encode(text, "big5");
    // O baytları UTF-8 olarak decode et → doğru Türkçe
    const decoded = iconv.decode(bytes, "utf8");

    // Doğrulama: Türkçe karakter çıktıysa başarılı
    if (/[ğüşıöçĞÜŞİÖÇ]/.test(decoded)) return decoded;
    // Artık CJK yoksa da başarılı sayılır
    if (!/[⺀-鿿豈-﫿]/.test(decoded)) return decoded;
  } catch {
    // iconv hatası → orijinali döndür
  }

  return text; // Son çare: bozuk haliyle döndür
}

/**
 * ContentIdea nesnesindeki tüm metin alanlarını düzeltir.
 * id, userId, status gibi sistem alanlarına dokunmaz.
 */
export function fixContentIdeaText<T>(idea: T): T {
  const TEXT_FIELDS = [
    "title",
    "description",
    "linkedTrendTitle",
    "trendKeyword",
    "brandFitReason",
    "niche",
    "platform",
    "contentFormat",
    "trendSource",
  ];

  const fixed = { ...(idea as object) } as Record<string, unknown>;
  for (const field of TEXT_FIELDS) {
    if (typeof fixed[field] === "string") {
      fixed[field] = fixGarbledText(fixed[field] as string);
    }
  }
  return fixed as unknown as T;
}
