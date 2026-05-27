# TrendyAI — Kapsamlı Proje Durum Raporu

**Tarih:** 2026-05-27
**Versiyon:** MVP Geliştirme Aşaması
**Hazırlayan:** Proje analizi (web + n8n workflows)

---

## 1. YÖNETİCİ ÖZETİ

TrendyAI; küçük işletme ve solo profesyoneller için **AI destekli sosyal medya içerik otomasyonu** sağlayan bir Next.js + Firebase + n8n platformudur. Kullanıcı marka kimliğini tanımlar, sistem haftalık 10 kişiselleştirilmiş içerik fikri üretir, kullanıcı onaylar ve sosyal medyaya paylaşılır.

**Şu anki tamamlanma oranı: ~%55**
- 🟢 Kullanıcı kaydı + Onboarding + Marka Kimliği: %100
- 🟢 Haftalık İçerik Fikri Üretimi (Gemini): %95 (Türkçe karakter sorunu az önce çözüldü)
- 🟡 Onay/Feedback akışı: %85
- 🔴 İçerik Üretme (metin + görsel): %15 (mock data)
- 🔴 Programlama + Yayın: %10 (UI var, backend yok)
- 🔴 Takvim sayfası: %0 (sayfa yok)

---

## 2. ŞU AN ÇALIŞAN İŞLEVLER 🟢

### 2.1 Landing Page (`/`)
- ✅ Hero section, özellikler, "Nasıl Çalışır" akış
- ✅ "Ücretsiz Hesap Oluştur" butonu → `/register`

### 2.2 Authentication
- ✅ `/register` — Firebase Auth ile kayıt (email + şifre)
- ✅ `/login` — Giriş
- ✅ `/forgot-password` — Şifre sıfırlama
- ✅ Auth Context (`useAuth`) — kullanıcı state'i tüm app'te paylaşılıyor

### 2.3 Onboarding (5 Adımlı Stepper)
| Adım | Sayfa | Durum |
|------|-------|-------|
| 1 | `/onboarding/user-info` (ad, email, meslek, sektör) | 🟢 |
| 2 | `/onboarding/brand-identity` (marka sesi, hedef kitle, görsel kimlik, **AI özet** Gemini) | 🟢 |
| 3 | `/onboarding/platforms` (Instagram + Facebook OAuth) | 🟢 (LinkedIn/X disabled) |
| 4 | `/onboarding/content-preferences` (sıklık, günler, saat, format, hedef) | 🟢 |
| 5 | `/onboarding/review` (özet + "Haftalık Akışı Başlat") | 🟢 |

### 2.4 Haftalık İçerik Üretimi
- ✅ "Haftalık Akışı Başlat" → `/api/weekly-flow` → n8n `start-weekly-flow` webhook
- ✅ n8n workflow `Start Weekly Flow / Personalized Planner` 10 fikir üretir
- ✅ Firestore'a yazar: `weeklyPlans/{userId_weekId}` + 10 adet `contentIdeas/{ideaId}`
- 🟢 **YENİ:** Frontend GBK fix ile Türkçe karakterler artık düzgün görüntüleniyor

### 2.5 İçerik Fikirleri Sayfası (`/dashboard/content-ideas`)
- ✅ 10 fikri kart halinde gösterme
- ✅ Filtreleme: Durum + Platform
- ✅ "Onayla" / "Reddet" / "Sil" — Firestore'a direkt yazar
- ✅ "Feedback Ver" → modal açar → `/api/regenerate-idea` → n8n `regenerate-content-idea` webhook
- ✅ Fikir kartına tıklayınca `/dashboard/content-create/[id]` sayfasına gider

### 2.6 Platform Bağlantısı (OAuth)
- ✅ Meta (Instagram + Facebook) OAuth 2.0 entegrasyonu
- ✅ Token'lar Firestore'da `connectedPlatforms/{uid}/platforms/{id}` altında şifreli saklanıyor
- ✅ Bağlantıyı kesme

