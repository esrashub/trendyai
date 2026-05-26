"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function DataDeletionPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Lütfen email adresinizi girin");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Veri silme talebiniz alındı");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </Link>

        <h1 className="mb-4 text-4xl font-bold">Veri Silme Talebi</h1>
        <p className="mb-8 text-muted-foreground">
          KVKK ve GDPR kapsamında verilerinizin silinmesini talep edebilirsiniz.
        </p>

        {isSubmitted ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Talebiniz Alındı</h2>
                <p className="text-muted-foreground mb-4">
                  Veri silme talebiniz başarıyla alınmıştır. 30 gün içinde tüm
                  verileriniz sistemlerimizden kalıcı olarak silinecektir.
                </p>
                <p className="text-sm text-muted-foreground">
                  Onay e-postası <strong>{email}</strong> adresine gönderildi.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Veri Silme Formu</CardTitle>
              <CardDescription>
                Hesabınızla ilişkili tüm verilerin silinmesi için aşağıdaki formu
                doldurun.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Kayıtlı Email Adresiniz</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  <h3 className="font-semibold mb-2">Silinecek Veriler:</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Hesap bilgileri (ad, email, şifre)</li>
                    <li>Marka kimliği ve içerik tercihleri</li>
                    <li>Bağlı sosyal medya hesap bilgileri</li>
                    <li>Oluşturulan içerikler ve taslaklar</li>
                    <li>Kullanım geçmişi ve tercihler</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm">
                  <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                    Önemli Uyarı
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Bu işlem geri alınamaz. Verileriniz kalıcı olarak silinecek ve
                    kurtarılamayacaktır.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    "Veri Silme Talebini Gönder"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-sm text-muted-foreground">
          <h3 className="font-semibold mb-2">Bilgilendirme</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Veri silme işlemi 30 gün içinde tamamlanacaktır.</li>
            <li>İşlem tamamlandığında email ile bilgilendirileceksiniz.</li>
            <li>
              Yasal zorunluluklar gereği bazı veriler belirli süre saklanabilir.
            </li>
            <li>
              Sorularınız için{" "}
              <a
                href="mailto:privacy@trendyai.com"
                className="text-primary hover:underline"
              >
                privacy@trendyai.com
              </a>{" "}
              adresine yazabilirsiniz.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
