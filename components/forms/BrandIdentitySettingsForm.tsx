"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Pencil, Save, X, Plus, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BrandIdentity } from "@/types";
import { updateBrandIdentity, createBrandIdentityIfMissing } from "@/lib/api";
import {
  toneOptions,
  communicationStyleOptions,
  contentGoalOptions,
  ctaOptions,
  visualStyleOptions,
  genderFocusOptions,
} from "@/lib/mock-data";

const BLANK_BRAND: BrandIdentity = {
  id: "",
  userId: "",
  brandName: "",
  sector: "",
  description: "",
  websiteUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  targetAudience: {
    description: "",
    ageRange: "",
    genderFocus: "",
    problems: "",
    expectations: "",
  },
  brandVoice: {
    tones: [],
    emotionalKeywords: "",
    wordsToAvoid: "",
    communicationStyle: "",
  },
  contentStrategy: {
    goals: [],
    themes: "",
    ctaPreference: "",
  },
  visualIdentity: {
    mainColors: "",
    visualStyle: "",
    designNotes: "",
  },
  createdAt: "",
};

interface Props {
  initialData: BrandIdentity | null;
}

export function BrandIdentitySettingsForm({ initialData }: Props) {
  const [saved, setSaved] = useState<BrandIdentity | null>(initialData);
  const [draft, setDraft] = useState<BrandIdentity | null>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = () => {
    setDraft(saved);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(saved);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const fn = saved ? updateBrandIdentity : createBrandIdentityIfMissing;
      const result = await fn(draft);
      setSaved(result.brand);
      setDraft(result.brand);
      setIsEditing(false);
      setIsCreating(false);
      toast.success("Firma / marka bilgileri başarıyla güncellendi.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast.error(`Güncelleme başarısız: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartCreate = () => {
    setDraft({ ...BLANK_BRAND });
    setIsCreating(true);
    setIsEditing(true);
  };

  const toggleTone = (label: string) => {
    if (!draft) return;
    const tones = draft.brandVoice.tones.includes(label)
      ? draft.brandVoice.tones.filter((t) => t !== label)
      : [...draft.brandVoice.tones, label];
    setDraft({ ...draft, brandVoice: { ...draft.brandVoice, tones } });
  };

  const toggleGoal = (label: string) => {
    if (!draft) return;
    const goals = draft.contentStrategy.goals.includes(label)
      ? draft.contentStrategy.goals.filter((g) => g !== label)
      : [...draft.contentStrategy.goals, label];
    setDraft({ ...draft, contentStrategy: { ...draft.contentStrategy, goals } });
  };

  if (!saved && !isCreating) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-2 text-lg font-semibold">
            Henüz firma / marka bilgisi eklenmemiş.
          </h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Marka kimliği bilgileri içerik üretimi ve AI önerileri için
            kullanılır.
          </p>
          <Button onClick={handleStartCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Marka Bilgisi Ekle
          </Button>
        </CardContent>
      </Card>
    );
  }

  const d = draft!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Bilgileri düzenleyip kaydedin."
            : "Marka kimliği bilgilerinizi görüntüleyin ve düzenleyin."}
        </p>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          )}
        </div>
      </div>

      {/* Temel Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Temel Bilgiler</CardTitle>
          <CardDescription>Marka adı, sektör ve kısa açıklama</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Marka Adı</Label>
              <Input
                value={d.brandName}
                disabled={!isEditing}
                onChange={(e) => setDraft({ ...d, brandName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sektör / Niş</Label>
              <Input
                value={d.sector}
                disabled={!isEditing}
                onChange={(e) => setDraft({ ...d, sector: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kısa Açıklama</Label>
            <Textarea
              value={d.description}
              disabled={!isEditing}
              rows={3}
              onChange={(e) => setDraft({ ...d, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                value={d.websiteUrl ?? ""}
                disabled={!isEditing}
                placeholder="https://"
                onChange={(e) => setDraft({ ...d, websiteUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input
                value={d.instagramUrl ?? ""}
                disabled={!isEditing}
                placeholder="https://instagram.com/..."
                onChange={(e) =>
                  setDraft({ ...d, instagramUrl: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={d.linkedinUrl ?? ""}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/..."
                onChange={(e) =>
                  setDraft({ ...d, linkedinUrl: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hedef Kitle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hedef Kitle</CardTitle>
          <CardDescription>Hedef kitlenizi tanımlayın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Hedef Kitle Tanımı</Label>
            <Textarea
              value={d.targetAudience.description}
              disabled={!isEditing}
              rows={2}
              onChange={(e) =>
                setDraft({
                  ...d,
                  targetAudience: {
                    ...d.targetAudience,
                    description: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Yaş Aralığı</Label>
              <Input
                value={d.targetAudience.ageRange}
                disabled={!isEditing}
                placeholder="ör. 25-45"
                onChange={(e) =>
                  setDraft({
                    ...d,
                    targetAudience: {
                      ...d.targetAudience,
                      ageRange: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Cinsiyet Odağı</Label>
              {isEditing ? (
                <Select
                  value={d.targetAudience.genderFocus}
                  onValueChange={(v) =>
                    setDraft({
                      ...d,
                      targetAudience: { ...d.targetAudience, genderFocus: v },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderFocusOptions.map((o) => (
                      <SelectItem key={o.value} value={o.label}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={d.targetAudience.genderFocus} disabled />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Müşteri Sorunları</Label>
            <Textarea
              value={d.targetAudience.problems}
              disabled={!isEditing}
              rows={2}
              onChange={(e) =>
                setDraft({
                  ...d,
                  targetAudience: {
                    ...d.targetAudience,
                    problems: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Müşteri Beklentileri</Label>
            <Textarea
              value={d.targetAudience.expectations}
              disabled={!isEditing}
              rows={2}
              onChange={(e) =>
                setDraft({
                  ...d,
                  targetAudience: {
                    ...d.targetAudience,
                    expectations: e.target.value,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Marka Sesi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marka Sesi</CardTitle>
          <CardDescription>Ton, dil ve iletişim tarzı</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ton Seçimi</Label>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map((option) => {
                const selected = d.brandVoice.tones.includes(option.label);
                return (
                  <Badge
                    key={option.value}
                    variant={selected ? "default" : "outline"}
                    className={`select-none transition-colors ${
                      isEditing ? "cursor-pointer" : "cursor-default"
                    } ${selected ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    onClick={() => isEditing && toggleTone(option.label)}
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
                value={d.brandVoice.emotionalKeywords}
                disabled={!isEditing}
                onChange={(e) =>
                  setDraft({
                    ...d,
                    brandVoice: {
                      ...d.brandVoice,
                      emotionalKeywords: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Kaçınılacak Kelimeler</Label>
              <Input
                value={d.brandVoice.wordsToAvoid}
                disabled={!isEditing}
                onChange={(e) =>
                  setDraft({
                    ...d,
                    brandVoice: {
                      ...d.brandVoice,
                      wordsToAvoid: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>İletişim Tarzı</Label>
            {isEditing ? (
              <Select
                value={d.brandVoice.communicationStyle}
                onValueChange={(v) =>
                  setDraft({
                    ...d,
                    brandVoice: { ...d.brandVoice, communicationStyle: v },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {communicationStyleOptions.map((o) => (
                    <SelectItem key={o.value} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={d.brandVoice.communicationStyle} disabled />
            )}
          </div>
        </CardContent>
      </Card>

      {/* İçerik Stratejisi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">İçerik Stratejisi</CardTitle>
          <CardDescription>Hedefler, temalar ve CTA tercihi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ana İçerik Hedefleri</Label>
            <div className="flex flex-wrap gap-2">
              {contentGoalOptions.map((option) => {
                const selected = d.contentStrategy.goals.includes(option.label);
                return (
                  <Badge
                    key={option.value}
                    variant={selected ? "default" : "outline"}
                    className={`select-none transition-colors ${
                      isEditing ? "cursor-pointer" : "cursor-default"
                    } ${selected ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    onClick={() => isEditing && toggleGoal(option.label)}
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
              value={d.contentStrategy.themes}
              disabled={!isEditing}
              rows={2}
              onChange={(e) =>
                setDraft({
                  ...d,
                  contentStrategy: {
                    ...d.contentStrategy,
                    themes: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>CTA Tercihi</Label>
            {isEditing ? (
              <Select
                value={d.contentStrategy.ctaPreference}
                onValueChange={(v) =>
                  setDraft({
                    ...d,
                    contentStrategy: { ...d.contentStrategy, ctaPreference: v },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ctaOptions.map((o) => (
                    <SelectItem key={o.value} value={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={d.contentStrategy.ctaPreference} disabled />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Görsel Kimlik */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Görsel Kimlik</CardTitle>
          <CardDescription>Renk paleti, stil ve tasarım notları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Ana Renkler</Label>
              <Input
                value={d.visualIdentity.mainColors}
                disabled={!isEditing}
                placeholder="ör. Yeşil, beyaz, açık kahverengi"
                onChange={(e) =>
                  setDraft({
                    ...d,
                    visualIdentity: {
                      ...d.visualIdentity,
                      mainColors: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Görsel Stil</Label>
              {isEditing ? (
                <Select
                  value={d.visualIdentity.visualStyle}
                  onValueChange={(v) =>
                    setDraft({
                      ...d,
                      visualIdentity: { ...d.visualIdentity, visualStyle: v },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {visualStyleOptions.map((o) => (
                      <SelectItem key={o.value} value={o.label}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={d.visualIdentity.visualStyle} disabled />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tasarım Notları</Label>
            <Textarea
              value={d.visualIdentity.designNotes}
              disabled={!isEditing}
              rows={2}
              onChange={(e) =>
                setDraft({
                  ...d,
                  visualIdentity: {
                    ...d.visualIdentity,
                    designNotes: e.target.value,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
