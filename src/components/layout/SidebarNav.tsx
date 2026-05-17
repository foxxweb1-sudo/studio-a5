"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  BarChart3,
  CreditCard,
  CalendarCheck,
  Clock,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    icon: Home,
    label: "الرئيسية",
  },
  {
    href: "/attendance",
    icon: CalendarCheck,
    label: "تسجيل الحضور",
  },
  {
    href: "/schedule",
    icon: Clock,
    label: "مواعيد العمل",
  },
  {
    href: "/students",
    icon: Users,
    label: "الطلاب",
  },
  {
    href: "/reports",
    icon: BarChart3,
    label: "التقارير",
  },
  {
    href: "/payments",
    icon: CreditCard,
    label: "المدفوعات",
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              as="a"
              isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
