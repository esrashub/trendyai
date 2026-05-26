"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </Link>

        <h1 className="mb-8 text-4xl font-bold">Gizlilik Politikası</h1>
        <p className="mb-6 text-muted-foreground">
          Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold">1. Giriş</h2>
            <p className="text-muted-foreground">
              TrendyAI olarak, kullanıcılarımızın gizliliğine önem veriyoruz. Bu
              gizlilik politikası, hizmetlerimizi kullandığınızda hangi bilgileri
              topladığımızı, nasıl kullandığımızı ve koruduğumuzu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Topladığımız Bilgiler</h2>
            <p className="text-muted-foreground">
              Hizmetlerimizi kullandığınızda aşağıdaki bilgileri toplayabiliriz:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>Hesap Bilgileri:</strong> Ad, e-posta adresi, şifre
                (şifrelenmiş olarak saklanır)
              </li>
              <li>
                <strong>Profil Bilgileri:</strong> İş türü, sektör, marka bilgileri
              </li>
              <li>
                <strong>Platform Bağlantıları:</strong> Instagram, Facebook, LinkedIn,
                X (Twitter) hesaplarınızı bağladığınızda, bu platformlardan erişim
                token&apos;ları ve temel profil bilgileri
              </li>
              <li>
                <strong>İçerik Verileri:</strong> Oluşturduğunuz ve paylaştığınız
                içerikler
              </li>
              <li>
                <strong>Kullanım Verileri:</strong> Uygulama içi etkileşimler ve
                tercihler
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Bilgilerin Kullanımı</h2>
            <p className="text-muted-foreground">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Hesabınızı oluşturmak ve yönetmek</li>
              <li>Sosyal medya platformlarına içerik paylaşımı yapmak</li>
              <li>AI destekli içerik önerileri sunmak</li>
              <li>Hizmetlerimizi geliştirmek ve kişiselleştirmek</li>
              <li>Teknik destek sağlamak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Üçüncü Taraf Hizmetler</h2>
            <p className="text-muted-foreground">
              Uygulamamız aşağıdaki üçüncü taraf hizmetlerle entegre çalışmaktadır:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>Meta (Instagram/Facebook):</strong> İçerik paylaşımı için
                Meta Graph API kullanılmaktadır
              </li>
              <li>
                <strong>Firebase:</strong> Kimlik doğrulama ve veri depolama için
                kullanılmaktadır
              </li>
              <li>
                <strong>Google Gemini:</strong> AI içerik oluşturma için
                kullanılmaktadır
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Bu hizmetlerin kendi gizlilik politikaları bulunmaktadır ve verilerinizi
              kendi politikalarına göre işleyebilirler.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Veri Güvenliği</h2>
            <p className="text-muted-foreground">
              Verilerinizi korumak için endüstri standardı güvenlik önlemleri
              kullanıyoruz:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>SSL/TLS şifreleme</li>
              <li>Güvenli veri depolama (Firebase)</li>
              <li>Erişim token&apos;larının şifreli saklanması</li>
              <li>Düzenli güvenlik güncellemeleri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Veri Silme</h2>
            <p className="text-muted-foreground">
              Hesabınızı silmek istediğinizde, tüm kişisel verileriniz sistemimizden
              kalıcı olarak silinecektir. Platform bağlantılarınızı istediğiniz zaman
              kaldırabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Haklarınız</h2>
            <p className="text-muted-foreground">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Verilerinize erişim hakkı</li>
              <li>Verilerinizin düzeltilmesini isteme hakkı</li>
              <li>Verilerinizin silinmesini isteme hakkı</li>
              <li>Veri işlemeye itiraz etme hakkı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. İletişim</h2>
            <p className="text-muted-foreground">
              Gizlilik politikamız hakkında sorularınız varsa, bizimle iletişime
              geçebilirsiniz:
            </p>
            <p className="text-muted-foreground mt-2">
              E-posta: <a href="mailto:privacy@trendyai.com" className="text-primary hover:underline">privacy@trendyai.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Değişiklikler</h2>
            <p className="text-muted-foreground">
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli
              değişiklikler olduğunda sizi bilgilendireceğiz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
