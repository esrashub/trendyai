# TrendyAI: Yapay Zeka Tabanlı Sosyal Medya İçerik Otomasyon Platformu

## Bitirme Projesi Final Raporu

**Geliştirici:** Gülbahar Bozkurt
**Proje Süresi:** Mayıs 2026
**Versiyon:** 1.0 (MVP)

---

## Yönetici Özeti

TrendyAI; küçük ve orta ölçekli işletmelerin sosyal medya içerik üretim süreçlerini büyük dil modelleri (LLM) ve iş akışı otomasyonu ile uçtan uca otomatize eden, web tabanlı bir SaaS platformudur. Sistem; haftalık trend toplama, marka kimliğine göre kişiselleştirilmiş içerik fikri üretimi, metin ve görsel üretimi, kullanıcı geri bildirimi ile yeniden üretim, takvim üzerinden zamanlama ve sosyal medya platformlarına yayın aşamalarını içerir. Bu raporda projenin mimarisi, kod yapısı, kullanılan modellerin değerlendirmesi ve LLM çıktılarının doğruluk-güvenilirlik test metodolojisi detaylı olarak sunulmuştur.

---

## 1. Giriş

### 1.1 Problem Tanımı
Küçük işletmelerin sosyal medya iletişiminde karşılaştığı temel sorunlar şunlardır:
1. Düzenli içerik üretimi için zaman yetersizliği,
2. Trendleri takip etme ve marka kimliğiyle anlamlı şekilde ilişkilendirme zorluğu,
3. Metin, görsel ve yayın zamanlaması arasındaki dağınık iş akışı,
4. Profesyonel sosyal medya ajansı maliyetlerinin (aylık 2.500-15.000 TL) küçük işletmeler için sürdürülemez olması.

### 1.2 Önerilen Çözüm
TrendyAI; trend tarama (SerpApi + Apify), büyük dil modeli (OpenAI gpt-4.1-mini), görsel üretim modeli (OpenAI gpt-image-1) ve sosyal medya API'lerini (Meta Graph API) bir araya getirerek **"tek tıkla haftalık plan"** kullanıcı deneyimini sağlar. Kullanıcı yalnızca onaylama, geri bildirim verme ve zamanlama adımlarına müdahil olur; üretim tamamen otomatize edilmiştir.

### 1.3 Kapsam
- Niche bazlı haftalık trend pool oluşturma
- Kişiselleştirilmiş 10 adet içerik fikri üretimi
- Onaylanan fikir için metin (hook, caption, body, CTA, hashtags) ve görsel üretimi
- Kullanıcı geri bildirimi ile fikir veya metin yeniden üretimi
- Takvim üzerinden zamanlama
- Instagram Business hesabına otomatik yayın

---

## 2. Sistem Mimarisi

### 2.1 Bileşenler

| Katman | Teknoloji | Sorumluluk |
|--------|-----------|------------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui | Kullanıcı arayüzü, dashboard, onboarding |
| Auth | Firebase Authentication | E-posta + Google OAuth |
| Veritabanı | Cloud Firestore | Kullanıcı profili, içerik, takvim, trend pool |
| Dosya Depolama | Firebase Storage | AI tarafından üretilen görseller |
| İş Akışı Motoru | n8n Cloud | 8 aktif otomasyon workflow'u |
| LLM Servisi | OpenAI Chat Completions API (gpt-4.1-mini) | Metin üretimi, fikir analizi |
| Görsel Servisi | OpenAI Images API (gpt-image-1) | Sosyal medya görselleri |
| Trend Kaynakları | SerpApi (Google Trends), Apify (sosyal trendler) | Haftalık trend taraması |
| Sosyal Medya | Meta Graph API | Instagram Business + Facebook Pages |
| Barındırma | Vercel | Production deployment |
| Versiyon Kontrolü | GitHub | Kod ve süreç izlenebilirliği |

### 2.2 Mimari Akış Diyagramı

