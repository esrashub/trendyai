"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ScheduleModal } from "@/components/modals/schedule-modal";
import {
  generateContent,
  regenerateText,
  regenerateVisual,
  approveText,
  approveVisual,
  scheduleContent,
} from "@/lib/api";
import { mockContentIdeas, mockGeneratedContent } from "@/lib/mock-data";
import type { ContentIdea, GeneratedContent } from "@/types";

export default function ContentCreatePage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<ContentIdea | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingText, setIsRegeneratingText] = useState(false);
  const [isRegeneratingVisual, setIsRegeneratingVisual] = useState(false);
  const [textApproved, setTextApproved] = useState(false);
  const [visualApproved, setVisualApproved] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Find the idea from mock data
      const foundIdea = mockContentIdeas.find((i) => i.id === ideaId);
      if (foundIdea) {
        setIdea(foundIdea);
        // Simulate content generation
        setIsGenerating(true);
        try {
          const result = await generateContent(ideaId);
          setContent(result.content);
        } catch {
          // Use mock content as fallback
          setContent(mockGeneratedContent);
        } finally {
          setIsGenerating(false);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [ideaId]);

  const handleRegenerateText = async () => {
    if (!content) return;
    setIsRegeneratingText(true);
    setTextApproved(false);
    try {
      const result = await regenerateText(content.id);
      setContent(result.content);
      toast.success("Metin yeniden oluşturuldu!");
    } catch {
      toast.error("Metin yeniden oluşturulamadı");
    } finally {
      setIsRegeneratingText(false);
    }
  };

  const handleRegenerateVisual = async () => {
    if (!content) return;
    setIsRegeneratingVisual(true);
    setVisualApproved(false);
    try {
      const result = await regenerateVisual(content.id);
      setContent(result.content);
      toast.success("Görsel yeniden oluşturuldu!");
    } catch {
      toast.error("Görsel yeniden oluşturulamadı");
    } finally {
      setIsRegeneratingVisual(false);
    }
  };

  const handleApproveText = async () => {
    if (!content) return;
    try {
      await approveText(content.id);
      setTextApproved(true);
      toast.success("Metin onaylandı!");
    } catch {
      toast.error("Metin onaylanamadı");
    }
  };

  const handleApproveVisual = async () => {
    if (!content) return;
    try {
      await approveVisual(content.id);
      setVisualApproved(true);
      toast.success("Görsel onaylandı!");
    } catch {
      toast.error("Görsel onaylanamadı");
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

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="mb-2 text-xl font-semibold">İçerik fikri bulunamadı</h2>
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
          <h1 className="text-2xl font-bold text-foreground">İçerik Oluşturma</h1>
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

      {isGenerating ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h3 className="mb-2 text-lg font-semibold">İçerik Oluşturuluyor</h3>
            <p className="text-sm text-muted-foreground">
              AI içeriğinizi hazırlıyor, lütfen bekleyin...
            </p>
          </CardContent>
        </Card>
      ) : content ? (
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
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  İçerik
                </p>
                <p className="whitespace-pre-wrap rounded-lg bg-secondary/50 p-3 text-foreground">
                  {content.text.body}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  CTA
                </p>
                <p className="rounded-lg bg-secondary/50 p-3 text-foreground">
                  {content.text.cta}
                </p>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  <Hash className="mr-1 inline h-4 w-4" />
                  Hashtag&apos;ler
                </p>
                <div className="flex flex-wrap gap-2">
                  {content.text.hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateText}
                  disabled={isRegeneratingText}
                >
                  {isRegeneratingText ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Yeniden Oluştur
                </Button>
                <Button
                  size="sm"
                  onClick={handleApproveText}
                  disabled={textApproved}
                >
                  <Check className="mr-2 h-4 w-4" />
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
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  Görsel Prompt
                </p>
                <p className="rounded-lg bg-secondary/50 p-3 text-sm text-foreground">
                  {content.visual.prompt}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  Tasarım Stili
                </p>
                <Badge variant="outline">{content.visual.designStyle}</Badge>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Görsel Önizleme
                </p>
                <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Görsel önizleme alanı
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (Canva/AI görsel entegrasyonu eklenecek)
                    </p>
                  </div>
                </div>
              </div>
              {content.visual.canvaUrl && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Canva Tasarım
                  </p>
                  <a
                    href={content.visual.canvaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Canva&apos;da Düzenle
                  </a>
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateVisual}
                  disabled={isRegeneratingVisual}
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
                  disabled={visualApproved}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Görseli Onayla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Schedule Button */}
      {content && (
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
    </div>
  );
}
