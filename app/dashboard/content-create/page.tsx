"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  PenTool,
  Lightbulb,
  Instagram,
  Linkedin,
  Facebook,
  FileImage,
  Type,
  CheckCircle2,
  Clock,
  CalendarDays,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllGeneratedContents } from "@/lib/api";
import type { GeneratedContent } from "@/types";

const platformIcon = (platform: string) => {
  const p = (platform || "").toLowerCase();
  if (p.includes("instagram")) return Instagram;
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("facebook")) return Facebook;
  return FileImage;
};

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  text_generated: {
    label: "Metin hazır",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  visual_generated: {
    label: "Görsel hazır",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  scheduled: {
    label: "Programlandı",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  published: {
    label: "Yayında",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  failed: {
    label: "Başarısız",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export default function ContentCreateIndexPage() {
  const router = useRouter();
  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getAllGeneratedContents();
        if (!cancelled) setItems(data);
      } catch (err) {
        console.error("[content-create index] load failed:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleContinue = (content: GeneratedContent) => {
    // contentId formatı: content_{ideaId} → ideaId'yi çıkar
    const ideaId = content.id.replace(/^content_/, "");
    router.push(`/dashboard/content-create/${ideaId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">İçerikler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            <PenTool className="mr-2 inline h-7 w-7 text-primary" />
            İçerik Oluşturma
          </h1>
          <p className="text-muted-foreground">
            Üzerinde çalıştığın içerikler burada listelenir
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/content-ideas")}>
          <Lightbulb className="mr-2 h-4 w-4" />
          İçerik Fikirlerinden Başla
        </Button>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Henüz oluşturduğun bir içerik yok
            </h3>
            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
              İçerik üretmeye başlamak için önce bir fikir seçmelisin. İçerik
              Fikirleri sayfasında onayladığın bir fikre tıkla ve metin + görsel
              üretimini başlat.
            </p>
            <Button onClick={() => router.push("/dashboard/content-ideas")}>
              <Lightbulb className="mr-2 h-4 w-4" />
              İçerik Fikirlerine Git
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* İstatistik özet */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Toplam İçerik</p>
                <p className="mt-1 text-2xl font-bold">{items.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Metin Hazır</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {items.filter((c) => c.text?.hook && !c.visual?.imageUrl).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Görsel Hazır</p>
                <p className="mt-1 text-2xl font-bold text-purple-600">
                  {items.filter((c) => c.visual?.imageUrl).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Tamamlandı</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {items.filter((c) => c.textApproved && c.visualApproved).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Liste */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((content) => {
              const PlatformIcon = platformIcon(content.platform);
              const isTextReady = !!content.text?.hook;
              const isVisualReady = !!content.visual?.imageUrl;
              const status =
                statusConfig[content.status] || {
                  label: content.status || "Bilinmiyor",
                  className: "bg-gray-100 text-gray-700 border-gray-200",
                };

              return (
                <Card
                  key={content.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => handleContinue(content)}
                >
                  {/* Görsel önizleme veya placeholder */}
                  {isVisualReady ? (
                    <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={content.visual.imageUrl}
                        alt={content.text?.hook || "Görsel"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-t-lg bg-gradient-to-br from-primary/5 to-primary/15">
                      <FileImage className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-base">
                        {content.text?.hook || "Henüz metin yok"}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`shrink-0 ${status.className}`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Caption preview */}
                    {content.text?.caption && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {content.text.caption}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <PlatformIcon className="h-3 w-3" />
                        <span className="capitalize">{content.platform}</span>
                      </div>
                      {content.contentType && (
                        <>
                          <span>•</span>
                          <span>{content.contentType}</span>
                        </>
                      )}
                      {content.updatedAt && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(content.updatedAt).toLocaleDateString(
                              "tr-TR",
                              { day: "numeric", month: "short" }
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Onay durumu */}
                    <div className="flex gap-2 border-t pt-3">
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          content.textApproved
                            ? "text-emerald-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {content.textApproved ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Type className="h-3.5 w-3.5" />
                        )}
                        Metin
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          content.visualApproved
                            ? "text-emerald-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {content.visualApproved ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <FileImage className="h-3.5 w-3.5" />
                        )}
                        Görsel
                      </div>
                      {content.status === "scheduled" && (
                        <div className="ml-auto flex items-center gap-1 text-xs text-emerald-700">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Programlı
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinue(content);
                      }}
                    >
                      {!isTextReady
                        ? "Üretime Devam Et"
                        : !isVisualReady
                          ? "Görsel Üret"
                          : !content.textApproved || !content.visualApproved
                            ? "Onayla"
                            : "Görüntüle"}
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
