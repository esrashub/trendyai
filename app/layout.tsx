import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: 'TrendyAI - AI ile Sosyal Medya Otomasyonu',
  description: 'Marka kimliğinizi tanımlayın, sosyal medya platformlarınızı seçin ve TrendyAI sizin için trend bazlı içerik fikirleri, gönderi metinleri ve görsel önerileri oluştursun.',
  generator: 'TrendyAI',
  keywords: ['sosyal medya', 'otomasyon', 'AI', 'içerik üretimi', 'trend analizi', 'marka yönetimi'],
  authors: [{ name: 'TrendyAI' }],
  openGraph: {
    title: 'TrendyAI - AI ile Sosyal Medya Otomasyonu',
    description: 'AI destekli sosyal medya içerik otomasyon platformu',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendyAI - AI ile Sosyal Medya Otomasyonu',
    description: 'AI destekli sosyal medya içerik otomasyon platformu',
  },
}

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <Providers>{children}</Providers>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