### 2.7 Direkt Sosyal Medya Paylaşımı (Backend Hazır!)
- ✅ `/api/post-content` endpoint'i — Instagram, Facebook, LinkedIn, X için **doğrudan Meta/LinkedIn/X Graph API'lerine post atıyor** (n8n'siz!)
- ⚠️ Ancak frontend'de bu endpoint'i çağıran buton YOK

### 2.8 Dashboard (`/dashboard`)
- ✅ 4 metrik kartı: Toplam İçerik, Onay Bekleyen, Bu Hafta Planlanan, Bağlı Platform
- ✅ Son 3 içerik fikri listesi
- ✅ Yaklaşan paylaşımlar (mock)
- ✅ "Haftalık Akışı Başlat" butonu (her hafta tekrar tetiklenebilir)

### 2.9 Ayarlar (`/dashboard/settings`)
- ✅ Profil güncelleme (ad, email, meslek)
- ✅ Marka kimliği güncelleme (tüm onboarding alanları)
- ✅ Bildirim tercihleri (mock)
- ✅ Çıkış yapma

### 2.10 Yasal Sayfalar
- ✅ `/privacy-policy`, `/terms-of-service`, `/data-deletion`

---

## 3. EKSİK / GELİŞTİRİLECEK İŞLEVLER 🔴

### 3.1 İçerik Oluşturma Sayfası — TAMAMEN MOCK DATA
**Konum:** `/dashboard/content-create/[id]`

Şu an `lib/api.ts` içinde **5 fonksiyon mock veri döndürüyor:**

| Fonksiyon | Şu an | Olması gereken | n8n Workflow Hazır mı? |
|-----------|-------|------------------|--------------------------|
| `generateContent(ideaId)` | `delay(2500); return mockGeneratedContent` | `fetch("/api/content/[id]/generate")` → n8n `/webhook/generate-content-text` | ✅ Hazır (`QoZDXPGVVa2JBCJk`) |
| `regenerateText(contentId)` | `delay(2000); return mockGeneratedContent` | `fetch(.../regenerate-text)` → n8n `/webhook/regenerate-content-text` | ✅ Hazır (`T8UgeC8pCZBJiXq1`) |
| `regenerateVisual(contentId)` | `delay(2500); return mock` | `fetch(.../regenerate-visual)` → n8n `/webhook/generate-visual` | ✅ Hazır (`3PucsqDEI1LiS5eP`) |
| `approveText(contentId)` | `delay(300); return success` | Firestore update yeter (n8n gereksiz) | ❌ Workflow var ama gerekli değil |
| `approveVisual(contentId)` | `delay(300); return success` | Firestore update yeter | ❌ Gereksiz |
| `scheduleContent(...)` | `delay(1000); return mock` | `fetch(.../schedule)` → n8n `/webhook/schedule-content` | ✅ Hazır (`iyjgsDUUTO4CEdKr`) |

**Eksik kısım:** Workflow'lar n8n'de duruyor ama web sitesinden çağrılmıyor. 4 API route oluşturulmalı:
- `app/api/content/[id]/generate/route.ts`
- `app/api/content/[id]/regenerate-text/route.ts`
- `app/api/content/[id]/regenerate-visual/route.ts`
- `app/api/schedule-content/route.ts`

### 3.2 Takvim Sayfası — SAYFA YOK
**Konum:** `/dashboard/calendar` — sidebar'da link var ama **sayfa dosyası mevcut değil!**

**Olması gereken:**
- Aylık/haftalık takvim görünümü (`shadcn/ui Calendar` componenti kullanılabilir)
- `scheduledPosts` koleksiyonundaki tüm programlı paylaşımlar
- Drag-and-drop ile tarih değiştirme
- Tıklayınca paylaşımı düzenleme/iptal etme

### 3.3 Görsel Üretim Önizleme — PLACEHOLDER
İçerik oluşturma sayfasında "Görsel önizleme alanı" yazıyor + "(Canva/AI görsel entegrasyonu eklenecek)" notu var.

**Olması gereken:**
- DALL-E / Stable Diffusion / Gemini Imagen ile görsel üretim
- Görsel n8n'den URL olarak gelmeli (`generatedContents.visual.imageUrl`)
- Frontend `<img src={content.visual.imageUrl} />` ile gösterir
- Opsiyonel: Canva embed (kullanıcı düzenleyebilsin)

### 3.4 Otomatik Yayın — EKSİK
- `Schedule Content` workflow'u var ama içinde **Wait Node + Publishing kısmı belirsiz**
- Beklenen mantık: Tarih/saat geldiğinde n8n otomatik Instagram/Facebook API'sine post atmalı

**İki seçenek:**

**A) Tam n8n çözümü:**
- `Schedule Content` workflow'u Wait node ile bekler, vakti gelince Meta API'ye direkt POST atar
- `scheduledPosts.status: "scheduled" → "published"` günceller