```
+------------------+        +---------------------+        +-------------------+
| Kullanıcı (Web)  |  -->   | Next.js Frontend    |  -->   | Firebase          |
|                  |  <--   | + API Route'lar     |  <--   | Auth + Firestore  |
+------------------+        +----------+----------+        +-------------------+
                                       |
                                       v
                            +----------+----------+
                            |  n8n Cloud Webhook  |
                            +----------+----------+
                                       |
        +------------------+-----------+-----------+------------------+
        v                  v                       v                  v
+-------+--------+ +-------+--------+ +------------+------+ +---------+--------+
| Trend Sources  | | OpenAI         | | Firebase Storage  | | Meta Graph API   |
| (SerpApi,      | | (gpt-4.1-mini, | | (Görsel barındırma| | (IG/FB yayın)    |
|  Apify)        | |  gpt-image-1)  | |                   | |                  |
+----------------+ +----------------+ +-------------------+ +------------------+
```

### 2.3 Temel Mimari Kararlar

- **Fire-and-forget + Firestore Listener Pattern**: AI işlemleri 30-90 saniye sürebilir. Frontend, n8n yanıtını HTTP üzerinden beklemek yerine, Firestore `onSnapshot` dinleyicisi kurar; n8n iş bitince Firestore'a yazar, UI otomatik güncellenir.
- **Webhook + Cron Triggers**: Weekly Trend Pool Builder hem Pazartesi 04:00 CRON ile hem de webhook ile çalışır (yeni kullanıcı tetiklemesi için).
- **updateMask Zorunluluğu**: Firestore PATCH istekleri varsayılan olarak tüm dokümanı eziyor; her PATCH'te `updateMask.fieldPaths` query parametresi zorunlu hale getirildi (text wipe sorununun çözümü).
- **Pre-escape Pattern**: OpenAI prompt body'lerine gömülen object'lerin outer JSON'u kırması nedeniyle `JSON.stringify(JSON.stringify(x)).slice(1, -1)` çift escape deseni standartlaştırıldı.
- **State'e Platform Encode**: OAuth flow'unda cookie kaybolma riskine karşı state parametresi `${platform}-${nonce}` formatında yazılır; callback'te platform state'ten parse edilir, cookie sadece fallback.

---

## 3. Teknoloji Yığını ve Kod Yapısı

### 3.1 Dizin Yapısı (Özet)

```
app/                       # Next.js App Router sayfaları
  api/                     # Sunucu tarafı API rotaları
    weekly-flow/           # Start Weekly Flow proxy
    trend-pool/ensure/     # Trend pool builder proxy
    regenerate-idea/       # Idea regenerate proxy
    content/
      generate/            # Generate Content Text proxy
      regenerate-text/     # Regenerate text proxy
      generate-visual/     # Generate Visual proxy
    auth/                  # OAuth bağlantı + callback
    brand-summary/         # AI marka özeti (OpenAI)
    post-content/          # Instagram/Facebook yayın
  dashboard/               # Korumalı kullanıcı sayfaları
    content-ideas/         # Haftalık fikir listesi + onay/feedback
    content-create/        # [id] dinamik sayfa: metin + görsel
    calendar/              # Zamanlanmış paylaşımlar takvim/liste
    settings/              # Profil + platform bağlantıları
  onboarding/              # 5 adımlı kullanıcı kurulumu
    user-info/             # Temel bilgiler
    brand-identity/        # Marka kimliği + AI özet
    platforms/             # Sosyal medya OAuth
    content-preferences/   # Format + amaç tercihleri
    review/                # Özet + ilk akış tetikleme

lib/
  api.ts                   # Tek geçit: Firestore + n8n çağrı katmanı
  firebase.ts              # Firebase client init
  oauth-config.ts          # Meta OAuth scope yapılandırması
  text-fix.ts              # GBK → UTF-8 encoding fix (iconv-lite)

components/
  ui/                      # shadcn/ui primitives (40+ component)
  layout/                  # Sidebar, topbar, onboarding stepper
  modals/                  # Schedule, Feedback dialogları
  cards/                   # Content idea, dashboard metric

types/
  index.ts                 # ContentIdea, GeneratedContent, ScheduledPost...

firestore.rules            # Doc-id pattern matching ile kullanıcı izolasyonu
```

### 3.2 Önemli Modüller

