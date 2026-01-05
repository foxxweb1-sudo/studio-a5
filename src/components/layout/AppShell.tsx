'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Home, UserCircle2, Palette } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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
import { ModeToggle, ThemeMenuItems } from './ModeToggle';
import Footer from './Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user } = useUser();
  const [currentDateTime, setCurrentDateTime] = React.useState<Date | null>(null);

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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="font-headline text-xl font-bold text-primary">
                تطبيق الحضور
              </h1>
            </Link>
             <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <Home />
                    <span className="sr-only">الرئيسية</span>
                </Link>
            </Button>
          </div>

          <div className="hidden sm:flex flex-col items-center justify-center">
            {currentDateTime && (
              <>
                <div className="text-sm font-medium text-foreground">
                  {new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(currentDateTime)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).format(currentDateTime)}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/account">
                    <UserCircle2 className="ms-2 h-4 w-4" />
                    <span>إدارة الحساب</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="ms-2 h-4 w-4" />
                    <span>تغيير المظهر</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <ThemeMenuItems />
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="ms-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container flex-grow py-4 sm:py-6 lg:py-8 max-w-screen-2xl px-4 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}
