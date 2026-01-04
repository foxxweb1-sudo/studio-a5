"use client";

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  // Read the cookie to set the initial state of the sidebar.
  // This prevents a flash of the sidebar on page load.
  const [defaultOpen, setDefaultOpen] = React.useState(true);

  React.useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sidebar_state='))
      ?.split('=')[1];
    if (cookieValue) {
      setDefaultOpen(cookieValue === 'true');
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar side="right" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 justify-between">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-8 h-8 text-primary fill-current"
              >
                <path d="M9 4.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm0 15a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm-4-5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm10 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-5-5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-2.5-2.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zM5 9.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm5-5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"/>
              </svg>
              <h1 className="font-headline text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">
                الحضور
              </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start">
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">تسجيل الخروج</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between md:hidden mb-4">
            <h1 className="font-headline text-xl font-bold text-primary">الحضور</h1>
            <SidebarTrigger/>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
