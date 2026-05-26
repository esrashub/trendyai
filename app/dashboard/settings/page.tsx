"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Bell, Shield, Save, LogOut, Building2 } from "lucide-react";
import { mockSettings } from "@/lib/mock-data";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getBrandIdentity, updateProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { BrandIdentitySettingsForm } from "@/components/forms/BrandIdentitySettingsForm";
import type { BrandIdentity } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, logout, refreshProfile, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState(mockSettings.notifications);
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setEmail(profile.email || "");
      setProfession(profile.profession || "");
    }
  }, [profile]);

  useEffect(() => {
    if (authLoading) return;
    getBrandIdentity()
      .then((data) => {
        setBrandIdentity(data);
      })
      .catch(() => {
        toast.error("Marka bilgileri yüklenirken hata oluştu.");
      })
      .finally(() => {
        setBrandLoading(false);
      });
  }, [authLoading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName, email, profession });
      await refreshProfile();
      toast.success("Profil bilgileri kaydedildi");
    } catch {
      toast.error("Kaydetme başarısız. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    toast.success("Çıkış yapıldı");
    router.push("/");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ve uygulama ayarlarınızı yönetin
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-2">
            <Building2 className="h-4 w-4" />
            Firma / Marka
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Güvenlik
          </TabsTrigger>
        </TabsList>

        {/* Profil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                    {(profile?.fullName || "K")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile?.fullName || "Kullanıcı"}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email || ""}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Meslek</Label>
                  <Input
                    id="profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Dil</Label>
                  <Select defaultValue="turkce">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="turkce">Türkçe</SelectItem>
                      <SelectItem value="ingilizce">İngilizce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Saat Dilimi</Label>
                  <Select defaultValue="istanbul">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="istanbul">
                        Europe/Istanbul (GMT+3)
                      </SelectItem>
                      <SelectItem value="london">
                        Europe/London (GMT+0)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Hesap</CardTitle>
              <CardDescription>Oturumu sonlandırın</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {loggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firma / Marka Bilgileri */}
        <TabsContent value="brand" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Firma / Marka Bilgileri</h2>
            <p className="text-sm text-muted-foreground">
              İçerik üretimi ve AI marka özeti için kullanılan marka kimliği
              bilgilerinizi yönetin.
            </p>
          </div>
          {brandLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              </CardContent>
            </Card>
          ) : (
            <BrandIdentitySettingsForm initialData={brandIdentity} />
          )}
        </TabsContent>

        {/* Bildirimler */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>
                Hangi bildirimleri almak istediğinizi seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">Haftalık Özet</p>
                  <p className="text-sm text-muted-foreground">
                    Her hafta performans özeti alın
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklySummary}
                  onCheckedChange={(v) =>
                    setNotifications((prev) => ({
                      ...prev,
                      weeklySummary: v,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">Başarısız Yayınlar</p>
                  <p className="text-sm text-muted-foreground">
                    Yayın hatalarında bildirim alın
                  </p>
                </div>
                <Switch
                  checked={notifications.failedPublishing}
                  onCheckedChange={(v) =>
                    setNotifications((prev) => ({
                      ...prev,
                      failedPublishing: v,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">İçerik Onayı</p>
                  <p className="text-sm text-muted-foreground">
                    Onay bekleyen içerikler için hatırlatma
                  </p>
                </div>
                <Switch
                  checked={notifications.contentApproval}
                  onCheckedChange={(v) =>
                    setNotifications((prev) => ({
                      ...prev,
                      contentApproval: v,
                    }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Güvenlik */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik</CardTitle>
              <CardDescription>Şifre ve güvenlik ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">E-posta Doğrulaması</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email || ""}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-200 bg-emerald-50"
                >
                  Doğrulandı
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mevcut Şifre</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div />
                <div className="space-y-2">
                  <Label htmlFor="new-password">Yeni Şifre</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <Button variant="outline">Şifreyi Değiştir</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