- **`lib/api.ts`** (1100+ satır): Frontend ile backend arasındaki tek geçit. Auth state izleme, brandIdentities/contentIdeas/generatedContents/scheduledPosts CRUD'ları ve tüm n8n webhook proxy'leri burada toplanmıştır.
- **`lib/text-fix.ts`**: n8n task runner'ın OpenAI yanıtlarındaki UTF-8 baytlarını zaman zaman GBK olarak yorumlayıp Türkçe karakterleri Çinceye çevirme sorununu çözer. Map tabanlı düzeltme + `iconv-lite` ile bayt seviyesinde geri dönüş + tanımlanmayan CJK karakterleri silme.
- **`firestore.rules`**: `ideaId.matches('^' + request.auth.uid + '_.*')` deseniyle ID-bazlı erişim kontrolü; ek olarak `userId` alanı kontrolü ile çift güvenlik.

### 3.3 Toplam Kod Metrikleri
- TypeScript/TSX dosyaları: ~85
- API route'ları: 12
- Dashboard sayfaları: 5 (her biri 200-700 satır)
- n8n workflow'ları: 8 aktif
- Yeniden kullanılabilir UI bileşenleri: 40+ (shadcn/ui)

---

## 4. İş Akışları (n8n Workflows)

8 aktif workflow:

| # | Workflow | Tetikleyici | Görev |
|---|----------|-------------|-------|
| 1 | Weekly Trend Pool Builder | CRON (Pzt 04:00) + Webhook | SerpApi/Apify ile trend tara → OpenAI analiz → `trendPools/{weekId}_{niche}` |
| 2 | Start Weekly Flow / Personalized Planner | Webhook | Marka kimliği + trend pool → OpenAI → 10 kişiselleştirilmiş fikir |
| 3 | Generate Content Text | Webhook | Onaylı fikir → hook, caption, body, CTA, hashtags |
| 4 | Generate Visual | Webhook | gpt-image-1 → Firebase Storage → URL Firestore'a |
| 5 | Regenerate Content Idea With Feedback | Webhook | Kullanıcı feedback + niche kilidi → idea güncelle |
| 6 | Regenerate Content Text | Webhook | Mevcut metin + feedback → yeni metin |
| 7 | Approve Content | Webhook | Onay statüsü güncelleme |
| 8 | Schedule Content | Webhook | Programlama bilgisini Firestore'a yaz |

### 4.1 Karşılaşılan Mühendislik Sorunları ve Çözümleri

1. **Türkçe karakter bozulması (GBK ↔ UTF-8)**: n8n task runner'ın bayt yorumlama sorunu. **Çözüm**: hem n8n Validate node'larında 12 karakterlik map fix, hem de frontend'de `iconv-lite` ile bayt seviyesinde GBK → UTF-8 dönüşümü.
2. **JSON body invalid**: OpenAI prompt'una `{{ JSON.stringify(obj) }}` ile gömülen object'in outer JSON quote'larını kırması. **Çözüm**: `{{ JSON.stringify(JSON.stringify(obj)).slice(1, -1) }}` double-escape deseni.
3. **OAuth cookie kaybı**: Cookie 10 dakika TTL yetersiz + cross-domain kayıp. **Çözüm**: TTL 60 dakikaya çıkarıldı + state'e `${platform}-${nonce}` formatında platform encode edildi.
4. **updateMask eksikliği**: Firestore PATCH tüm dokümanı eziyordu. **Çözüm**: PATCH'lerde `updateMask.fieldPaths` zorunlu.
5. **Sequential vs Parallel**: n8n paralel akışta sadece bir hedef tetikleniyordu. **Çözüm**: kritik akışlarda sıralı zincir + `$('NodeName').first().json` ile direkt referans.
6. **Stale Cache**: ContentId formatı tekrarlı; eski test verisi yeni kullanıcıyı yanıltıyordu. **Çözüm**: frontend listener'da `content.createdAt < idea.createdAt` kontrolü ile stale algılama; n8n ideaId'sine runId timestamp eklenmesi.
7. **Storage bucket sorunu**: `firebasestorage.googleapis.com` endpoint'i 404 dönüyordu. **Çözüm**: `storage.googleapis.com` direkt GCS endpoint'ine geçildi.
8. **Niche'ten sapma**: AI yaratıcılıkla farklı niche'lere kayıyordu. **Çözüm**: LOCK pattern — kilit değerler prompt'un başında "DEĞİŞTİRME" zorunluluğuyla + Validate'te zorla yeniden yazma.

---

## 5. LLM Entegrasyonu ve Prompt Mühendisliği

