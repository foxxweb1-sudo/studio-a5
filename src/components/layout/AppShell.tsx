'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Settings, Home } from 'lucide-react';
import { useUser } from '@/firebase';
import { useAppConfig } from '@/hooks/use-app-config';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Footer from './Footer';
import { ADMIN_EMAIL } from '@/lib/constants';
import ReviewPopup from '../features/reviews/ReviewPopup';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { config } = useAppConfig();

  const isAdmin = React.useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-background text-right" dir="rtl">
      {/* نافذة التقييم المنبثقة */}
      <ReviewPopup />

      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 bg-white">
                <Image 
                  src={config.appLogo}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="font-bold text-xl tracking-tight hidden sm:block">
                {config.appName}
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-2xl bg-muted p-0 border overflow-hidden">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={user.photoURL || ''} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-primary text-primary-foreground font-bold">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl p-2 shadow-2xl" align="start">
                <DropdownMenuLabel className="p-4 text-right">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{user.displayName || 'مستخدم'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1 space-y-1">
                  <DropdownMenuItem asChild className="rounded-xl p-3 justify-end">
                    <Link href="/">
                      <span className="font-bold">الرئيسية</span>
                      <Home className="mr-2 h-4 w-4 text-primary" />
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl p-3 justify-end focus:bg-primary/10">
                      <Link href="/admin">
                        <span className="font-bold">لوحة تحكم المشرف</span>
                        <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl p-3 justify-end focus:bg-primary/10">
                     <Link href="/settings">
                      <span className="font-bold">الإعدادات</span>
                      <Settings className="mr-2 h-4 w-4 text-primary" />
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container flex-grow py-8 max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
