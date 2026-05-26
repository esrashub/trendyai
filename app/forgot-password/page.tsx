"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email adresi gereklidir");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Şifre sıfırlama bağlantısı gönderildi!");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        setError("Bu email adresi ile kayıtlı kullanıcı bulunamadı");
      } else if (code === "auth/invalid-email") {
        setError("Geçersiz email adresi");
      } else if (code === "auth/too-many-requests") {
        toast.error("Çok fazla deneme. Lütfen bir süre bekleyin.");
      } else {
        toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
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
            <h1 className="text-2xl font-bold text-foreground">Şifremi Unuttum</h1>
            <p className="mt-2 text-muted-foreground">
              Email adresinize şifre sıfırlama bağlantısı göndereceğiz
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            {sent ? (
              <>
                <CardHeader className="pb-4 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Email Gönderildi!</CardTitle>
                  <CardDescription className="text-sm">
                    <span className="font-medium text-foreground">{email}</span> adresine şifre sıfırlama bağlantısı gönderdik.
                    Lütfen gelen kutunuzu kontrol edin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-xs text-muted-foreground">
                    Email gelmedi mi? Spam klasörünü kontrol edin veya birkaç dakika bekleyin.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full gap-2" onClick={() => setSent(false)}>
                      <Mail className="h-4 w-4" />
                      Farklı Email Dene
                    </Button>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Giriş Sayfasına Dön
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Email adresinizi girin</CardTitle>
                  <CardDescription>
                    Kayıtlı email adresinize şifre sıfırlama bağlantısı göndereceğiz
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={error ? "border-destructive" : ""}
                      />
                      {error && <p className="text-xs text-destructive">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      Şifre Sıfırlama Bağlantısı Gönder
                    </Button>

                    <Link href="/login">
                      <Button variant="ghost" className="w-full gap-2" type="button">
                        <ArrowLeft className="h-4 w-4" />
                        Giriş Sayfasına Dön
                      </Button>
                    </Link>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
