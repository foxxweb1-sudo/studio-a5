'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, School, Building, CalendarCheck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const ADMIN_UID = 'IBEGODeNmLPG7x2u39LO4L9JQVi2';

const mainLinks = [
  {
    name: 'تسجيل الحضور السريع',
    icon: CalendarCheck,
    href: '/attendance',
    description: 'الانتقال مباشرة لتسجيل حضور طالب.',
  },
];

const stages = [
  {
    name: 'المرحلة الابتدائية',
    icon: School,
    slug: 'primary',
  },
  {
    name: 'المرحلة الإعدادية',
    icon: Building,
    slug: 'preparatory',
  },
  {
    name: 'المرحلة الثانوية',
    icon: GraduationCap,
    slug: 'secondary',
  },
];

export default function Home() {
  const { user } = useUser();
  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center text-center h-full">
        <PageHeader>
            <PageHeaderTitle>مرحباً أيها المشرف</PageHeaderTitle>
            <PageHeaderDescription>
                أنت في وضع المشرف. استخدم الرابط أدناه للوصول إلى لوحة التحكم الخاصة بك.
            </PageHeaderDescription>
        </PageHeader>
        <Link href="/admin" className="group">
            <Card className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg rounded-2xl w-full max-w-md">
                <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary-foreground/10 border-4 border-primary-foreground/20 transform group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold text-center">لوحة تحكم المشرف</h2>
                    <p className="text-base text-primary-foreground/80">عرض وإدارة جميع بيانات الطلاب في النظام.</p>
                </CardContent>
            </Card>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      
      <div className="grid grid-cols-1">
        {mainLinks.map((link) => (
          <Link href={link.href} key={link.name} className="group">
             <Card className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center p-6 sm:p-10 gap-4">
                  <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-foreground/10 border-4 border-primary-foreground/20 transform group-hover:scale-110 transition-transform">
                    <link.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-center">{link.name}</h2>
                  <p className="text-sm sm:text-base text-primary-foreground/80">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <PageHeader>
        <PageHeaderTitle>او اختر المرحلة الدراسية</PageHeaderTitle>
        <PageHeaderDescription>
          حدد المرحلة التي تريد عرض الصفوف الخاصة بها.
        </PageHeaderDescription>
      </PageHeader>
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        {stages.map((stage) => (
          <Link href={`/stage/${stage.slug}`} key={stage.slug} className="group w-full max-w-xs sm:max-w-none">
            <Card className="hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 rounded-full aspect-square flex items-center justify-center">
              <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8 gap-4">
                <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 border-4 border-primary/20 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                  <stage.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-center">{stage.name}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
