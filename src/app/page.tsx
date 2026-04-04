'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, School, Building, CalendarCheck, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

const ADMIN_UID = 'IBEGODeNmLPG7x2u39LO4L9JQVi2';

const stages = [
  {
    name: 'المرحلة الابتدائية',
    icon: School,
    slug: 'primary',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    name: 'المرحلة الإعدادية',
    icon: Building,
    slug: 'preparatory',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    name: 'المرحلة الثانوية',
    icon: GraduationCap,
    slug: 'secondary',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
];

export default function Home() {
  const { user } = useUser();
  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center text-center py-12">
        <PageHeader className="border-0">
            <PageHeaderTitle className="text-4xl md:text-5xl">مرحباً أيها المشرف</PageHeaderTitle>
            <PageHeaderDescription className="text-lg">
                أنت في وضع الإدارة الكاملة للنظام.
            </PageHeaderDescription>
        </PageHeader>
        <Link href="/admin" className="w-full max-w-md group">
            <Card className="hover-lift overflow-hidden border-2 border-primary/20">
                <CardContent className="flex flex-col items-center justify-center p-12 gap-6 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transform group-hover:rotate-12 transition-transform">
                        <ShieldCheck className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">لوحة تحكم المشرف</h2>
                      <p className="text-muted-foreground">عرض وإدارة جميع بيانات الطلاب والرسائل.</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12 py-6">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 md:p-12 text-primary-foreground shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-right">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">نظام الحضور الذكي</h1>
            <p className="text-primary-foreground/80 text-lg max-w-lg">
              سجل حضور طلابك بلمسة واحدة، وتابع مدفوعاتهم وتقاريرهم بكل سهولة واحترافية.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <Link href="/attendance">
                <Card className="bg-white text-primary border-0 hover:bg-white/90 transition-colors cursor-pointer rounded-2xl">
                  <CardContent className="flex items-center gap-3 p-4">
                    <CalendarCheck className="w-6 h-6" />
                    <span className="font-bold">تسجيل حضور سريع</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-64 h-64 bg-white/10 rounded-[3rem] rotate-12 border-4 border-white/20 flex items-center justify-center backdrop-blur-sm">
                <School className="w-32 h-32 text-white/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Stages Section */}
      <div className="space-y-8">
        <div className="text-center md:text-right px-2">
          <h2 className="text-3xl font-bold">اختر المرحلة الدراسية</h2>
          <p className="text-muted-foreground">حدد المرحلة التي تود البدء في إدارتها الآن.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stages.map((stage) => (
            <Link href={`/stage/${stage.slug}`} key={stage.slug} className="group">
              <Card className="hover-lift h-full border-2 hover:border-primary/40 transition-all rounded-[2rem] overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center p-10 gap-6">
                  <div className={`flex items-center justify-center w-24 h-24 rounded-3xl border-2 ${stage.color} group-hover:scale-110 transition-transform duration-500`}>
                    <stage.icon className="w-12 h-12" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">{stage.name}</h3>
                    <p className="text-sm text-muted-foreground">عرض الصفوف والطلاب لهذه المرحلة.</p>
                  </div>
                  <div className="w-12 h-1.5 bg-muted rounded-full group-hover:w-24 group-hover:bg-primary transition-all duration-500" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/reports" className="group">
            <Card className="bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-2xl border-0">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20">
                    <ArrowLeftRight className="w-6 h-6" />
                  </div>
                  <span className="font-bold">تقارير الغياب</span>
               </CardContent>
            </Card>
          </Link>
          <Link href="/payments" className="group">
            <Card className="bg-muted/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300 rounded-2xl border-0">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20">
                    <School className="w-6 h-6" />
                  </div>
                  <span className="font-bold">المدفوعات</span>
               </CardContent>
            </Card>
          </Link>
      </div>
    </div>
  );
}
