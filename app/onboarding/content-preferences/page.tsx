"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { OnboardingStepper } from "@/components/layout/onboarding-stepper";
import { saveContentPreferences, getContentPreferences } from "@/lib/api";
import {
  weeklyFrequencyOptions,
  dayOptions,
  timeRangeOptions,
  contentFormatOptions,
  contentGoalOptions,
} from "@/lib/mock-data";

const CONTENT_PREFS_DEFAULTS = {
  weeklyFrequency: "",
  preferredDays: [] as string[],
  preferredTimeRange: "",
  contentFormats: [] as string[],
  weeklyGoal: "",
  specialCampaign: "",
  customNotes: "",
};

export default function ContentPreferencesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState(CONTENT_PREFS_DEFAULTS);

  // Firebase'den verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getContentPreferences();
        if (data) {
          setFormData({
            weeklyFrequency: data.weeklyFrequency ?? "",
            preferredDays: data.preferredDays ?? [],
            preferredTimeRange: data.preferredTimeRange ?? "",
            contentFormats: data.contentFormats ?? [],
            weeklyGoal: data.weeklyGoal ?? "",
            specialCampaign: data.specialCampaign ?? "",
            customNotes: data.customNotes ?? "",
          });
        }
      } catch (error) {
        console.error("İçerik tercihleri yüklenemedi:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleDayChange = (day: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredDays: checked
        ? [...prev.preferredDays, day]
        : prev.preferredDays.filter((d) => d !== day),
    }));
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      contentFormats: checked
        ? [...prev.contentFormats, format]
        : prev.contentFormats.filter((f) => f !== format),
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveContentPreferences(formData);
      toast.success("İçerik tercihleri kaydedildi!");
    } catch {
      toast.error("Kaydetme başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!formData.weeklyFrequency) {
      toast.error("Lütfen haftalık paylaşım sıklığını seçin");
      return;
    }

    setIsLoading(true);
    try {
      await saveContentPreferences(formData);
      router.push("/onboarding/review");
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
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
      {/* Stepper */}
      <div className="mb-8">
        <OnboardingStepper currentStep={4} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                İçerik Tercihleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weekly Frequency */}
              <div className="space-y-2">
                <Label htmlFor="weeklyFrequency">
                  Haftalık Paylaşım Sıklığı *
                </Label>
                <Select
                  value={formData.weeklyFrequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, weeklyFrequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeklyFrequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Days */}
              <div className="space-y-3">
                <Label>Tercih Edilen Günler</Label>
                <div className="flex flex-wrap gap-3">
                  {dayOptions.map((day) => (
                    <div
                      key={day.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={day.value}
                        checked={formData.preferredDays.includes(day.value)}
                        onCheckedChange={(checked) =>
                          handleDayChange(day.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={day.value}
                        className="text-sm cursor-pointer"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <Label htmlFor="preferredTimeRange">
                  Tercih Edilen Saat Aralığı
                </Label>
                <Select
                  value={formData.preferredTimeRange}
                  onValueChange={(value) =>
                    setFormData({ ...formData, preferredTimeRange: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRangeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Formats */}
              <div className="space-y-3">
                <Label>İçerik Formatları</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {contentFormatOptions.map((format) => (
                    <div
                      key={format.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={format.value}
                        checked={formData.contentFormats.includes(format.value)}
                        onCheckedChange={(checked) =>
                          handleFormatChange(format.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={format.value}
                        className="text-sm cursor-pointer"
                      >
                        {format.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Goal */}
              <div className="space-y-2">
                <Label htmlFor="weeklyGoal">Haftalık İçerik Hedefi</Label>
                <Select
                  value={formData.weeklyGoal}
                  onValueChange={(value) =>
                    setFormData({ ...formData, weeklyGoal: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentGoalOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Special Campaign */}
              <div className="space-y-2">
                <Label htmlFor="specialCampaign">
                  Bu Hafta Özel Kampanya veya Konu
                </Label>
                <Textarea
                  id="specialCampaign"
                  placeholder="Örn: Yaz diyeti önerileri, Ramazan ayı içerikleri..."
                  rows={2}
                  value={formData.specialCampaign}
                  onChange={(e) =>
                    setFormData({ ...formData, specialCampaign: e.target.value })
                  }
                />
              </div>

              {/* Custom Notes */}
              <div className="space-y-2">
                <Label htmlFor="customNotes">Özel Notlar / Prompt</Label>
                <Textarea
                  id="customNotes"
                  placeholder="AI'a vermek istediğiniz ek talimatlar..."
                  rows={3}
                  value={formData.customNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, customNotes: e.target.value })
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push("/onboarding/platforms")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-0 bg-primary/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Haftalık İçerik Planı Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Paylaşım Sıklığı</p>
                <p className="font-medium">
                  {weeklyFrequencyOptions.find(
                    (o) => o.value === formData.weeklyFrequency
                  )?.label || "Belirtilmedi"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tercih Edilen Günler</p>
                <p className="font-medium">
                  {formData.preferredDays.length > 0
                    ? formData.preferredDays
                        .map(
                          (d) =>
                            dayOptions.find((day) => day.value === d)?.label
                        )
                        .join(", ")
                    : "Belirtilmedi"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saat Aralığı</p>
                <p className="font-medium">
                  {timeRangeOptions.find(
                    (o) => o.value === formData.preferredTimeRange
                  )?.label || "Belirtilmedi"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">İçerik Formatları</p>
                <p className="font-medium">
                  {formData.contentFormats.length > 0
                    ? formData.contentFormats
                        .map(
                          (f) =>
                            contentFormatOptions.find(
                              (format) => format.value === f
                            )?.label
                        )
                        .join(", ")
                    : "Belirtilmedi"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Haftalık Hedef</p>
                <p className="font-medium">
                  {contentGoalOptions.find(
                    (o) => o.value === formData.weeklyGoal
                  )?.label || "Belirtilmedi"}
                </p>
              </div>
              {formData.specialCampaign && (
                <div>
                  <p className="text-sm text-muted-foreground">Özel Kampanya</p>
                  <p className="font-medium">{formData.specialCampaign}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
