"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  RefreshCw,
  Check,
  CalendarDays,
  Hash,
  Image as ImageIcon,
  Type,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ScheduleModal } from "@/components/modals/schedule-modal";
import { FeedbackModal } from "@/components/modals/feedback-modal";
import {
  getContentIdeaById,
  getGeneratedContent,
  subscribeToGeneratedContent,
  generateContent,
  regenerateText,
  regenerateVisual,
  approveText,
  approveVisual,
  scheduleContent,
} from "@/lib/api";
import type { ContentIdea, GeneratedContent } from "@/types";

/**
 * İçerik üretimi sayfası — Strateji 1: fire-and-forget + Firestore listener.
 *
 * Akış:
 *  1. ideaId ile contentIdeas/{ideaId} okunur
 *  2. generatedContents/{contentId} kontrol edilir (cache)
 *     - Varsa direkt göster
 *     - Yoksa generateContent() çağır (n8n tetiklenir)
 *  3. onSnapshot ile generatedContents/{contentId} dinlenir
 *     - n8n metni yazdığında UI güncellenir (status: text_generated)
 *     - n8n görseli yazdığında UI güncellenir (status: visual_generated)
 *  4. Onaylar Firestore'a direkt yazılır
 *  5. Programlama modalı schedule-content workflow'unu çağırır
 */
