"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </Link>

        <h1 className="mb-8 text-4xl font-bold">Kullanım Koşulları</h1>
        <p className="mb-6 text-muted-foreground">
          Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold">1. Kabul</h2>
            <p className="text-muted-foreground">
              TrendyAI hizmetlerini kullanarak, bu kullanım koşullarını kabul etmiş
              olursunuz. Bu koşulları kabul etmiyorsanız, lütfen hizmetlerimizi
              kullanmayınız.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Hizmet Tanımı</h2>
            <p className="text-muted-foreground">
              TrendyAI, yapay zeka destekli sosyal medya içerik yönetimi platformudur.
              Hizmetlerimiz şunları içerir:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>AI destekli içerik oluşturma</li>
              <li>Sosyal medya platformlarına içerik paylaşımı</li>
              <li>İçerik planlama ve takvim yönetimi</li>
              <li>Marka kimliği yönetimi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Hesap Sorumlulukları</h2>
            <p className="text-muted-foreground">Kullanıcı olarak:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Doğru ve güncel bilgiler sağlamakla yükümlüsünüz</li>
              <li>Hesap güvenliğinizden siz sorumlusunuz</li>
              <li>Hesabınızdaki tüm aktivitelerden siz sorumlusunuz</li>
              <li>Şüpheli aktiviteleri derhal bildirmelisiniz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Platform Bağlantıları</h2>
            <p className="text-muted-foreground">
              Sosyal medya hesaplarınızı bağladığınızda:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                Bu platformların kendi kullanım koşullarına uymakla yükümlüsünüz
              </li>
              <li>Bağlantı izinlerini istediğiniz zaman kaldırabilirsiniz</li>
              <li>
                Platform API değişikliklerinden kaynaklanan kesintilerden sorumlu
                değiliz
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. İçerik Politikası</h2>
            <p className="text-muted-foreground">
              Platformumuz üzerinden paylaştığınız içerikler:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Yasalara uygun olmalıdır</li>
              <li>Üçüncü taraf haklarını ihlal etmemelidir</li>
              <li>Spam veya zararlı içerik içermemelidir</li>
              <li>Nefret söylemi veya şiddet içermemelidir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. AI İçerik Oluşturma</h2>
            <p className="text-muted-foreground">
              AI tarafından oluşturulan içerikler için:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                İçerikleri paylaşmadan önce kontrol etmek sizin sorumluluğunuzdadır
              </li>
              <li>AI önerileri sadece tavsiye niteliğindedir</li>
              <li>Oluşturulan içeriklerin doğruluğunu garanti etmiyoruz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Fikri Mülkiyet</h2>
            <p className="text-muted-foreground">
              TrendyAI platformu, logoları ve içerikleri fikri mülkiyet hakları ile
              korunmaktadır. Kullanıcılar tarafından oluşturulan içeriklerin hakları
              kullanıcılara aittir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Sorumluluk Sınırı</h2>
            <p className="text-muted-foreground">
              TrendyAI, hizmetlerin kesintisiz veya hatasız olacağını garanti etmez.
              Platform kullanımından kaynaklanan doğrudan veya dolaylı zararlardan
              sorumlu değiliz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Hesap Sonlandırma</h2>
            <p className="text-muted-foreground">
              Kullanım koşullarının ihlali durumunda hesabınızı askıya alma veya
              sonlandırma hakkını saklı tutarız. Hesabınızı istediğiniz zaman
              silebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">10. Değişiklikler</h2>
            <p className="text-muted-foreground">
              Bu koşulları önceden bildirmeksizin değiştirme hakkını saklı tutarız.
              Önemli değişiklikler e-posta ile bildirilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">11. İletişim</h2>
            <p className="text-muted-foreground">
              Sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <p className="text-muted-foreground mt-2">
              E-posta: <a href="mailto:support@trendyai.com" className="text-primary hover:underline">support@trendyai.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
