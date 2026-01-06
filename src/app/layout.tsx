import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import AuthGuard from '@/components/layout/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AdProvider } from '@/context/AdProvider';
import InterstitialAd from '@/components/layout/InterstitialAd';

export const metadata: Metadata = {
  title: 'الحضور',
  description: 'تطبيق لتسجيل حضور الطلاب والمدفوعات',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9619642683790457"
     crossorigin="anonymous"></script>
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
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AdProvider>
              <AuthGuard>
                <AppShell>{children}</AppShell>
              </AuthGuard>
              <InterstitialAd />
            </AdProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
