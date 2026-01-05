"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useUser } from '@/firebase';
import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user } = useUser();

  const handleSignOut = () => {
    signOut(auth);
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-screen-2xl">
          <div className="mr-auto flex items-center">
            <Link href="/" className="flex items-center gap-2">
               <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-8 h-8 text-primary fill-current"
              >
                <path d="M9 4.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm0 15a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm-4-5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm10 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-5-5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-2.5-2.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zM5 9.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm5-5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"/>
              </svg>
              <h1 className="font-headline text-xl font-bold text-primary">
                الحضور
              </h1>
            </Link>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <Home />
                    <span className="sr-only">الرئيسية</span>
                </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut />
              <span className="sr-only">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-4 sm:py-6 lg:py-8 max-w-screen-2xl">{children}</main>
    </div>
  );
}
