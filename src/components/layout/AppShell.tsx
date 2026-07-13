
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Settings, Home, Clock, Archive, BadgeCheck, BookOpen, LogIn } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
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
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { doc } from 'firebase/firestore';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { config } = useAppConfig();
  const firestore = useFirestore();
  const [time, setTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null,
  [user, firestore]);
  const { data: userProfile } = useDoc<any>(userDocRef);

  const isAdmin = React.useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-background text-right" dir="rtl">
      <ReviewPopup />

      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 bg-white">
                <Image src={config.appLogo} alt="Logo" fill className="object-contain" />
              </div>
              <h1 className="font-black text-base sm:text-xl tracking-tight text-slate-800 dark:text-white">
                {config.appName}
              </h1>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
             <Link href="/" className="text-sm font-black text-slate-600 hover:text-primary">الرئيسية</Link>
             <Link href="/blog" className="text-sm font-black text-slate-600 hover:text-primary">المدونة</Link>
             <Link href="/about" className="text-sm font-black text-slate-600 hover:text-primary">من نحن</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative group cursor-pointer">
                    <Button variant="ghost" className="relative h-11 w-11 rounded-2xl bg-muted p-0 border-2 border-white overflow-hidden shadow-sm">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={user.photoURL || ''} className="object-cover" />
                        <AvatarFallback className="rounded-none bg-primary text-primary-foreground font-bold">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                    {userProfile?.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0 shadow-md z-10">
                        <BadgeCheck className="h-4.5 w-4.5 fill-blue-500 text-white" />
                      </div>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-2xl p-2 shadow-2xl" align="start">
                  <DropdownMenuLabel className="p-4 text-right">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-1.5">
                        {userProfile?.isVerified && isArabic(user.displayName || '') && <BadgeCheck className="h-4 w-4 fill-blue-500 text-white" />}
                        <p className="text-sm font-bold leading-none">{user.displayName || 'مستخدم'}</p>
                        {userProfile?.isVerified && !isArabic(user.displayName || '') && <BadgeCheck className="h-4 w-4 fill-blue-500 text-white" />}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl p-3 justify-end"><Link href="/"><Home className="mr-2 h-4 w-4" />الرئيسية</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl p-3 justify-end"><Link href="/settings"><Settings className="mr-2 h-4 w-4" />الإعدادات</Link></DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem asChild className="rounded-xl p-3 justify-end bg-primary/5"><Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" />المسؤول</Link></DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                 <Link href="/login"><Button variant="ghost" className="rounded-xl font-bold hidden sm:flex">دخول</Button></Link>
                 <Link href="/signup"><Button className="rounded-xl font-bold px-6 h-10 shadow-lg shadow-primary/20">ابدأ مجاناً</Button></Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container flex-grow py-8 max-w-screen-2xl px-4 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}
