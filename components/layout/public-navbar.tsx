"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">TrendyAI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          <a
            href="#ozellikler"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Özellikler
          </a>
          <a
            href="#nasil-calisir"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Nasıl Çalışır
          </a>
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex md:items-center md:gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Giriş Yap</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Ücretsiz Başlat</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2.5 text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Menüyü aç</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <a
              href="#ozellikler"
              className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Özellikler
            </a>
            <a
              href="#nasil-calisir"
              className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nasıl Çalışır
            </a>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/register">Ücretsiz Başlat</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
