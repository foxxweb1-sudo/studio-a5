
'use client';

import * as React from 'react';
import { BadgeCheck } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useAppConfig } from '@/hooks/use-app-config';
import Image from 'next/image';
import Footer from './Footer';
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-background text-right" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between max-w-screen-2xl px-6">
          
          {/* Left: Logo with Verification */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border shadow-sm bg-white">
                <Image src={config.appLogo || ''} alt="Logo" fill className="object-contain p-1" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                <BadgeCheck className="h-4 w-4 fill-blue-500 text-white" />
              </div>
            </div>
          </div>

          {/* Center: Live Time Pill */}
          <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full shadow-inner">
             <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="tabular-nums">{time ? format(time, 'hh:mm:ss a', { locale: ar }) : '--:--:--'}</span>
                <span className="opacity-30">|</span>
                <span>{time ? format(time, 'EEEE', { locale: ar }) : ''}</span>
             </div>
          </div>

          {/* Right: App Name */}
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-slate-800 tracking-tighter">{config.appName}</span>
            <div className="w-6 h-6 relative opacity-20">
               <Image src={config.appLogo || ''} alt="icon" fill className="object-contain grayscale" />
            </div>
          </div>

        </div>
      </header>
      
      <main className="container flex-grow py-8 max-w-screen-2xl px-6">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