export default function ContentCreatePage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<ContentIdea | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isLoadingIdea, setIsLoadingIdea] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<
    "idle" | "starting" | "text" | "visual" | "done"
  >("idle");
  const [isRegeneratingText, setIsRegeneratingText] = useState(false);
  const [isRegeneratingVisual, setIsRegeneratingVisual] = useState(false);
  const [isApproving, setIsApproving] = useState<"text" | "visual" | null>(
    null
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Listener referansı — cleanup için
  const unsubRef = useRef<(() => void) | null>(null);

  // İlk yükleme: idea oku, mevcut içerik var mı bak, yoksa tetikle
  useEffect(() => {
    let cancelled = false;

    const loadIdeaAndContent = async () => {
      try {
        // 1. ContentIdea'yı Firestore'dan oku
        const fetchedIdea = await getContentIdeaById(ideaId);
        if (cancelled) return;

        if (!fetchedIdea) {
          setIsLoadingIdea(false);
          return;
        }
        setIdea(fetchedIdea);
        setIsLoadingIdea(false);

        // 2. Mevcut generatedContent var mı kontrol et (cache)
        const existing = await getGeneratedContent(ideaId);
        if (cancelled) return;

        if (existing) {
          setContent(existing);
          setGenerationStep(
            existing.visual?.imageUrl ? "done" : "visual"
          );
          // Hâlâ değişiklik gelebilir (örn. görsel henüz üretilmemişse), listener kur
          setupListener(existing.id);
        } else {
          // 3. Yoksa içerik üretimini başlat
          await startGeneration();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        console.error("[content-create] loadIdeaAndContent:", msg);
        if (!cancelled) {
          setErrorMessage(msg);
          setIsLoadingIdea(false);
        }
      }
    };

    const startGeneration = async () => {
      try {
        setIsGenerating(true);
        setGenerationStep("starting");
        const result = await generateContent(ideaId);
        if (cancelled) return;

        // n8n tetiklendi, listener'ı kur → Firestore'dan gelecek
        setGenerationStep("text");
        setupListener(result.contentId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "İçerik üretilemedi";
        console.error("[content-create] startGeneration:", msg);
        if (!cancelled) {
          setErrorMessage(msg);
          setIsGenerating(false);
          toast.error(msg);
        }
      }
    };

    const setupListener = (contentId: string) => {
      // Önceki listener varsa temizle
      if (unsubRef.current) {
        unsubRef.current();
      }
      unsubRef.current = subscribeToGeneratedContent(contentId, (c) => {
        if (cancelled) return;
        if (!c) return; // Henüz oluşmamış, beklemeye devam

        setContent(c);

        // Adımı status'a göre güncelle
        if (c.visual?.imageUrl) {
          setGenerationStep("done");
          setIsGenerating(false);
          setIsRegeneratingText(false);
          setIsRegeneratingVisual(false);
        } else if (c.text?.hook) {
          setGenerationStep("visual");
          setIsRegeneratingText(false);
          // İlk kez metin geldiyse otomatik görsel üretimi tetiklenmez
          // Kullanıcı "Onayla" sonrası görsel için ayrı buton kullanmalı
          // (n8n workflow'u textApproved kontrolü yapıyor)
        }
      });
    };

    loadIdeaAndContent();

    return () => {
      cancelled = true;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [ideaId]);

  const handleRegenerateText = async (feedback: string) => {
    if (!content) return;
    setIsRegeneratingText(true);
    setErrorMessage(null);
    try {
      await regenerateText(content.id, feedback);
      toast.success("Metin yeniden oluşturuluyor...");
      // Listener zaten güncel veriyi yakalayacak
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Metin yeniden oluşturulamadı";
      toast.error(msg);
      setIsRegeneratingText(false);
    }
  };

  const handleRegenerateVisual = async () => {
    if (!content) return;
    // n8n textApproved kontrolü yapıyor; emin olmak için frontend de kontrol etsin
    if (!content.textApproved) {
      toast.error(
        "Görsel üretimi için önce metnin onaylanması gerekiyor"
      );
      return;
    }
    setIsRegeneratingVisual(true);
    setErrorMessage(null);
    try {
      await regenerateVisual(content.id);
      toast.success("Görsel yeniden oluşturuluyor (30-60 sn sürebilir)...");
      // Listener güncellemeyi yakalayacak
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Görsel üretilemedi";
      toast.error(msg);
      setIsRegeneratingVisual(false);
    }
  };

  const handleApproveText = async () => {
    if (!content) return;
    setIsApproving("text");
    try {
      await approveText(content.id);
      toast.success("Metin onaylandı! Görsel üretimini başlatabilirsiniz.");
      // Listener content.textApproved = true alacak
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Metin onaylanamadı";
      toast.error(msg);
    } finally {
      setIsApproving(null);
    }
  };

  const handleApproveVisual = async () => {
    if (!content) return;
    setIsApproving("visual");
    try {
      await approveVisual(content.id);
      toast.success("Görsel onaylandı!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Görsel onaylanamadı";
      toast.error(msg);
    } finally {
      setIsApproving(null);
    }
  };

  const handleGenerateVisualFirstTime = async () => {
    if (!content) return;
    if (!content.textApproved) {
      toast.error("Önce metni onaylamalısınız");
      return;
    }
    setIsRegeneratingVisual(true);
    try {
      await regenerateVisual(content.id);
      toast.success("Görsel oluşturuluyor (30-60 sn)...");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Görsel üretilemedi";
      toast.error(msg);
      setIsRegeneratingVisual(false);
    }
  };

  const handleSchedule = async (data: {
    date: string;
    time: string;
    platform: string;
  }) => {
    if (!content) return;
    try {
      await scheduleContent(content.id, data);
      toast.success("İçerik paylaşım için programlandı!");
      router.push("/dashboard/calendar");
    } catch {
      toast.error("Programlama başarısız");
      throw new Error("Schedule failed");
    }
  };

  // Yüklenme — idea henüz okunmadı
  if (isLoadingIdea) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          İçerik fikri yükleniyor...
        </p>
      </div>
    );
  }

  // Fikir bulunamadı
  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">
          İçerik fikri bulunamadı
        </h2>
        <p className="mb-4 text-muted-foreground">
          Bu ID&apos;ye sahip bir içerik fikri mevcut değil.
        </p>
        <Button onClick={() => router.push("/dashboard/content-ideas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          İçerik Fikirlerine Dön
        </Button>
      </div>
    );
  }

  const isTextReady = !!content?.text?.hook;
  const isVisualReady = !!content?.visual?.imageUrl;
  const textApproved = content?.textApproved === true;
  const visualApproved = content?.visualApproved === true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/content-ideas")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            İçerik Oluşturma
          </h1>
          <p className="text-muted-foreground">
            Onaylanan fikir için metin ve görsel içerik oluşturun
          </p>
        </div>
      </div>

      {/* Idea Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Onaylanan Fikir Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className="text-sm text-muted-foreground">Başlık</p>
              <p className="font-medium">{idea.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <Badge variant="outline">{idea.platform}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarih</p>
              <p className="font-medium">{idea.suggestedDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Format</p>
              <Badge variant="outline">{idea.contentFormat}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trend</p>
              <p className="font-medium">{idea.trendKeyword}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hata mesajı */}
      {errorMessage && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Hata</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Yeniden Dene
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Üretim aşaması ekranı */}
      {(isGenerating || !isTextReady) && !errorMessage && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h3 className="mb-2 text-lg font-semibold">
              {generationStep === "starting" && "İçerik üretimi başlatılıyor..."}
              {generationStep === "text" && "Metin hazırlanıyor..."}
              {generationStep === "visual" && "Hazır, metin geldi..."}
              {generationStep === "done" && "Tamamlandı"}
              {generationStep === "idle" && "Bekleniyor..."}
            </h3>
            <p className="max-w-md text-center text-sm text-muted-foreground">
              AI içeriğinizi hazırlıyor. Bu işlem 30-60 saniye sürebilir.
              Sayfayı kapatabilirsiniz; sonuçlar Firestore&apos;a kaydediliyor.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-mono">
                status: {content?.status || generationStep}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metin + Görsel kartları */}
      {content && isTextReady && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Text Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Type className="h-5 w-5 text-primary" />
                Metin İçeriği
                {textApproved && (
                  <Badge className="bg-emerald-100 text-emerald-700 ml-2">
                    <Check className="mr-1 h-3 w-3" />
                    Onaylandı
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  Hook
                </p>
                <p className="rounded-lg bg-secondary/50 p-3 text-foreground">
                  {content.text.hook}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  Caption
                </p>
                <p className="rounded-lg bg-secondary/50 p-3 text-foreground">
                  {content.text.caption}
                </p>
              </div>
              {content.text.body && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    İçerik
                  </p>
                  <p className="whitespace-pre-wrap rounded-lg bg-secondary/50 p-3 text-foreground">
                    {content.text.body}
                  </p>
                </div>
              )}
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  CTA
                </p>
                <p className="rounded-lg bg-secondary/50 p-3 text-foreground">
                  {content.text.cta}
                </p>
              </div>
              {content.text.hashtags?.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    <Hash className="mr-1 inline h-4 w-4" />
                    Hashtag&apos;ler
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {content.text.hashtags.map((tag, i) => (
                      <Badge key={`${tag}-${i}`} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedbackModal(true)}
                  disabled={isRegeneratingText || textApproved}
                >
                  {isRegeneratingText ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Yeniden Oluştur (Feedback)
                </Button>
                <Button
                  size="sm"
                  onClick={handleApproveText}
                  disabled={textApproved || isApproving === "text"}
                >
                  {isApproving === "text" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Metni Onayla
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visual Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-primary" />
                Görsel İçerik
                {visualApproved && (
                  <Badge className="bg-emerald-100 text-emerald-700 ml-2">
                    <Check className="mr-1 h-3 w-3" />
                    Onaylandı
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Görsel önizleme */}
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Görsel Önizleme
                </p>
                {content.visual.imageUrl ? (
                  <div className="relative overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={content.visual.imageUrl}
                      alt={content.text.hook || "Üretilen görsel"}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ) : isRegeneratingVisual ? (
                  <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
                    <div className="text-center">
                      <Loader2 className="mx-auto mb-2 h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm font-medium">
                        Görsel üretiliyor...
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        DALL-E ile yaratılıyor (30-60 sn)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
                    <div className="text-center px-4">
                      <ImageIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        {textApproved
                          ? 'Görsel henüz üretilmedi. "Görsel Oluştur" butonuna basın.'
                          : "Görsel üretimi için önce metni onaylayın."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt detayları (görsel hazırsa) */}
              {content.visual.prompt && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Görsel Prompt
                  </p>
                  <p className="rounded-lg bg-secondary/50 p-3 text-xs text-foreground">
                    {content.visual.prompt}
                  </p>
                </div>
              )}
              {content.visual.designStyle && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Tasarım Stili
                  </p>
                  <Badge variant="outline">{content.visual.designStyle}</Badge>
                  {content.visual.aspectRatio && (
                    <Badge variant="outline" className="ml-2">
                      {content.visual.aspectRatio}
                    </Badge>
                  )}
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                {!isVisualReady ? (
                  <Button
                    size="sm"
                    onClick={handleGenerateVisualFirstTime}
                    disabled={!textApproved || isRegeneratingVisual}
                  >
                    {isRegeneratingVisual ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Görsel Oluştur
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateVisual}
                      disabled={isRegeneratingVisual || visualApproved}
                    >
                      {isRegeneratingVisual ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Yeniden Oluştur
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApproveVisual}
                      disabled={visualApproved || isApproving === "visual"}
                    >
                      {isApproving === "visual" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Görseli Onayla
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Button */}
      {content && isTextReady && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div>
              <h3 className="font-semibold text-foreground">
                İçeriğiniz hazır mı?
              </h3>
              <p className="text-sm text-muted-foreground">
                Metin ve görseli onayladıktan sonra paylaşım programlayabilirsiniz.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowScheduleModal(true)}
              disabled={!textApproved || !visualApproved}
            >
              <CalendarDays className="mr-2 h-5 w-5" />
              Paylaşım İçin Programla
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedule}
        defaultPlatform={idea.platform}
      />

      {/* Feedback Modal (regenerate text için) */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleRegenerateText}
        ideaTitle={idea.title}
      />
    </div>
  );
}