**B) Cron tabanlı:**
- Her 5 dakikada çalışan yeni "Publishing Watcher" workflow'u
- `scheduledPosts where scheduledAt <= now AND status == "scheduled"` sorgular
- Her birini `/api/post-content` endpoint'inden paylaşır
- ⭐ **Avantaj:** Direkt API çağrısı kodu zaten `app/api/post-content/route.ts`'te yazılmış!

### 3.5 Bildirimler
- Toast bildirimleri var ✅
- Email bildirimi YOK ❌
- Push notification YOK ❌
- "İçerik fikrin hazır", "Paylaşım yayınlandı" gibi e-postalar eklenebilir (Firebase Cloud Functions + SendGrid)

### 3.6 LinkedIn ve X Bağlantısı
- UI'da disable görünüyor (`enabled: false`)
- OAuth kodları `/api/auth/connect/route.ts`'te zaten var
- Aktif edilmek için sadece `enabled: true` yapmak yetmez, OAuth provider tarayıcı redirect'leri test edilmeli

### 3.7 TypeScript Hataları (Mevcut Pre-existing)
`npx tsc --noEmit` çıktısında 5+ tip hatası var:
- `lib/mock-data.ts` — `name`, `contentType` özellikleri tip'te tanımlı değil
- `app/onboarding/platforms/page.tsx` — `username`, `platformName`, `profileImage` tip'te yok
- `app/api/auth/connect/route.ts` — Implicit any indexing

**Etki:** Build başarılı oluyor (Next.js ts-ignore mantığı), ama temizlenmeli.

### 3.8 Mock Veri Bağlantıları
`lib/api.ts` içinde hala mock data dönen fonksiyonlar:
- `registerUser`, `loginUser` (gerçek auth zaten Firebase Auth Provider üzerinden)
- `getPlatformAccounts` (kullanılmıyor — `getConnectedPlatforms` kullanılıyor)
- `getSettings` (mock notification preferences)
- `getScheduledPosts`, `updateScheduledPost`, `cancelScheduledPost`
- `changePassword`

---

## 4. N8N WORKFLOW DURUM ÖZETİ

### 4.1 Kullanılacak 9 Workflow

