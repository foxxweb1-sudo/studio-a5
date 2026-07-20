import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import AuthGuard from '@/components/layout/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import CookieConsent from '@/components/layout/CookieConsent';
import FloatingSupport from '@/components/layout/FloatingSupport';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'الحضور',
  description: 'تطبيق لإدارة الطلاب والمدفوعات بكفاءة تامة أوفلاين وأونلاين - منصة المعلم المتكاملة',
  manifest: '/manifest.json',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: [
      {
        url: 'https://i.ibb.co/Nbhqk4f/36465.png',
        href: 'https://i.ibb.co/Nbhqk4f/36465.png',
      },
    ],
    apple: [
      {
        url: 'https://i.ibb.co/Nbhqk4f/36465.png',
        href: 'https://i.ibb.co/Nbhqk4f/36465.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* إجبار المتصفح على تحديث الأيقونة عبر إضافة query string */}
        <link rel="icon" href="https://i.ibb.co/Nbhqk4f/36465.png?v=2" />
        <link rel="apple-touch-icon" href="https://i.ibb.co/Nbhqk4f/36465.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="الحضور" />
        <meta name="theme-color" content="#4F46E5" />
        
        {/* Verification & Monetization Tags */}
        <meta name="yandex-verification" content="0faaccb6c44771f0" />
        <meta name="monetag" content="c19798fcf2477911030e84ada43ae778" />
        <meta name="google-site-verification" content="-DbtwtLAsT3hmizJuQZ9XTSdTSRjJUEWIs-au398y3w" />
      </head>
      <body className="font-body antialiased">
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9M1S40WVMH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9M1S40WVMH');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AuthGuard>
              <AppShell>
                {children}
                <CookieConsent />
                <FloatingSupport />
              </AppShell>
            </AuthGuard>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
