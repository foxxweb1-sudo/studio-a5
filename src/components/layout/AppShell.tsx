
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle2, Palette, ShieldCheck, School, Settings } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { useStudents } from '@/hooks/use-app-data';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { ThemeMenuItems } from './ModeToggle';
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
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <School className="text-white w-6 h-6" />
              </div>
              <h1 className="font-bold text-xl tracking-tight hidden md:block">
                الحضور الذكي
              </h1>
            </Link>
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
                <Button variant="ghost" className="relative h-10 w-10 rounded-2xl bg-muted p-0 border hover:bg-muted/80 overflow-hidden">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarFallback className="rounded-none bg-primary text-primary-foreground font-bold">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-2xl p-2" align="start">
                <DropdownMenuLabel className="p-4 text-right">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{user.displayName || 'مستخدم'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1 space-y-1">
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl p-3 justify-end">
                      <Link href="/admin">
                        <span className="font-bold">لوحة تحكم المشرف</span>
                        <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl p-3 justify-end">
                     <Link href="/account">
                      <span className="font-bold">إدارة الحساب</span>
                      <UserCircle2 className="mr-2 h-4 w-4 text-primary" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl p-3 justify-end">
                     <Link href="/settings">
                      <span className="font-bold">الإعدادات</span>
                      <Settings className="mr-2 h-4 w-4 text-primary" />
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1 space-y-1">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl p-3 font-bold justify-end">
                      <span>المظهر</span>
                      <Palette className="mr-2 h-4 w-4 text-primary" />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-xl">
                      <ThemeMenuItems />
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 text-destructive focus:text-destructive justify-end">
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
