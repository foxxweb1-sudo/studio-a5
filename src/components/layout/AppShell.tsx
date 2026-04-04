'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle2, ShieldCheck, Settings, Home } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { useStudents } from '@/hooks/use-app-data';
import { signOut } from 'firebase/auth';
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

const ADMIN_UID = 'IBEGODeNmLPG7x2u39LO4L9JQVi2';

export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user } = useUser();
  const { students } = useStudents();
  const [currentDateTime, setCurrentDateTime] = React.useState<Date | null>(null);

  const isAdmin = React.useMemo(() => user?.uid === ADMIN_UID, [user]);

  React.useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };
  
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
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 bg-white">
                <Image 
                  src="https://www.appcreator24.com/srv/imgs/gen/3816551_ico.png?v=19"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="font-bold text-xl tracking-tight hidden sm:block">
                الحضور
              </h1>
            </Link>
            
            <Button asChild variant="ghost" className="hidden md:flex gap-2 font-bold rounded-xl hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
              <Link href="/">
                <Home className="h-4 w-4" />
                الرئيسية
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end px-3 border-l ml-3">
              {currentDateTime && (
                <>
                  <div className="text-xs font-bold text-primary">
                    {new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(currentDateTime)}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                    {new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true }).format(currentDateTime)}
                  </div>
                </>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-2xl bg-muted p-0 border hover:bg-muted/80 overflow-hidden shadow-sm">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-primary text-primary-foreground font-bold">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl p-2 shadow-2xl border-primary/10" align="start">
                <DropdownMenuLabel className="p-4 text-right">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{user.displayName || 'مستخدم'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1 space-y-1">
                  <DropdownMenuItem asChild className="rounded-xl p-3 justify-end focus:bg-primary/10 md:hidden">
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
                     <Link href="/account">
                      <span className="font-bold">إدارة الحساب</span>
                      <UserCircle2 className="mr-2 h-4 w-4 text-primary" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl p-3 justify-end focus:bg-primary/10">
                     <Link href="/settings">
                      <span className="font-bold">الإعدادات</span>
                      <Settings className="mr-2 h-4 w-4 text-primary" />
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1 space-y-1">
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 text-destructive focus:text-destructive focus:bg-destructive/10 justify-end">
                    <span className="font-bold">تسجيل الخروج</span>
                    <LogOut className="mr-2 h-4 w-4" />
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
