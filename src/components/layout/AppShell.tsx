'use client';

import * as React from 'react';
import { BadgeCheck, LayoutGrid, User, Settings as SettingsIcon, Home as HomeIcon, Archive, LogOut, ChevronLeft } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useAppConfig } from '@/hooks/use-app-config';
import Image from 'next/image';
import Footer from './Footer';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_EMAIL } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut as firebaseSignOut } from 'firebase/auth';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { config } = useAppConfig();
  const pathname = usePathname();
  const router = useRouter();
  const [time, setTime] = React.useState<Date | null>(null);

  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null,
  [user, firestore]);
  const { data: userProfile } = useDoc<any>(userDocRef);

  React.useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleSignOut = () => {
    firebaseSignOut(auth).then(() => {
      router.push('/login');
    });
  };

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
                  {userProfile?.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-lg border border-slate-50">
                      <BadgeCheck className="h-5 w-5 fill-blue-500 text-white" />
                    </div>
                  )}
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
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all outline-none group">
                        <div className="text-right hidden sm:block px-2">
                            <p className="text-[10px] font-black text-slate-400 leading-none">مرحباً بك</p>
                            <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[100px]">{user?.displayName || 'ضيف'}</p>
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                                {user?.photoURL ? (
                                    <Image src={user.photoURL} alt="User" width={40} height={40} className="rounded-xl object-cover" />
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                            </div>
                            {userProfile?.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0 shadow-md">
                                    <BadgeCheck className="h-4 w-4 fill-blue-500 text-white" />
                                </div>
                            )}
                        </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 rounded-[1.5rem] p-3 shadow-2xl border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                    <DropdownMenuLabel className="p-4 pt-2">
                        <div className="flex flex-col items-start text-right space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-lg text-slate-800 dark:text-white">{user?.displayName || 'المعلم'}</span>
                                {userProfile?.isVerified && <BadgeCheck className="h-4 w-4 fill-blue-500 text-white" />}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{user?.email}</span>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="mx-2" />
                    <div className="p-1 space-y-1">
                        <DropdownMenuItem asChild>
                            <Link href="/" className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-primary/5 group cursor-pointer">
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">الرئيسية</span>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                    <HomeIcon className="h-4 w-4" />
                                </div>
                            </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                            <Link href="/archive" className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-amber-50 group cursor-pointer">
                                <span className="font-bold text-sm text-amber-700 dark:text-amber-400">أرشيف الطلاب العام</span>
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <Archive className="h-4 w-4" />
                                </div>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-slate-100 group cursor-pointer">
                                <span className="font-bold text-sm text-slate-600 dark:text-slate-300">الإعدادات</span>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg group-hover:bg-slate-200 transition-colors">
                                    <SettingsIcon className="h-4 w-4" />
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="mx-2" />
                    <div className="p-1">
                        <DropdownMenuItem onClick={handleSignOut} className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-rose-50 text-rose-600 group cursor-pointer">
                            <span className="font-black text-sm">تسجيل الخروج</span>
                            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                <LogOut className="h-4 w-4" />
                            </div>
                        </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
               </DropdownMenu>
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
