import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import AuthGuard from '@/components/layout/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import CookieConsent from '@/components/layout/CookieConsent';
import FloatingSupport from '@/components/layout/FloatingSupport';

export const metadata: Metadata = {
  title: 'الحضور',
  description: 'تطبيق لإدارة الطلاب والمدفوعات بكفاءة تامة أوفلاين وأونلاين',
  manifest: '/manifest.json',
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
      </head>
      <body className="font-body antialiased">
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
