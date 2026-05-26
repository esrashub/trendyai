"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Play,
  User,
  Building2,
  Link2,
  Calendar,
  Shield,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingStepper } from "@/components/layout/onboarding-stepper";
import {
  startWeeklyFlow,
  getBrandIdentity,
  getContentPreferences,
  getUserData,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { BrandIdentity, ContentPreferences, User as TUser } from "@/types";

export default function ReviewPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [isStarting, setIsStarting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const [brandData, setBrandData] = useState<BrandIdentity | null>(null);
  const [prefsData, setPrefsData] = useState<ContentPreferences | null>(null);
  const [userData, setUserData] = useState<TUser | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [brand, prefs, user] = await Promise.all([
          getBrandIdentity(),
          getContentPreferences(),
          getUserData(),
        ]);
        setBrandData(brand);
        setPrefsData(prefs);
        setUserData(user);
      } catch {
        // veri yüklenemezse fallback değerler gösterilir
      } finally {
        setDataLoading(false);
      }
    };
    loadAll();
  }, []);

  const loadingSteps = [
    "Trend analizi başlatılıyor...",
    "Marka kimliğinize uygun içerik fikirleri hazırlanıyor...",
    "Haftalık içerik takvimi oluşturuluyor...",
  ];

  const handleStartFlow = async () => {
    setIsStarting(true);
    setLoadingStep(0);

    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      await startWeeklyFlow();
      router.push("/dashboard/content-ideas");
    } catch {
      setIsStarting(false);
    }
  };

  const val = (v: string | undefined | null, fallback = "Belirtilmedi") =>
    v && v.trim() ? v : fallback;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <OnboardingStepper currentStep={5} />
      </div>

      {/* Başlatma Loading Overlay */}
      {isStarting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="mb-4 text-xl font-semibold">
                Haftalık Akış Başlatılıyor
              </h3>
              <div className="space-y-3">
                {loadingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                      index === loadingStep
                        ? "bg-primary/10 text-primary"
                        : index < loadingStep
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {index < loadingStep ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : index === loadingStep ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-current" />
                    )}
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Özet ve Başlat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Kullanıcı Bilgileri */}
            <div className="rounded-lg border border-border/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Kullanıcı Bilgileri</h3>
              </div>
              {dataLoading ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Ad Soyad:</span>{" "}
                    <span className="font-medium">{val(profile?.fullName)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{val(profile?.email)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Meslek:</span>{" "}
                    <span className="font-medium">{val(profile?.profession)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">İşletme Türü:</span>{" "}
                    <span className="font-medium">{val(userData?.businessType)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Marka Kimliği */}
            <div className="rounded-lg border border-border/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Marka Kimliği</h3>
              </div>
              {dataLoading ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : brandData ? (
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Marka Adı:</span>{" "}
                    <span className="font-medium">{val(brandData.brandName)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sektör:</span>{" "}
                    <span className="font-medium">{val(brandData.sector)}</span>
                  </div>
                  {brandData.brandVoice?.tones?.length > 0 && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Marka Tonu:</span>{" "}
                      <span className="font-medium">
                        {brandData.brandVoice.tones.join(", ")}
                      </span>
                    </div>
                  )}
                  {brandData.contentStrategy?.goals?.length > 0 && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">İçerik Hedefleri:</span>{" "}
                      <span className="font-medium">
                        {brandData.contentStrategy.goals.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Marka kimliği henüz doldurulmamış.{" "}
                  <button
                    className="text-primary underline"
                    onClick={() => router.push("/onboarding/brand-identity")}
                  >
                    Geri dön ve doldur
                  </button>
                </p>
              )}
            </div>

            {/* Bağlı Platformlar */}
            <div className="rounded-lg border border-border/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Bağlı Platformlar</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Platform bağlantıları OAuth 2.0 entegrasyonuyla yönetilecektir.
                Şimdilik içerik fikirleri tüm platformlar için oluşturulacaktır.
              </p>
            </div>

            {/* İçerik Tercihleri */}
            <div className="rounded-lg border border-border/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">İçerik Tercihleri</h3>
              </div>
              {dataLoading ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : prefsData ? (
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Sıklık:</span>{" "}
                    <span className="font-medium">
                      {val(prefsData.weeklyFrequency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Saat Aralığı:</span>{" "}
                    <span className="font-medium">
                      {val(prefsData.preferredTimeRange)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Günler:</span>{" "}
                    <span className="font-medium">
                      {prefsData.preferredDays?.length
                        ? prefsData.preferredDays.join(", ")
                        : "Belirtilmedi"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formatlar:</span>{" "}
                    <span className="font-medium">
                      {prefsData.contentFormats?.length
                        ? prefsData.contentFormats.join(", ")
                        : "Belirtilmedi"}
                    </span>
                  </div>
                  {prefsData.weeklyGoal && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Haftalık Hedef:</span>{" "}
                      <span className="font-medium">{prefsData.weeklyGoal}</span>
                    </div>
                  )}
                  {prefsData.specialCampaign && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">Özel Kampanya:</span>{" "}
                      <span className="font-medium">{prefsData.specialCampaign}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  İçerik tercihleri henüz doldurulmamış.{" "}
                  <button
                    className="text-primary underline"
                    onClick={() => router.push("/onboarding/content-preferences")}
                  >
                    Geri dön ve doldur
                  </button>
                </p>
              )}
            </div>

            {/* Güvenlik Notu */}
            <Alert className="border-primary/20 bg-primary/5">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Güvenlik Notu:</strong> Tüm verileriniz şifreli olarak
                saklanmaktadır. Platform bağlantılarınız OAuth 2.0 protokolü ile
                güvence altındadır.
              </AlertDescription>
            </Alert>

            {/* Otomasyon Notu */}
            <Alert className="border-emerald-200 bg-emerald-50">
              <Zap className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-sm text-emerald-800">
                <strong>Otomasyon Notu:</strong> Haftalık akışı başlattığınızda,
                AI sizin için trend analizi yapacak ve marka kimliğinize uygun
                içerik fikirleri oluşturacaktır. Bu fikirler onayınıza
                sunulacaktır.
              </AlertDescription>
            </Alert>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={() => router.push("/onboarding/content-preferences")}
                disabled={isStarting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
              <Button
                size="lg"
                onClick={handleStartFlow}
                disabled={isStarting || dataLoading}
                className="gap-2"
              >
                {isStarting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                Haftalık Akışı Başlat
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
