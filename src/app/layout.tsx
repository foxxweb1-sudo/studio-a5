import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import AuthGuard from '@/components/layout/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

export const metadata: Metadata = {
  title: 'الحضور',
  description: 'تطبيق لتسجيل حضور الطلاب والمدفوعات',
  icons: {
    icon: 'https://www.appcreator24.com/srv/imgs/gen/3816551_ico.png?v=19',
    apple: 'https://www.appcreator24.com/srv/imgs/gen/3816551_ico.png?v=19',
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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9619642683790457"
          crossOrigin="anonymous"
        ></script>
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
              <AppShell>{children}</AppShell>
            </AuthGuard>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
