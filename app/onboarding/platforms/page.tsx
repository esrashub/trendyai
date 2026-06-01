"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Linkedin,
  Facebook,
  Link2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { OnboardingStepper } from "@/components/layout/onboarding-stepper";
import { saveConnectedPlatform, getConnectedPlatforms, disconnectPlatform } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type PlatformStatus = "disconnected" | "connecting" | "connected" | "expired";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: PlatformStatus;
  accountName?: string;
  profilePicture?: string;
  enabled: boolean;
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function PlatformsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{
    connected: string;
    data: string;
  } | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="h-6 w-6" />,
      description:
        "Instagram Business hesabınızı bağlayarak post, story ve reel içerikleri paylaşın.",
      status: "disconnected",
      enabled: true,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="h-6 w-6" />,
      description:
        "LinkedIn profilinizle profesyonel içerikler ve makaleler paylaşın.",
      status: "disconnected",
      enabled: false,
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: <XIcon />,
      description:
        "X hesabınızla kısa ve etkili içerikler, thread'ler paylaşın.",
      status: "disconnected",
      enabled: false,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="h-6 w-6" />,
      description:
        "Facebook sayfanızla geniş kitlelere ulaşın ve topluluk oluşturun.",
      status: "disconnected",
      enabled: true,
    },
  ]);

  // Wait for Firebase auth to be ready
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[v0] Auth state changed, user:", user?.uid);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load existing connections on mount
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const connections = await getConnectedPlatforms();
        if (connections.length > 0) {
          setPlatforms((prev) =>
            prev.map((p) => {
              const connection = connections.find((c) => c.platform === p.id);
              if (connection) {
                return {
                  ...p,
                  status: "connected" as PlatformStatus,
                  accountName: connection.username || connection.platformName,
                  profilePicture: connection.profileImage,
                };
              }
              return p;
            })
          );
        }
      } catch (error) {
        console.error("Failed to load connections:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadConnections();
  }, []);

  // Handle OAuth callback - store pending connection until auth is ready
  useEffect(() => {
    const connected = searchParams.get("connected");
    const data = searchParams.get("data");
    const error = searchParams.get("error");

    if (error) {
      const pages = searchParams.get("pages");
      const details = searchParams.get("details");
      const errorMessages: Record<string, string> = {
        invalid_state: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.",
        no_code: "Yetkilendirme kodu alınamadı.",
        token_exchange_failed: "Token alınamadı. Lütfen tekrar deneyin.",
        no_instagram_business: pages 
          ? `Instagram Business hesabı bulunamadı. Sayfalar: ${pages}. Instagram'ı bu sayfalardan birine Business hesabı olarak bağlayın.`
          : "Instagram Business hesabı bulunamadı. Instagram'ı bir Facebook sayfasına Business olarak bağlayın.",
        no_facebook_page: "Facebook sayfası bulunamadı. Lütfen yönetici olduğunuz bir Facebook sayfası oluşturun ve bağlantı sırasında izin verin.",
        access_denied: "Erişim reddedildi. Lütfen tüm izinleri onaylayın.",
        facebook_api_error: details 
          ? `Facebook API hatası: ${details}`
          : "Facebook API hatası. Lütfen tekrar deneyin.",
      };
      toast.error(errorMessages[error] || `Bağlantı hatası: ${error}`, {
        duration: 10000,
      });
      router.replace("/onboarding/platforms");
      return;
    }

    // If we have connection data, store it as pending until auth is ready
    if (connected && data) {
      console.log("[v0] Connection data received, storing as pending");
      setPendingConnection({ connected, data });
      // Clear URL params immediately to avoid re-processing
      router.replace("/onboarding/platforms");
    }
  }, [searchParams, router]);

  // Process pending connection once auth is ready
  useEffect(() => {
    if (!authReady || !pendingConnection) return;

    const { connected, data } = pendingConnection;
    console.log("[v0] Auth ready, processing pending connection for:", connected);

    try {
      const connectionData = JSON.parse(atob(data));
      
      saveConnectedPlatform(connectionData)
        .then(() => {
          console.log("[v0] Connection saved successfully");
          setPlatforms((prev) =>
            prev.map((p) =>
              p.id === connected
                ? {
                    ...p,
                    status: "connected" as PlatformStatus,
                    accountName: connectionData.accountName,
                    profilePicture: connectionData.profilePicture,
                  }
                : p
            )
          );
          toast.success(`${connectionData.accountName} başarıyla bağlandı!`);
        })
        .catch((err) => {
          console.error("[v0] Failed to save connection:", err);
          toast.error("Bağlantı kaydedilemedi. Lütfen tekrar deneyin.");
        })
        .finally(() => {
          setPendingConnection(null);
        });
    } catch (err) {
      console.error("[v0] Failed to parse connection data:", err);
      setPendingConnection(null);
    }
  }, [authReady, pendingConnection]);

  const handleConnect = (platformId: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId ? { ...p, status: "connecting" as PlatformStatus } : p
      )
    );
    window.location.href = `/api/auth/connect?platform=${platformId}`;
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      await disconnectPlatform(platformId);
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId
            ? { ...p, status: "disconnected" as PlatformStatus, accountName: undefined, profilePicture: undefined }
            : p
        )
      );
      toast.success("Platform bağlantısı kaldırıldı");
    } catch {
      toast.error("Bağlantı kaldırılamadı");
    }
  };

  const getStatusBadge = (status: PlatformStatus) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Bağlandı
          </Badge>
        );
      case "connecting":
        return (
          <Badge variant="secondary">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Bağlanıyor
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive">Token süresi doldu</Badge>
        );
      default:
        return <Badge variant="outline">Bağlı değil</Badge>;
    }
  };

  const connectedCount = platforms.filter((p) => p.status === "connected").length;

  const handleContinue = () => {
    setIsLoading(true);
    router.push("/onboarding/content-preferences");
  };

  if (isLoadingData || pendingConnection) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {pendingConnection && (
          <p className="text-sm text-muted-foreground">Bağlantı kaydediliyor...</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <OnboardingStepper currentStep={3} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Platform Bağlantıları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  Platformları bağlamak için OAuth 2.0 kullanılmaktadır. Bağla butonuna tıkladığınızda ilgili platformun yetkilendirme sayfasına yönlendirileceksiniz.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="border border-border/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        {platform.status === "connected" && platform.profilePicture ? (
                          <img
                            src={platform.profilePicture}
                            alt={platform.accountName}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-foreground">
                            {platform.icon}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{platform.name}</h3>
                            {getStatusBadge(platform.status)}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {platform.status === "connected" && platform.accountName
                              ? `@${platform.accountName}`
                              : platform.description}
                          </p>
                        </div>
                      </div>
                      <div>
                        {platform.status === "connected" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(platform.id)}
                          >
                            Bağlantıyı Kes
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(platform.id)}
                            disabled={platform.status === "connecting" || !platform.enabled}
                          >
                            {platform.status === "connecting" ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ExternalLink className="mr-2 h-4 w-4" />
                            )}
                            {!platform.enabled ? "Yakında" : "Bağla"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push("/onboarding/brand-identity")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri
                </Button>
                <Button onClick={handleContinue} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Devam Et
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-0 bg-primary/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Bağlantı Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{connectedCount}</p>
                <p className="text-sm text-muted-foreground">
                  Platform Bağlandı
                </p>
              </div>

              <div className="space-y-2">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between rounded-lg bg-background p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 text-muted-foreground">
                        {platform.icon}
                      </div>
                      <span className="text-sm">{platform.name}</span>
                    </div>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        platform.status === "connected"
                          ? "bg-emerald-500"
                          : "bg-border"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {connectedCount === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  En az bir platform bağlamanızı öneririz.
                </p>
              )}

              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-700">
                  Platform API&apos;ları için geliştirici hesapları ve uygulama onayları gereklidir.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PlatformsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PlatformsContent />
    </Suspense>
  );
}
