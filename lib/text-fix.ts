/**
 * n8n task runner, UTF-8 Türkçe karakterleri (ş, ı, ğ, ü, ö, ç vb.)
 * GBK (Simplified Chinese) encoding olarak yanlış yorumlayıp Firestore'a bozuk kaydeder.
 *
 * Test sonuçları (iconv-lite ile doğrulandı):
 *   ğ → 臒  ü → 眉  ş → 艧  ı → 谋  ö → 枚  ç → 莽
 *   Ğ → 臑  Ü → 脺  Ş → 艦  İ → 陌  Ö → 脰  Ç → 脟
 *
 * Düzeltme yöntemi:
 *   1. Her GBK karakterini GBK olarak encode et → orijinal UTF-8 baytlarını geri al
 *   2. O baytları UTF-8 olarak decode et → doğru Türkçe karakter
 */

import iconv from "iconv-lite";

// GBK bozulmasından üretilen Türkçe karakter setinin Unicode aralığı:
// Tüm bozuk karakterler U+2E80–U+9FFF aralığında (CJK Unified Ideographs)
const CJK_REGEX = /[⺀-鿿豈-﫿]/;

// Kesin bilinen GBK → Türkçe eşleşme tablosu (test ile doğrulandı)
const GBK_TO_TURKISH: Record<string, string> = {
  "臒": "ğ", // 臒
  "眉": "ü", // 眉
  "艧": "ş", // 艧
  "谋": "ı", // 谋
  "枚": "ö", // 枚
  "莽": "ç", // 莽
  "臑": "Ğ", // 臑
  "脺": "Ü", // 脺
  "艦": "Ş", // 艦
  "陌": "İ", // 陌
  "脰": "Ö", // 脰
  "脟": "Ç", // 脟
};

/**
 * Tek bir string alanındaki GBK bozukluğunu düzeltir.
 * CJK karakteri içermiyorsa dokunmaz (güvenli fallback).
 *
 * Yöntem: Önce kesin mapping tablosuna bak, bulamazsa GBK encode/decode dene.
 */
export function fixGarbledText(text: string | undefined | null): string {
  if (!text || typeof text !== "string") return text ?? "";

  // CJK karakter yoksa zaten doğru → hızlı çıkış
  if (!CJK_REGEX.test(text)) return text;

  // Karakter karakter işle: her CJK char için GBK → UTF-8 dönüşümü dene
  let result = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;

    if (cp >= 0x2E80 && cp <= 0x9FFF) {
      // 1. Önce kesin tablodan bak
      const known = GBK_TO_TURKISH[ch];
      if (known) {
        result += known;
        continue;
      }

      // 2. Kesin tabloda yoksa GBK encode → UTF-8 decode dene
      try {
        const bytes = iconv.encode(ch, "gbk");
        const decoded = iconv.decode(bytes, "utf8");
        // Sonuç Türkçe karakter içeriyorsa başarılı
        if (/[ğüşıöçĞÜŞİÖÇ]/.test(decoded)) {
          result += decoded;
          continue;
        }
      } catch {
        // encode/decode hatası → orijinal karakteri koru
      }
    }

    result += ch;
  }

  return result;
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
    "suggestedTime",
    "suggestedDate",
    "trendTopic",
    "targetAudience",
  ];

  const fixed = { ...(idea as object) } as Record<string, unknown>;
  for (const field of TEXT_FIELDS) {
    if (typeof fixed[field] === "string") {
      fixed[field] = fixGarbledText(fixed[field] as string);
    }
  }
  // hashtags array içindeki stringleri de düzelt
  if (Array.isArray(fixed.hashtags)) {
    fixed.hashtags = (fixed.hashtags as unknown[]).map((tag) =>
      typeof tag === "string" ? fixGarbledText(tag) : tag
    );
  }
  return fixed as unknown as T;
}

/**
 * GeneratedContent nesnesindeki tüm metin alanlarını düzeltir.
 * Hem nested (text.hook, visual.prompt) hem flat alanları kapsar.
 *
 * @param content - GeneratedContent veya benzeri yapı
 */
export function fixGeneratedContentText<T>(content: T): T {
  const fixed = { ...(content as object) } as Record<string, unknown>;

  // Üst seviye string alanlar
  const ROOT_FIELDS = ["platform", "contentType", "niche"];
  for (const field of ROOT_FIELDS) {
    if (typeof fixed[field] === "string") {
      fixed[field] = fixGarbledText(fixed[field] as string);
    }
  }

  // text alt nesnesi
  if (fixed.text && typeof fixed.text === "object") {
    const text = { ...(fixed.text as Record<string, unknown>) };
    const TEXT_FIELDS = ["hook", "caption", "body", "cta", "contentNotes"];
    for (const field of TEXT_FIELDS) {
      if (typeof text[field] === "string") {
        text[field] = fixGarbledText(text[field] as string);
      }
    }
    // hashtags array
    if (Array.isArray(text.hashtags)) {
      text.hashtags = (text.hashtags as unknown[]).map((t) =>
        typeof t === "string" ? fixGarbledText(t) : t
      );
    }
    // carouselSlides array
    if (Array.isArray(text.carouselSlides)) {
      text.carouselSlides = (text.carouselSlides as unknown[]).map((s) =>
        typeof s === "string" ? fixGarbledText(s) : s
      );
    }
    fixed.text = text;
  }

  // visual alt nesnesi
  if (fixed.visual && typeof fixed.visual === "object") {
    const visual = { ...(fixed.visual as Record<string, unknown>) };
    const VISUAL_FIELDS = ["prompt", "negativePrompt", "designStyle"];
    for (const field of VISUAL_FIELDS) {
      if (typeof visual[field] === "string") {
        visual[field] = fixGarbledText(visual[field] as string);
      }
    }
    fixed.visual = visual;
  }

  return fixed as unknown as T;
}
