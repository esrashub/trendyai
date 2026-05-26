"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Users,
  Mic2,
  Target,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { OnboardingStepper } from "@/components/layout/onboarding-stepper";
import { saveBrandIdentity, generateBrandSummary, getBrandIdentityFormData } from "@/lib/api";
import {
  toneOptions,
  communicationStyleOptions,
  contentGoalOptions,
  ctaOptions,
  visualStyleOptions,
  genderFocusOptions,
} from "@/lib/mock-data";
import type { BrandIdentityFormData } from "@/types";

const EMPTY_FORM: BrandIdentityFormData = {
  brandName: "",
  sector: "",
  description: "",
  websiteUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  targetAudienceDescription: "",
  ageRange: "",
  genderFocus: "",
  problems: "",
  expectations: "",
  tones: [],
  emotionalKeywords: "",
  wordsToAvoid: "",
  communicationStyle: "",
  goals: [],
  themes: "",
  ctaPreference: "",
  mainColors: "",
  visualStyle: "",
  designNotes: "",
};

export default function BrandIdentityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BrandIdentityFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Firebase'den verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getBrandIdentityFormData();
        if (data) {
          setFormData(data);
          if (data.aiSummary) {
            setAiSummary(data.aiSummary);
          }
        }
      } catch (error) {
        console.error("Marka kimliği yüklenemedi:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.brandName.trim()) e.brandName = "Marka adı gereklidir";
    if (!formData.sector.trim()) e.sector = "Sektör gereklidir";
    if (!formData.description.trim()) e.description = "Açıklama gereklidir";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key: keyof BrandIdentityFormData, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const toggleTone = (label: string) => {
    const tones = formData.tones.includes(label)
      ? formData.tones.filter((t) => t !== label)
      : [...formData.tones, label];
    set("tones", tones);
  };

  const toggleGoal = (label: string) => {
    const goals = formData.goals.includes(label)
      ? formData.goals.filter((g) => g !== label)
      : [...formData.goals, label];
    set("goals", goals);
  };

  const handleGenerateSummary = async () => {
    if (!formData.brandName.trim() || !formData.sector.trim()) {
      toast.error("Lütfen önce en azından marka adı ve sektörü doldurun.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateBrandSummary(formData);
      setAiSummary(result.summary);
      toast.success("AI marka özeti oluşturuldu!");
    } catch {
      toast.error("Özet oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await saveBrandIdentity({ ...formData, aiSummary: aiSummary ?? undefined });
      toast.success("Marka kimliği kaydedildi!");
    } catch {
      toast.error("Kaydetme başarısız");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await saveBrandIdentity({ ...formData, aiSummary: aiSummary ?? undefined });
      router.push("/onboarding/platforms");
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <OnboardingStepper currentStep={2} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Sol: Form ── */}
        <div className="space-y-6 lg:col-span-2">

          {/* A. Temel Bilgiler */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" />
                Temel Marka Bilgileri
              </CardTitle>
              <CardDescription>Marka adı, sektör ve iletişim linkleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Marka Adı *</Label>
                  <Input
                    placeholder="ör. Dyt. Ayşe Yılmaz"
                    value={formData.brandName}
                    onChange={(e) => set("brandName", e.target.value)}
                    className={errors.brandName ? "border-destructive" : ""}
                  />
                  {errors.brandName && (
                    <p className="text-xs text-destructive">{errors.brandName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Sektör / Niş *</Label>
                  <Input
                    placeholder="ör. Sağlık & Beslenme"
                    value={formData.sector}
                    onChange={(e) => set("sector", e.target.value)}
                    className={errors.sector ? "border-destructive" : ""}
                  />
                  {errors.sector && (
                    <p className="text-xs text-destructive">{errors.sector}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kısa Marka Açıklaması *</Label>
                <Textarea
                  placeholder="Markanızı ve sunduğunuz hizmeti kısaca açıklayın..."
                  value={formData.description}
                  rows={3}
                  onChange={(e) => set("description", e.target.value)}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input
                    placeholder="https://"
                    value={formData.websiteUrl ?? ""}
                    onChange={(e) => set("websiteUrl", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    placeholder="https://instagram.com/..."
                    value={formData.instagramUrl ?? ""}
                    onChange={(e) => set("instagramUrl", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinUrl ?? ""}
                    onChange={(e) => set("linkedinUrl", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* B. Hedef Kitle */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Hedef Kitle
              </CardTitle>
              <CardDescription>Müşterilerinizi ve onların ihtiyaçlarını tanımlayın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hedef Kitle Tanımı</Label>
                <Textarea
                  placeholder="Hedef kitlenizi açıklayın: Kim oldukları, ne istedikleri..."
                  value={formData.targetAudienceDescription}
                  rows={2}
                  onChange={(e) => set("targetAudienceDescription", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Yaş Aralığı</Label>
                  <Input
                    placeholder="ör. 25-45"
                    value={formData.ageRange}
                    onChange={(e) => set("ageRange", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cinsiyet Odağı</Label>
                  <Select
                    value={formData.genderFocus}
                    onValueChange={(v) => set("genderFocus", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderFocusOptions.map((o) => (
                        <SelectItem key={o.value} value={o.label}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Müşterilerin Ana Sorunları</Label>
                <Textarea
                  placeholder="Müşterilerinizin yaşadığı başlıca sorunları yazın..."
                  value={formData.problems}
                  rows={2}
                  onChange={(e) => set("problems", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Müşteri Beklentileri</Label>
                <Textarea
                  placeholder="Müşterilerinizin sizden beklentileri nelerdir?"
                  value={formData.expectations}
                  rows={2}
                  onChange={(e) => set("expectations", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* C. Marka Sesi */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic2 className="h-4 w-4 text-primary" />
                Marka Sesi
              </CardTitle>
              <CardDescription>Ton, dil ve iletişim tarzınızı belirleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ton Seçimi (çoklu seçim)</Label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((option) => {
                    const selected = formData.tones.includes(option.label);
                    return (
                      <Badge
                        key={option.value}
                        variant={selected ? "default" : "outline"}
                        className={`cursor-pointer select-none transition-colors ${
                          selected
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => toggleTone(option.label)}
                      >
                        {option.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Duygusal Anahtar Kelimeler</Label>
                  <Input
                    placeholder="ör. güven, sağlık, enerji, dönüşüm"
                    value={formData.emotionalKeywords}
                    onChange={(e) => set("emotionalKeywords", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kaçınılacak Kelimeler</Label>
                  <Input
                    placeholder="ör. ucuz, hızlı, mucize"
                    value={formData.wordsToAvoid}
                    onChange={(e) => set("wordsToAvoid", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>İletişim Tarzı</Label>
                <Select
                  value={formData.communicationStyle}
                  onValueChange={(v) => set("communicationStyle", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {communicationStyleOptions.map((o) => (
                      <SelectItem key={o.value} value={o.label}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* D. İçerik Stratejisi */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" />
                İçerik Stratejisi
              </CardTitle>
              <CardDescription>Hedeflerinizi, temalarınızı ve CTA tercihinizi belirleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ana İçerik Hedefleri (çoklu seçim)</Label>
                <div className="flex flex-wrap gap-2">
                  {contentGoalOptions.map((option) => {
                    const selected = formData.goals.includes(option.label);
                    return (
                      <Badge
                        key={option.value}
                        variant={selected ? "default" : "outline"}
                        className={`cursor-pointer select-none transition-colors ${
                          selected
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => toggleGoal(option.label)}
                      >
                        {option.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ana İçerik Temaları</Label>
                <Textarea
                  placeholder="ör. Sağlıklı tarifler, beslenme mitleri, mevsimsel öneriler..."
                  value={formData.themes}
                  rows={2}
                  onChange={(e) => set("themes", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Tercihi</Label>
                <Select
                  value={formData.ctaPreference}
                  onValueChange={(v) => set("ctaPreference", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {ctaOptions.map((o) => (
                      <SelectItem key={o.value} value={o.label}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* E. Görsel Kimlik */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-primary" />
                Görsel Kimlik
              </CardTitle>
              <CardDescription>Renk paleti, stil ve tasarım notları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
                  Logo yükleme — backend entegrasyonunda aktif olacak
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ana Renkler</Label>
                  <Input
                    placeholder="ör. Yeşil, beyaz, açık kahverengi"
                    value={formData.mainColors}
                    onChange={(e) => set("mainColors", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Görsel Stil</Label>
                  <Select
                    value={formData.visualStyle}
                    onValueChange={(v) => set("visualStyle", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {visualStyleOptions.map((o) => (
                        <SelectItem key={o.value} value={o.label}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tasarım Notları</Label>
                <Textarea
                  placeholder="Görsel yönünüz hakkında ek notlar..."
                  value={formData.designNotes}
                  rows={2}
                  onChange={(e) => set("designNotes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aksiyon Butonları */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/user-info")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </Button>
              <Button
                onClick={handleContinue}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Devam Et
              </Button>
            </div>
          </div>
        </div>

        {/* ── Sağ: AI Özet Kartı ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Buton Kartı */}
            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  AI Marka Kimliği Özeti
                </CardTitle>
                <CardDescription>
                  Formu doldurun ve AI'nın markanızı analiz etmesini sağlayın.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analiz ediliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Marka Özeti Oluştur
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Loading Skeleton */}
            {isGenerating && (
              <Card className="border-0 shadow-lg">
                <CardContent className="space-y-4 pt-6">
                  {[
                    "Marka Kişiliği",
                    "Hedef Kitle",
                    "Marka Tonu",
                    "İçerik Dili",
                    "İçerik Hedefleri",
                    "Görsel Yön",
                  ].map((label) => (
                    <div key={label} className="space-y-1">
                      <p className="text-xs font-semibold text-primary">{label}</p>
                      <div className="h-3 w-full animate-pulse rounded bg-muted" />
                      <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Özeti */}
            {!isGenerating && aiSummary && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                    </div>
                    <CardTitle className="text-sm">Marka Özeti</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiSummary.split("\n\n").map((paragraph, i) => {
                    const colonIdx = paragraph.indexOf(":**");
                    if (colonIdx === -1) return null;
                    const label = paragraph.slice(0, colonIdx).replace(/\*\*/g, "").trim();
                    const content = paragraph.slice(colonIdx + 3).trim();
                    return (
                      <div key={i} className="space-y-0.5">
                        <p className="text-xs font-semibold text-primary">{label}</p>
                        <p className="text-sm leading-relaxed text-foreground">
                          {content}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isGenerating && !aiSummary && (
              <Card className="border border-dashed shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Formu doldurun ve butona basın — AI markanızı analiz edecek.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
