"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { OnboardingStepper } from "@/components/layout/onboarding-stepper";
import { saveUserInfo } from "@/lib/api";
import {
  professionOptions,
  businessTypeOptions,
  languageOptions,
} from "@/lib/mock-data";

const USER_INFO_KEY = "onboarding_user_info";

const USER_INFO_DEFAULTS = {
  fullName: "",
  email: "",
  profession: "",
  businessType: "",
  language: "turkce",
  timezone: "Europe/Istanbul",
  country: "Türkiye",
  city: "",
};

function loadUserInfo() {
  if (typeof window === "undefined") return USER_INFO_DEFAULTS;
  try {
    const saved = localStorage.getItem(USER_INFO_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return USER_INFO_DEFAULTS;
}

export default function UserInfoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(loadUserInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(formData));
    } catch {}
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Ad soyad gereklidir";
    }
    if (!formData.email) {
      newErrors.email = "Email gereklidir";
    }
    if (!formData.profession) {
      newErrors.profession = "Meslek seçimi gereklidir";
    }
    if (!formData.businessType) {
      newErrors.businessType = "İşletme türü gereklidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await saveUserInfo(formData);
      toast.success("Bilgileriniz kaydedildi!");
    } catch {
      toast.error("Kaydetme başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await saveUserInfo(formData);
      localStorage.removeItem(USER_INFO_KEY);
      router.push("/onboarding/brand-identity");
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Stepper */}
      <div className="mb-8">
        <OnboardingStepper currentStep={1} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Kullanıcı Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad *</Label>
                  <Input
                    id="fullName"
                    placeholder="Adınız Soyadınız"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profession">Meslek / Niş *</Label>
                  <Select
                    value={formData.profession}
                    onValueChange={(value) =>
                      setFormData({ ...formData, profession: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.profession ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.profession && (
                    <p className="text-sm text-destructive">{errors.profession}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">İşletme Türü *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, businessType: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.businessType ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessType && (
                    <p className="text-sm text-destructive">
                      {errors.businessType}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Tercih Edilen Dil</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Saat Dilimi</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) =>
                      setFormData({ ...formData, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Istanbul">
                        Europe/Istanbul (UTC+3)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London (UTC+0)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York (UTC-5)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Ülke</Label>
                  <Input
                    id="country"
                    placeholder="Türkiye"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    placeholder="İstanbul"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
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
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-0 bg-primary/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Kullanıcı Profil Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Ad Soyad</p>
                <p className="font-medium">
                  {formData.fullName || "Belirtilmedi"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{formData.email || "Belirtilmedi"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meslek</p>
                <p className="font-medium">
                  {professionOptions.find((o) => o.value === formData.profession)
                    ?.label || "Belirtilmedi"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">İşletme Türü</p>
                <p className="font-medium">
                  {businessTypeOptions.find(
                    (o) => o.value === formData.businessType
                  )?.label || "Belirtilmedi"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Konum</p>
                <p className="font-medium">
                  {formData.city
                    ? `${formData.city}, ${formData.country}`
                    : formData.country || "Belirtilmedi"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
