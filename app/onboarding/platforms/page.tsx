"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Linkedin,
  Facebook,
  Link2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { OnboardingStepper } from "@/components/layout/onboarding-stepper";
import { connectPlatform } from "@/lib/api";

type PlatformStatus = "disconnected" | "connecting" | "connected" | "expired";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: PlatformStatus;
  accountName?: string;
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function PlatformsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="h-6 w-6" />,
      description:
        "Instagram hesabınızı bağlayarak post, story ve reel içerikleri paylaşın.",
      status: "disconnected",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="h-6 w-6" />,
      description:
        "LinkedIn profilinizle profesyonel içerikler ve makaleler paylaşın.",
      status: "disconnected",
    },
    {
      id: "x",
      name: "X (Twitter)",
      icon: <XIcon />,
      description:
        "X hesabınızla kısa ve etkili içerikler, thread'ler paylaşın.",
      status: "disconnected",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="h-6 w-6" />,
      description:
        "Facebook sayfanızla geniş kitlelere ulaşın ve topluluk oluşturun.",
      status: "disconnected",
    },
  ]);

  const handleConnect = async (platformId: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId ? { ...p, status: "connecting" as PlatformStatus } : p
      )
    );

    try {
      const result = await connectPlatform(platformId);
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId
            ? {
                ...p,
                status: "connected" as PlatformStatus,
                accountName: result.account.accountName,
              }
            : p
        )
      );
      toast.success(`${platformId} başarıyla bağlandı!`);
    } catch {
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId ? { ...p, status: "disconnected" as PlatformStatus } : p
        )
      );
      toast.error("Bağlantı başarısız");
    }
  };

  const handleDisconnect = (platformId: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === platformId
          ? { ...p, status: "disconnected" as PlatformStatus, accountName: undefined }
          : p
      )
    );
    toast.success("Platform bağlantısı kaldırıldı");
  };

  const getStatusBadge = (status: PlatformStatus) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
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

  return (
    <div className="mx-auto max-w-6xl">
      {/* Stepper */}
      <div className="mb-8">
        <OnboardingStepper currentStep={3} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Platforms */}
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
                  Gerçek platform bağlantıları OAuth 2.0 ile yapılacak, access
                  token bilgileri backend tarafında şifreli olarak saklanacaktır.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="border border-border/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-foreground">
                          {platform.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{platform.name}</h3>
                            {getStatusBadge(platform.status)}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {platform.status === "connected" && platform.accountName
                              ? platform.accountName
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
                            disabled={platform.status === "connecting"}
                          >
                            {platform.status === "connecting" ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {platform.name} Bağla
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
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

        {/* Summary Card */}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
