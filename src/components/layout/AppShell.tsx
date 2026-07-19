'use client';

import * as React from 'react';
import { BadgeCheck, LayoutGrid, User, Settings as SettingsIcon } from 'lucide-react';
import { useUser } from '@/firebase';
import { useAppConfig } from '@/hooks/use-app-config';
import Image from 'next/image';
import Footer from './Footer';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_EMAIL } from '@/lib/constants';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { config } = useAppConfig();
  const pathname = usePathname();
  const [time, setTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const navItems = [
    { name: 'الرئيسية', href: '/', icon: LayoutGrid },
    { name: 'الإعدادات', href: '/settings', icon: SettingsIcon },
  ];

  if (isAdmin) {
    navItems.push({ name: 'لوحة الإدارة', href: '/admin', icon: User });
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF] dark:bg-slate-950 text-right font-body" dir="rtl">
      {!isAuthPage && (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
          <div className="container flex h-20 items-center justify-between max-w-screen-2xl px-6">
            
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white group-hover:rotate-6 transition-transform">
                    <Image src={config.appLogo || ''} alt="Logo" fill className="object-contain p-1.5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-lg border border-slate-50">
                    <BadgeCheck className="h-5 w-5 fill-blue-500 text-white" />
                  </div>
                </div>
                <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter hidden sm:block">
                  {config.appName}
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200/50">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all",
                      pathname === item.href 
                        ? "bg-white dark:bg-slate-700 text-primary shadow-sm" 
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4 bg-primary/5 border border-primary/10 px-6 py-2 rounded-full shadow-inner">
               <div className="flex items-center gap-3 text-[12px] font-black text-primary">
                  <span className="tabular-nums tracking-wider">{time ? format(time, 'hh:mm:ss a', { locale: ar }) : '--:--:--'}</span>
                  <span className="opacity-30">|</span>
                  <span>{time ? format(time, 'EEEE، d MMMM', { locale: ar }) : ''}</span>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <Link href="/account" className="flex items-center gap-2 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 leading-none">مرحباً بك</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[100px]">{user?.displayName || 'ضيف'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white shadow-lg overflow-hidden">
                      {user?.photoURL ? (
                          <Image src={user.photoURL} alt="User" width={40} height={40} className="rounded-xl object-cover" />
                      ) : (
                          <User className="h-5 w-5" />
                      )}
                  </div>
               </Link>
            </div>

          </div>
        </header>
      )}
      
      <main className="container flex-grow py-10 max-w-screen-2xl px-6">
        {children}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}
