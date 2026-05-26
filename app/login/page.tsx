"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = "Email gereklidir";
    if (!formData.password) e.password = "Şifre gereklidir";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = credential.user.uid;

      // Onboarding durumunu kontrol et
      const [userSnap, brandSnap, platformsSnap, prefsSnap] = await Promise.all([
        getDoc(doc(db, "users", uid)),
        getDoc(doc(db, "brandIdentities", uid)),
        getDoc(doc(db, "connectedPlatforms", uid)),
        getDoc(doc(db, "weeklyPreferences", uid)),
      ]);

      // Adım adım kontrol - kaldığı yerden devam etsin
      if (!userSnap.exists() || !userSnap.data()?.fullName) {
        router.push("/onboarding/user-info");
      } else if (!brandSnap.exists() || !brandSnap.data()?.brandName) {
        router.push("/onboarding/brand-identity");
      } else if (!platformsSnap.exists()) {
        router.push("/onboarding/platforms");
      } else if (!prefsSnap.exists()) {
        router.push("/onboarding/content-preferences");
      } else {
        router.push("/dashboard/content-ideas");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setErrors({ password: "Email veya şifre hatalı" });
      } else if (code === "auth/invalid-email") {
        setErrors({ email: "Geçersiz email adresi" });
      } else if (code === "auth/too-many-requests") {
        toast.error("Çok fazla deneme. Lütfen bir süre bekleyin.");
      } else {
        toast.error("Giriş yapılamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50/50 via-background to-emerald-50/30">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TrendyAI</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Giriş Yap</h1>
            <p className="mt-2 text-muted-foreground">
              Hesabınıza giriş yapın
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Email ve şifrenizi girin</CardTitle>
              <CardDescription>
                Hesabınız yok mu?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Ücretsiz oluşturun
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Şifre</Label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      Şifremi Unuttum
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Şifreniz"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Giriş Yap
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