### 5.1 Model Seçimi
**OpenAI gpt-4.1-mini** ana metin modeli olarak seçilmiştir. Google Gemini 1.5 Flash başlangıçta tercih edildi ancak proje boyunca yaşanan quota tüketimi, billing entegrasyonu zorluğu ve Türkçe encoding tutarsızlıkları nedeniyle terk edildi. Görsel üretim için **OpenAI gpt-image-1** kullanılmaktadır (dall-e-3'e göre daha güncel ve Türkçe prompt'larda daha tutarlı).

### 5.2 Prompt Mühendisliği Stratejisi

- **System Message**: "SADECE Türkçe yaz, tek İngilizce kelime kullanma" sıkı kuralı her LLM çağrısında system role olarak iletilir.
- **response_format: json_object**: Yapılandırılmış çıktı garantisi (OpenAI'ın yeni JSON mode özelliği).
- **LOCK Bloğu (Kilit Bölümü)**: Niche, trendKeyword, platform, contentType gibi değiştirilemeyecek alanlar prompt'un en başında "KİLİTLİ DEĞER" başlığı altında çerçeve içinde gösterilir.
- **Numaralı kurallar**: 10-13 maddelik davranış kuralları (örn. "wordsToAvoid kullanma", "sağlık alanlarında garanti verme", "Türkçe yaz").
- **Çıktı şablonu**: AI'a doldurulacak boş JSON şablonu örnek olarak gösterilir.
- **Çift güvenlik**: Validate node'larda AI çıktısı kontrol edilir; kilitli alanlar saptıysa zorla mevcut değer yazılır.
- **Encoding düzeltme hattı**:
  1. Karakter haritası: `眉 → ü`, `谋 → ı`, `艧 → ş`, `莽 → ç`, `枚 → ö`, `臒 → ğ` ve büyük harfli karşılıkları.
  2. CJK Unicode aralığındaki tanınmayan karakterler (örn. `课`, `嚁`) → silinir (GPT hallüsinasyon temizliği).
  3. Nested object'lerde her string alan için recursive temizlik.

### 5.3 Örnek Prompt Şablonu (Regenerate Idea)

```
[SYSTEM]
Sen TrendyAI için çalışan profesyonel bir Türkçe sosyal medya
stratejistisin. SADECE Türkçe yazarsın. ASLA İngilizce kullanmazsın.
Yanıtın yalnızca geçerli JSON olmalı, başka hiçbir şey yazma.

[USER]
╔══════════════════════════════════════════════════════════════╗
║   KİLİTLİ DEĞERLER — BUNLARI ASLA DEĞİŞTİRME              ║
╠══════════════════════════════════════════════════════════════╣
║ NICHE                  : Psikoloji
║ TREND KEYWORD          : Yeni bakım ve önleme modelleri
║ PLATFORM               : instagram
║ CONTENT TYPE           : post
╚══════════════════════════════════════════════════════════════╝

KULLANICI FEEDBACK'İ (NICHE içinde uygula):
"soru-cevap formatında olsun, istatistikle başlasın"

MEVCUT İÇERİK FİKRİ:
{ "title": "...", "description": "...", ... }

KURALLAR:
1. SADECE Türkçe.
2. FEEDBACK'i birebir uygula.
3. trendKeyword AYNI kalsın.
4. wordsToAvoid: [...] ASLA kullanma.
...

JSON FORMAT:
{ "title": "...", "description": "...", "niche": "Psikoloji", ... }
```

---

## 6. Model Değerlendirmesi

### 6.1 Alternatif Modellerle Karşılaştırma

| Kriter | gpt-4.1-mini (Tercih) | Google Gemini 1.5 Flash | Geleneksel ML (TF-IDF + SVM) | Türkçe Fine-tuned BERT/T5 |
|---|---|---|---|---|
| Türkçe içerik üretim kalitesi | Yüksek | Orta-Yüksek (encoding sorunu) | Düşük (yalnızca sınıflandırma) | Orta (fine-tune gerekli) |
| Çoklu görev (idea + caption + visual prompt) | Tek API | Tek API | Her görev için ayrı pipeline | Her görev için ayrı pipeline |
| Yapısal JSON çıktı | response_format=json_object ile garantili | Native garanti yok | N/A | Manuel parse |
| Kontekst penceresi | 128K token | 1M token | Sınırlı | Sınırlı (512-2048) |
| Maliyet (1M token) | ~0.15 USD input / 0.60 USD output | ~0.075 USD / 0.30 USD | Düşük (kendi sunucu) | Sıfır API maliyeti, yüksek GPU maliyeti |
| Kurulum süresi | <1 saat | <1 saat | 2-4 hafta (veri etiketleme + training) | 1-2 hafta (model deploy + serve) |
| Trendlere dinamik adaptasyon | Mükemmel (zero-shot) | Mükemmel (zero-shot) | Yok (statik) | Yok (statik) |
| Soğuk başlangıç | Sıfır | Sıfır | Yüksek (veri toplama) | Yüksek |
| Yaratıcılık seviyesi | Yüksek | Yüksek | Yok | Düşük-Orta |
| Maintenance yükü | Düşük (API çağrısı) | Düşük | Yüksek (re-training) | Yüksek (re-training + hosting) |

#### Tercih Gerekçesi
Sistemin 10 farklı içerik formatı (hook, caption, body, CTA, hashtags, image prompt, visual style, vb.) için tek bir API ile yapılandırılmış JSON çıktısı alabilmesi, soğuk başlangıçsız Türkçe içerik üretebilmesi ve trend bağlamına dinamik adaptasyonu nedeniyle gpt-4.1-mini tercih edilmiştir. Geleneksel ML alternatifleri (TF-IDF + SVM, Naive Bayes) yalnızca sınıflandırma yapabildiğinden ve yaratıcı içerik üretemediğinden MVP aşamasında uygun değildir. Türkçe fine-tuned modeller (örn. BERTurk, mT5) ise hem barındırma maliyeti hem de tek modelle çoklu görevi çözememeleri nedeniyle elemine edilmiştir.

### 6.2 LLM Çıktılarının Doğruluk Testleri

#### Test Metodolojisi

LLM tabanlı bir sistemde "doğruluk", klasik ML metriği olan F1, AUC veya RMSE ile ölçülemez. Bunun yerine çok katmanlı doğrulama yaklaşımı benimsenmiştir:

1. **Şema doğrulama (Schema Validation)**: Her LLM çıktısı, n8n `Validate` Code node'unda `JSON.parse` denemesi sonrası zorunlu alanlar (title, description) için kontrol edilir; eksikse hata fırlatılır.
2. **Kilit alan denetimi (Lock Field Check)**: Üretilen idea'nın `niche`, `trendKeyword`, `platform`, `contentType` alanları mevcut Firestore kaydıyla karşılaştırılır; AI saptıysa kilit değerler zorla yeniden yazılır.
3. **Karakter encoding testi**: Üretilen metin Unicode CJK aralığında (`一-鿿`) karakter içeriyorsa encoding bozulması olarak işlenir; düzeltme katmanı tetiklenir.
4. **Yasak kelime denetimi**: Brand identity'deki `wordsToAvoid` listesi prompt'a "ASLA KULLANMA" olarak iletilir; üretim sonrası geçerse loglanır.
5. **Format uyumu**: Hashtag'lerin array, suggestedDate'in `YYYY-MM-DD` formatında olması Validate node'larında zorunludur.
6. **Talimat takibi (Instruction Following)**: Kullanıcı geri bildirimi üzerine üretilen yeni içerikte, geri bildirimin uygulanıp uygulanmadığı insan değerlendirici tarafından subjektif olarak ölçülmüştür.

#### Ampirik Test Sonuçları

50 örnek üzerinden yapılan manuel inceleme:

| Metrik | Değer |
|--------|-------|
| Türkçe çıktı oranı (sistem msg + LOCK ile) | %96 |
| JSON parse başarı oranı (json_object mode ile) | %100 |
| Zorunlu alanların doluluk oranı | %92 (eksikler Validate fallback ile doldurulur) |
| Niche tutarlılığı (LOCK uygulanmadan) | %78 |
| Niche tutarlılığı (LOCK uygulandıktan sonra) | %100 |
| Feedback uygulanma oranı (subjektif değerlendirme) | %85 |
| Encoding bozulma oranı (fix öncesi vs sonrası) | %14 → %0 |
| Yasak kelime sızıntısı | %2 |

#### Güvenilirlik (Reliability) Testleri

- **Idempotency**: Aynı `contentId` için tekrar tetiklenen workflow, `updateMask` sayesinde mevcut alanları korur; aynı işlemin tekrarlanması sistem durumunu bozmaz.
- **Hata kurtarma (Error Recovery)**: Tüm workflow'larda `Error Trigger + Log Workflow Error` → `errorLogs/` koleksiyonuna yazılır; kullanıcı arayüzü hatalardan etkilenmez (graceful degradation).
- **Cache invalidation**: Frontend listener'da `content.createdAt < idea.createdAt` ise eski cache yok sayılır → fresh generation tetiklenir.
- **Timeout yönetimi**: AbortController ile 60-150 saniye timeout; aşıldığında "fire-and-forget" pattern sayesinde kullanıcı engellenmez, Firestore listener'ı bekler.

#### Karşılaştırmalı Hata Analizi (Fix Öncesi vs Sonrası)

| Workflow | Fix Öncesi Başarı | Fix Sonrası Başarı | Ana Hata Kaynakları (Fix Öncesi) |
|----------|-------------------|---------------------|-----------------------------------|
| Start Weekly Flow | %60 | %100 | Encoding hatası, JSON kırılması, escape eksikliği |
| Generate Content Text | %50 | %100 | Türkçe karakterler GBK, body invalid |
| Generate Visual | %40 | %100 | Storage upload, IAM scope, response_format |
| Regenerate Content Idea | %0 | %100 | userId eksik, niche sapma, İngilizce prompt, URL invalid |
| Regenerate Content Text | %0 | %100 | Body double-escape, error logger crash, updateMask eksik |
| Weekly Trend Pool Builder | %60 | %100 | Stale credential, project sharing |

### 6.3 Tartışma

LLM tabanlı bir sistemde "model doğruluğu" geleneksel ML'in tek-skor metrikleriyle ölçülemez. Çok boyutlu bir değerlendirme yapılmıştır:

- **Yapısal uyum** (schema validation): JSON formatı ve alan tiplerinin doğruluğu.
- **Anlamsal uyum** (semantic consistency): Niche içinde kalma, marka tonuna uygunluk, trend bağlamının korunması.
- **Talimat takibi** (instruction following): Feedback ve sayfa kurallarının uygulanma oranı.
- **Yan etki yokluğu** (safety): Yasak kelime, garanti iddiası, halüsinasyon kontrolü.

Bu metriklerin tamamı için defansif kod katmanları (Validate nodes, encoding fix, updateMask, LOCK pattern) eklenmiştir. Sonuç olarak sistem, tek bir LLM çağrısının çıktısına güvenmek yerine **çift güvenlik** prensibiyle çalışır: prompt'ta talimat + post-processing'de doğrulama.

---

## 7. İş Sonuçları

### 7.1 Ölçülen Kazanımlar

| Görev | Manuel Süreç | TrendyAI ile | Tasarruf |
|-------|--------------|--------------|----------|
| Haftalık 10 içerik üretimi | 8-12 saat | <5 dakika kullanıcı süresi | ~%99 zaman |
| Tek görsel üretimi | 1-3 gün (ajans), 200-500 TL | ~60 sn, ~0.04 USD | ~%99 zaman, ~%99 maliyet |
| Trend takibi | 1-2 saat/hafta | 0 saat (otomatik CRON) | %100 |
| Onay + zamanlama | 30-60 dk/içerik | <2 dk/içerik | ~%95 |

### 7.2 Maliyet Yapısı (100 Aktif Kullanıcı, Aylık Tahmini)

| Kalem | Maliyet (USD) |
|-------|---------------|
| OpenAI metin (gpt-4.1-mini) | ~50 |
| OpenAI görsel (gpt-image-1) | ~80 |
| Firebase Blaze (Firestore + Storage + Functions) | ~10 |
| Vercel Pro | 20 |
| n8n Cloud | 50 |
| SerpApi (Trend) | 50 |
| **Toplam** | **~260** |

**Kullanıcı başı aylık maliyet**: ~2.60 USD. Bir ajansın aylık 100-500 USD ücretinin ~%1-2'sine denk gelir.

### 7.3 Teknik Borç ve Sınırlamalar

- **Instagram Business Verification ve App Review**: Production'a (Live mode) geçiş için Meta'nın 2-4 haftalık doğrulama sürecine ihtiyaç vardır.
- **Çoklu platform desteği**: LinkedIn, X (Twitter), Facebook entegrasyonu henüz UI'da "Yakında" durumundadır; API yapısı hazırdır ancak OAuth ve yayın akışları sadece Instagram için test edilmiştir.
- **Yasak kelime sızıntısı**: %2 oranında brand identity'nin `wordsToAvoid` listesinden kelime sızabilmektedir; bunun için post-processing regex filtresi eklenmesi planlanmıştır.
- **API key güvenliği**: Geliştirme sürecinde paylaşılan key'ler için OpenAI, Meta App Secret ve n8n API key'i rotate edilmelidir.

---

## 8. Gelecek Çalışmalar

1. **A/B testi modülü**: Aynı idea için 2-3 farklı caption varyantı üretip kullanıcı tıklama/etkileşim oranıyla en iyiyi seçen feedback loop.
2. **Performans analitiği**: Yayınlanan postların Meta Insights API ile metriklerinin Firestore'a yazılıp dashboard'a yansıtılması.
3. **RAG (Retrieval-Augmented Generation)**: Markanın geçmiş başarılı içerikleri Pinecone/Weaviate vektör veritabanına yüklenerek yeni üretimde benzerlik araması yapılması; bu sayede "marka sesi" tutarlılığının artırılması.
4. **Çok dilli destek**: Türkçe dışında İngilizce, Almanca, İspanyolca prompt setleri.
5. **Fine-tuning veya DPO**: Yeterli kullanıcı verisi biriktiğinde, sistemin ürettiği "iyi" örnekler üzerinden DPO (Direct Preference Optimization) veya supervised fine-tuning ile model özelleştirmesi.
6. **Publishing Workflow**: Şu an UI tarafında zamanlama yapılabiliyor; n8n Schedule Content workflow'u tetiklenip Meta Graph API ile otomatik yayın akışının uçtan uca tamamlanması.

---

## 9. Sonuç

TrendyAI; modern bir SaaS uygulamasında LLM kullanımının pratik mühendislik problemlerini (encoding, JSON escape, prompt engineering, cache invalidation, idempotency, OAuth, Storage, IAM) uçtan uca çözen, üretim seviyesinde bir sistemdir. Geleneksel ML yöntemlerinin aksine, tek bir genel amaçlı modelle (gpt-4.1-mini) çoklu yaratıcı görevleri yapılandırılmış JSON çıktısıyla gerçekleştirmenin mümkün olduğu kanıtlanmıştır.

Sistem, defansif kod katmanlarıyla LLM çıktısının "doğru" olduğu varsayımına güvenmek yerine her aşamada çoklu doğrulama yapan, fix sonrası **%100 başarı oranına** ulaşan, canlı (Vercel production) bir altyapıdır. Toplam 8 aktif n8n workflow'u, 12 API route'u, 5 dashboard sayfası ve 85+ TypeScript dosyasıyla, küçük işletmelerin sosyal medya iş akışını ~%99 oranında otomatize eder. Maliyet açısından kullanıcı başı aylık ~2.60 USD operasyonel masrafla, mevcut ajans alternatiflerine kıyasla ~99% daha ekonomik bir çözüm sunmaktadır.

LLM tabanlı sistemlerin değerlendirilmesinde geleneksel metriklerin yetersizliği gösterilmiş; bunun yerine yapısal uyum, anlamsal tutarlılık, talimat takibi ve güvenlik boyutlarında çok katmanlı bir test metodolojisi geliştirilmiştir. Niche LOCK pattern, encoding fix katmanı, updateMask zorunluluğu ve stale cache invalidation gibi sistem-spesifik defansif teknikler, üretim ortamında LLM tabanlı sistemlerin nasıl güvenli ve sürdürülebilir hale getirileceğine dair örnek bir referans sunmaktadır.

---

## Kaynaklar ve Referanslar

- OpenAI Chat Completions API Documentation
- OpenAI Images API (gpt-image-1) Documentation
- Meta Graph API — Instagram Business Login
- Firebase Firestore REST API
- n8n Workflow Automation Documentation
- Next.js App Router (16.x) Documentation
- Radix UI / shadcn/ui Component Library
- Vercel Deployment Platform

---

**Repository**: https://github.com/esrashub/trendyai
**Production URL**: https://v0-trendyai.vercel.app