| # | Workflow | Tetikleyici | Web Bağlantısı | Durum |
|---|----------|-------------|-----------------|-------|
| 1 | Weekly Trend Pool Builder | CRON (Pzt 04:00) | — (otomatik) | 🟢 OK |
| 2 | Start Weekly Flow / Personalized Planner | `/webhook/start-weekly-flow` | `/api/weekly-flow` | 🟢 OK |
| 3 | Regenerate Content Idea With Feedback | `/webhook/regenerate-content-idea` | `/api/regenerate-idea` | 🟢 OK |
| 4 | Generate Content Text | `/webhook/generate-content-text` | **EKSİK** | 🔴 |
| 5 | Regenerate Content Text | `/webhook/regenerate-content-text` | **EKSİK** | 🔴 |
| 6 | Generate Visual | `/webhook/generate-visual` | **EKSİK** | 🔴 |
| 7 | Schedule Content | `/webhook/schedule-content` | **EKSİK** | 🔴 |
| 8 | Platform Token Refresh | CRON (her gün 03:00) | — | 🟢 OK |
| 9 | Error Logging | (diğer workflow'lardan) | — | 🟢 OK |

### 4.2 Silinecek (Kopya/Gereksiz)

| Dosya | Sebep |
|-------|-------|
| `2HG3ahcZdKyINJYC-My_workflow.json` | Boş (1 node) |
| `3Msz1ewNhVKOkGZf-Start_Weekly_Flow_...` | Start Weekly'nin eski kopyası |
| `RIUtFYeOlOUbwiwn-Start_Weekly_Flow_...` | Start Weekly'nin eski kopyası |
| `aaHjDLuqIoJLvgjE-My_workflow_4.json` | Eski Start Weekly kopyası |
| `FeYPn9G7NKYBuhCO-My_workflow_2.json` | En eski Start Weekly kopyası |
| `SRjyIBSwliShRfg5-Dashboard_Summary_Update` | Jro3JBDAO5 ile aynı kopya |
| `Jro3JBDAO5dL4g5q-Dashboard_Summary_Update` | Dashboard zaten Firestore'dan canlı okuyor, gereksiz |
| `WmbJ4oeBrPqCSfsd-Approve_Content` | Onay sadece Firestore yazımı, n8n gereksiz |

**Net sonuç: 17 dosyadan 9'a iniyor** (8 dosya temizleniyor)

### 4.3 Eklenmesi Gereken Yeni Workflow

**Publishing Watcher** (önerilir)
- **Tetikleyici:** CRON (her 5 dakika)
- **Mantık:**
  ```
  Query: scheduledPosts WHERE status="scheduled" AND scheduledAt <= now()
  For each post:
    GET generatedContents/{contentId}
    POST trendyai-website.vercel.app/api/post-content
    UPDATE scheduledPosts/{postId} status="published"
  ```
- **Avantaj:** `/api/post-content` endpoint'i hazır → tüm platformlara paylaşır

---

## 5. GELİŞTİRME TAMAMLANINCA TRENDYAİ NASIL OLACAK?

### 5.1 KULLANICI YOLCULUĞU (Tam Hali)

```
┌──────────────────────────────────────────────────────────────┐
│ 1️⃣ KAYIT VE ONBOARDİNG (10-15 dakika, tek seferlik)         │
├──────────────────────────────────────────────────────────────┤
│ • Email + şifre ile hesap aç                                 │
│ • 5 adımlı onboarding:                                       │
│   - Kişisel bilgiler                                         │
│   - Marka kimliği (AI özet ile zenginleştirilir)             │
│   - Instagram/Facebook/LinkedIn/X bağla (OAuth)              │
│   - İçerik tercihleri (sıklık, gün, saat)                    │
│   - Özet & "Haftalık Akışı Başlat" butonu                    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 2️⃣ HER PAZARTESİ OTOMATİK: TREND HAVUZU                     │
├──────────────────────────────────────────────────────────────┤
│ Pzt 04:00 — Weekly Trend Pool Builder (n8n)                 │
│ • SerpApi + Apify ile sektörel trend topla                  │
│ • Gemini ile özetle                                          │
│ • Firestore: currentTrendPool/{niche}                        │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 3️⃣ KULLANICI "HAFTALIK AKIŞI BAŞLAT"A BASAR                 │
├──────────────────────────────────────────────────────────────┤
│ • Loading ekranı (3 adım): trend → marka → takvim           │
│ • n8n: Start Weekly Flow → Gemini → 10 fikir                 │
│ • → /dashboard/content-ideas sayfasına yönlendirir          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 4️⃣ İÇERİK FİKİRLERİ SAYFASI: 10 KART                        │
├──────────────────────────────────────────────────────────────┤
│ Her kart:                                                    │
│  • Başlık, açıklama (Türkçe!)                                │
│  • Platform + format + tarih + saat                          │
│  • Trend anahtar kelimesi (kaynak gösterimi)                 │
│  • Onayla / Reddet / Feedback Ver / Sil                      │
│                                                               │
│ Feedback Ver:                                                │
│  → Modal açar, kullanıcı "Daha gençlere hitap etsin" yazar  │
│  → n8n: Regenerate Idea → Gemini → fikri yenile             │
│                                                               │
│ Karta tıkla → İçerik Oluşturma sayfası                      │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 5️⃣ İÇERİK OLUŞTURMA: METİN + GÖRSEL                         │
├──────────────────────────────────────────────────────────────┤
│ Sayfa açılır:                                                │
│  • n8n: Generate Content Text → Gemini → hook/caption/CTA   │
│  • n8n: Generate Visual → Imagen/DALL-E → görsel URL        │
│                                                               │
│ İki kart yan yana: Metin (sol), Görsel (sağ)                │
│  • Metin: Hook, Caption, Body, CTA, Hashtag                  │
│  • Görsel: Üretilen image gösterilir                         │
│                                                               │
│ Her biri için: "Yeniden Oluştur" + "Onayla"                  │
│  • Yeniden Oluştur → n8n'e yeniden istek                    │
│  • Onayla → green badge, ikisi de onaylı olunca "Programla" │
│    butonu açılır                                             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 6️⃣ PROGRAMLA: TARİH/SAAT/PLATFORM                           │
├──────────────────────────────────────────────────────────────┤
│ Modal: Tarih + saat seçici, platform dropdown                │
│ "Programla" → n8n: Schedule Content                          │
│  • Firestore: scheduledPosts/{postId}                        │
│  • Status: "scheduled"                                       │
│ → /dashboard/calendar yönlendirir                            │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 7️⃣ TAKVİM: TÜM PROGRAMLI PAYLAŞIMLAR                        │
├──────────────────────────────────────────────────────────────┤
│ Aylık görünüm — her gün hücresinde post sayısı              │
│ Listede her post için:                                       │
│  • Saat, platform ikonu, başlık                              │
│  • "Düzenle" / "İptal Et"                                    │
│  • Geçmiş postlar için "View Engagement" (faz 2)             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 8️⃣ OTOMATİK YAYIN (KULLANICI YOK)                           │
├──────────────────────────────────────────────────────────────┤
│ Her 5 dakikada Publishing Watcher (n8n cron):                │
│  • Vakti gelen scheduledPosts'ları çek                       │
│  • /api/post-content endpoint'ini çağır                      │
│  • Meta/LinkedIn/X Graph API → POST atılır                  │
│  • Firestore: status="published" + platformPostId kayıt     │
│  • Kullanıcıya email/push: "Paylaşımın yayınlandı!"          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 9️⃣ HAFTA SONU OTOMATİK: YENİ HAFTA HAZIRLIK                 │
├──────────────────────────────────────────────────────────────┤
│ Pazar gece veya Pzt sabah:                                   │
│ • Kullanıcıya hatırlatma email: "Yeni haftalık akış için    │
│   içerik fikirlerine bak!"                                   │
│ • Dashboard'a girince "Bu hafta için akış başlat" CTA       │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 KULLANICI DENEYİMİ ÖZETİ

**Onboarding (1 kez):** 10-15 dakika
**Haftalık iş yükü:**
1. Pazartesi sabah dashboard'a gir → "Haftalık Akışı Başlat" (1 tık, 30 saniye bekle)
2. 10 fikrin gelmesi (otomatik, 1-2 dakika)
3. Her fikir için: ~2 dakika
   - Onayla (1 tık)
   - İçerik üretimini bekle (30 saniye)
   - Metin + görseli onayla (2 tık)
   - Programla (3 tık: tarih + saat + platform)
4. Toplam haftalık zaman: **15-20 dakika**

Karşılığında: **Hafta boyunca otomatik paylaşılan, marka kimliğine uygun, trend bazlı 10 sosyal medya içeriği**.

### 5.3 TEKNİK MİMARİ (Tamamlanmış Hali)

```
┌─────────────────────────────────────────────────┐
│           KULLANICI TARAYICI                     │
│  (Next.js 14 — Vercel'de host)                  │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
   Firebase   /api/*   /api/post-content
   Auth+      (proxy   (direkt sosyal
   Firestore  → n8n)   medya API)
        │         │         │
        ▼         ▼         ▼
   Firestore   n8n Cloud   Meta/LinkedIn/X
   (NoSQL)     Webhooks    Graph APIs
                  │
                  ▼
            Gemini 1.5 Flash
            (içerik + görsel)
                  │
                  ▼
            SerpApi / Apify
            (trend verisi)
```

### 5.4 ÇIKTI ÖRNEĞİ (Bitmiş Hali)

Kullanıcı bir **"Wellness Koçu"** olarak kaydolsa:

**Pazartesi sabahı dashboard:**
- 📊 Bu hafta için 10 yeni içerik fikri hazır!
- 📅 Yaklaşan paylaşımlar: 5
- ✅ Geçen hafta yayımlanan: 8
- 🔗 3 platform bağlı (Instagram, Facebook, LinkedIn)

**Fikir #1 (Türkçe karakterlerle düzgün):**
> 🌅 **"Sabah Rutininin Gücü: Güne 5 Dakikada Doğru Başla"**
> Pazartesi sendromuna karşı bilimsel temelli 3 basit alışkanlık...
> 📱 Instagram • Post • 27 Mayıs 09:00 • #wellness #pazartesimotivasyon
> [Onayla] [Reddet] [Feedback] [Sil]

Onaylar → AI metin ve görsel üretir → Programlar → Salı 09:00'da otomatik Instagram'a düşer.

---

## 6. ÖNCELİKLENDİRME — SONRAKİ ADIMLAR

### 🥇 P0 (MVP'yi tamamlama — 2-3 gün)
1. ✅ Türkçe karakter fix (TAMAMLANDI bugün)
2. 🔴 `lib/api.ts` `generateContent`, `regenerateText`, `regenerateVisual`, `scheduleContent` fonksiyonlarını gerçek n8n webhook'larına bağlama
3. 🔴 4 yeni API route oluşturma (`/api/content/[id]/generate` vb.)
4. 🔴 n8n'de duplicate workflow'ları silme

### 🥈 P1 (Tam MVP — 1 hafta)
5. 🔴 `/dashboard/calendar` sayfasını oluşturma
6. 🔴 Publishing Watcher workflow'u (otomatik yayın)
7. 🔴 Görsel preview (n8n'den gelen imageUrl'i göster)
8. 🔴 TypeScript hatalarını temizleme

### 🥉 P2 (Polish — 2-4 hafta)
9. 🟡 Email bildirimleri (yeni fikir hazır, paylaşım başarılı/başarısız)
10. 🟡 LinkedIn + X bağlantılarını aktif etme
11. 🟡 Dashboard'a engagement metrikleri (geçmiş paylaşımların like/comment sayıları)
12. 🟡 Multi-language UI (İngilizce desteği)

### 🏅 P3 (Faz 2 — 1-2 ay)
- Ödeme entegrasyonu (Stripe) — paid plans
- A/B testing — hangi başlık daha iyi performans gösterdi
- AI ile rakip analizi
- Canva entegrasyonu (görsel düzenleme)
- Team collaboration (birden fazla yönetici)

---

## 7. GÜVENLİK NOTLARI ⚠️

- 🔴 **Meta App Secret** `.env.local`'da görünür durumda (`13580ee5ec21efb9236a3da06a849752`) — Meta Developer Console'dan **rotate edilmeli**
- 🟢 Firebase API anahtarı public (frontend için doğal)
- 🟢 Service Account credential'ları n8n'de saklı
- 🟡 `/api/post-content` endpoint'i Firestore'dan kullanıcı kimliğini okuyor ama kimlik doğrulama eklenmeli (sadece kendi `uid`'i için paylaşabilsin)

---

## 8. SONUÇ

TrendyAI **MVP'nin omurgası çalışıyor** (kayıt → onboarding → haftalık fikir üretimi → onay). Geriye kalan **içerik üretme + otomatik yayın** kısmı için tüm n8n workflow'ları hazır, sadece **web sitesinden bağlantı kurulması** gerekiyor. Tahmini **3-5 günlük geliştirmeyle** tam fonksiyonel MVP elde edilebilir.

Türkçe karakter sorunu az önce GBK encoding fix ile çözüldü. Kullanıcının asıl deneyimini bozan en kritik bug giderildi.
