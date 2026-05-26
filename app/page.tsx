import Link from "next/link";
import {
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
  Share2,
  MessageSquare,
  CalendarDays,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { FeatureCard } from "@/components/cards/feature-card";

const features = [
  {
    icon: Target,
    title: "Marka Kimliği Yönetimi",
    description:
      "Marka sesinizi, hedef kitlenizi ve içerik stratejinizi tanımlayın. AI, tüm içeriklerinizi markanıza uygun şekilde oluştursun.",
  },
  {
    icon: TrendingUp,
    title: "Trend Analizi",
    description:
      "Sektörünüzdeki güncel trendleri takip edin. AI, en popüler konuları bulup size özel içerik fikirleri sunsun.",
  },
  {
    icon: Wand2,
    title: "AI Destekli İçerik Üretimi",
    description:
      "Metin ve görsel içeriklerinizi AI ile saniyeler içinde oluşturun. Hook, caption, hashtag ve görsel önerileri hazır.",
  },
  {
    icon: Share2,
    title: "Platform Bazlı Optimizasyon",
    description:
      "Instagram, LinkedIn, X ve Facebook için optimize edilmiş içerikler. Her platform için en uygun format ve ton.",
  },
  {
    icon: MessageSquare,
    title: "Onay ve Feedback Akışı",
    description:
      "İçerik fikirlerini onaylayın, reddedin veya feedback verin. AI, geri bildirimlerinize göre yeniden oluştursun.",
  },
  {
    icon: CalendarDays,
    title: "İçerik Takvimi",
    description:
      "Tüm içeriklerinizi tek bir takvimde görün ve yönetin. Otomatik zamanlama ile paylaşımlarınız zamanında yayınlansın.",
  },
];

const steps = [
  {
    number: "01",
    title: "Marka Kimliğinizi Tanımlayın",
    description:
      "Sektörünüz, hedef kitleniz, marka tonunuz ve içerik stratejinizi belirleyin. AI, markanızı tanısın.",
  },
  {
    number: "02",
    title: "Haftalık Akışı Başlatın",
    description:
      "Tek tıkla haftalık içerik akışınızı başlatın. AI, trend analizi yaparak size özel içerik fikirleri hazırlasın.",
  },
  {
    number: "03",
    title: "İçerikleri Onaylayıp Planlayın",
    description:
      "Fikirleri inceleyin, içerikleri onaylayın ve takvime ekleyin. Gerisini TrendyAI halletsin.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-background to-emerald-50/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent" />

        <div className="container relative mx-auto px-4 py-20 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI Destekli İçerik Otomasyonu
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                AI ile Sosyal Medya İçeriklerinizi{" "}
                <span className="text-primary">Otomatikleştirin</span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground text-pretty">
                Marka kimliğinizi tanımlayın, sosyal medya platformlarınızı seçin
                ve TrendyAI sizin için trend bazlı içerik fikirleri, gönderi
                metinleri ve görsel önerileri oluştursun.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/register">
                    Ücretsiz Hesap Oluştur
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#nasil-calisir">Nasıl Çalışır?</a>
                </Button>
              </div>
            </div>

            {/* Right - Dashboard Preview Card */}
            <div className="relative lg:pl-8">
              <Card className="border-0 bg-card shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      Dashboard Özeti
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      Canlı
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Toplam İçerik
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        128
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Marka Profili
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        1
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Bu Hafta
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        12
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Onay Bekleyen
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        5
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Decorative Elements */}
              <div className="absolute -right-4 -top-4 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="ozellikler" className="border-t border-border/40 bg-secondary/30 py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl text-balance">
              Tek platformda tüm sosyal medya içerikleriniz
            </h2>
            <p className="text-lg text-muted-foreground">
              TrendyAI ile içerik üretim sürecinizi baştan sona otomatikleştirin.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="nasil-calisir" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              3 adımda profesyonel içerikler
            </h2>
            <p className="text-lg text-muted-foreground">
              Basit ve hızlı bir şekilde içerik üretimine başlayın.
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-border md:block" />
                  )}
                  <div className="relative flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                      {step.number}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-primary py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
              Sosyal medya içeriklerinizi otomatikleştirin
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Hemen ücretsiz hesap oluşturun ve TrendyAI ile içerik üretmeye
              başlayın.
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="gap-2"
            >
              <Link href="/register">
                Hemen Başla
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">TrendyAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TrendyAI. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
