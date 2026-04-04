
'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { useStudents, useAttendance, usePayments } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, School, Building, CalendarCheck, ShieldCheck, Users, Wallet, Clock, ArrowRightCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const ADMIN_UID = 'IBEGODeNmLPG7x2u39LO4L9JQVi2';

const stages = [
  {
    name: 'المرحلة الابتدائية',
    icon: School,
    slug: 'primary',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    description: 'من الصف الأول حتى السادس الابتدائي'
  },
  {
    name: 'المرحلة الإعدادية',
    icon: Building,
    slug: 'preparatory',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    description: 'من الصف الأول حتى الثالث الإعدادي'
  },
  {
    name: 'المرحلة الثانوية',
    icon: GraduationCap,
    slug: 'secondary',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    description: 'من الصف الأول حتى الثالث الثانوي'
  },
];

export default function Home() {
  const { user } = useUser();
  const { students } = useStudents();
  const { attendance } = useAttendance();
  const { payments } = usePayments();

  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  // إحصائيات
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const attendedToday = attendance.filter(a => a.date === today).length;
    const paidThisMonth = payments.filter(p => p.month === currentMonth).length;
    
    return [
      { label: 'إجمالي الطلاب', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'حضور اليوم', value: attendedToday, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      { label: 'غياب اليوم', value: totalStudents - attendedToday, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-100' },
      { label: 'مدفوعات الشهر', value: paidThisMonth, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];
  }, [students, attendance, payments, today, currentMonth]);

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
            <Card className="hover-lift overflow-hidden border-2 border-primary/20 bg-white/50 backdrop-blur-md">
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
    <div className="flex flex-col gap-10 py-4">
      
      {/* Hero Dashboard Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center lg:text-right">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-md animate-pulse">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              النظام يعمل بكفاءة
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              إدارة ذكية <br /> <span className="text-primary">لمستقبل تعليمي</span> أفضل
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto lg:mx-0">
              تابع حضور طلابك، مدفوعاتهم، وتقاريرهم بدقة متناهية وسهولة تامة عبر هاتفك أو حاسوبك.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/attendance">
                <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5" />
                  تسجيل الحضور الآن
                </button>
              </Link>
              <Link href="/reports">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold border border-white/10 backdrop-blur-md transition-all flex items-center gap-2">
                  عرض التقارير
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl flex flex-col items-center lg:items-end gap-2 group hover:bg-white/10 transition-all">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-xs text-slate-500 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stages Navigation */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
          <div className="text-center md:text-right">
            <h2 className="text-3xl font-black">المراحل الدراسية</h2>
            <p className="text-muted-foreground">اختر المرحلة لإدارة صفوفها وطلابها</p>
          </div>
          <Link href="/students" className="text-primary font-bold hover:underline flex items-center gap-1">
            عرض جميع الطلاب
            <ArrowRightCircle className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <Link href={`/stage/${stage.slug}`} key={stage.slug} className="group">
              <Card className="h-full border-0 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem] overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center p-10 gap-6 text-center">
                  <div className={`flex items-center justify-center w-24 h-24 rounded-[2rem] ${stage.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <stage.icon className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{stage.name}</h3>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-primary group-hover:w-full transition-all duration-700" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Tools */}
      <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary text-white rounded-2xl shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold">أمان بياناتك أولويتنا</h4>
              <p className="text-sm text-muted-foreground">يتم تشفير كافة البيانات وحفظها سحابياً بشكل آمن.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/payments">
               <Card className="bg-white dark:bg-slate-800 border-0 hover:bg-primary hover:text-white transition-all rounded-2xl cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Wallet className="w-5 h-5" />
                    <span className="font-bold">المدفوعات</span>
                  </CardContent>
               </Card>
            </Link>
            <Link href="/account">
               <Card className="bg-white dark:bg-slate-800 border-0 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all rounded-2xl cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="font-bold">حسابي</span>
                  </CardContent>
               </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
