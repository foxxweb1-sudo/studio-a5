"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "الرئيسية",
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
              isActive={pathname === item.href}
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
