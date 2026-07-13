
'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { PageHeader, PageHeaderTitle } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, CalendarCheck, ShieldCheck, Users, Wallet, LogIn, UserPlus, BookOpen, Layout, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ADMIN_EMAIL } from '@/lib/constants';
import { useAppConfig } from '@/hooks/use-app-config';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useUser();
  const { config } = useAppConfig();
  const router = useRouter();
  
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAuthDialog(true);
    }
  };

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center text-center py-12 animate-in fade-in duration-700">
        <PageHeader className="border-0">
            <PageHeaderTitle className="text-4xl md:text-5xl text-primary font-black">مرحباً أيها المشرف</PageHeaderTitle>
            <PageHeaderTitle className="text-lg font-bold opacity-60">أنت تستخدم حساب الإدارة الرئيسي للنظام</PageHeaderTitle>
        </PageHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/admin" className="group">
            <Card className="hover-lift overflow-hidden border-2 border-primary/20 bg-white dark:bg-slate-900 rounded-[2.5rem]">
                <CardContent className="flex flex-col items-center p-10 gap-4">
                    <div className="p-5 bg-primary/10 rounded-3xl text-primary group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black">لوحة تحكم النظام</h2>
                </CardContent>
            </Card>
          </Link>
          <Link href="/admin/blog" className="group">
            <Card className="hover-lift overflow-hidden border-2 border-emerald-500/20 bg-white dark:bg-slate-900 rounded-[2.5rem]">
                <CardContent className="flex flex-col items-center p-10 gap-4">
                    <div className="p-5 bg-emerald-500/10 rounded-3xl text-emerald-500 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black">إدارة المدونة</h2>
                </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-20 py-4 px-2 sm:px-6">
      {/* هيدر ترحيبي متطور */}
      <section className="relative overflow-hidden rounded-[4rem] bg-slate-950 p-8 md:p-24 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5">
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary via-transparent to-transparent animate-pulse" />
         <div className="relative z-10 text-center space-y-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md mb-4">
               <span className="text-xs font-black uppercase tracking-widest text-primary/80">الجيل القادم من أنظمة التعليم</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1] tracking-tighter">
              بوابتك <span className="text-primary italic">الذكية</span> للتعليم الرقمي
            </h1>
            <p className="text-slate-400 text-lg md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed">
              إدارة متكاملة للحضور والمدفوعات لطلابك، مع واجهة مستخدم عصرية وأدوات ذكية توفر وقتك وجهدك.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-6">
               {!user ? (
                 <>
                    <Link href="/login">
                      <Button size="lg" className="rounded-[1.5rem] px-12 h-16 text-xl font-black gap-3 shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                        <LogIn className="h-6 w-6" /> دخول المعلمين
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="lg" variant="outline" className="rounded-[1.5rem] px-12 h-16 text-xl font-black gap-3 border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                        <UserPlus className="h-6 w-6" /> ابدأ مجاناً
                      </Button>
                    </Link>
                 </>
               ) : (
                 <Link href="/blog">
                    <Button size="lg" className="rounded-[1.5rem] px-12 h-16 text-xl font-black gap-3 shadow-2xl shadow-primary/40">
                      <BookOpen className="h-6 w-6" /> تصفح مقالات المدونة
                    </Button>
                 </Link>
               )}
            </div>
         </div>
      </section>

      {/* الأدوات الأساسية */}
      <section className="space-y-12 pb-20">
         <div className="flex items-center justify-center text-center gap-3 flex-col">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white">أدوات المعلم الذكية</h2>
            <p className="text-slate-400 font-bold max-w-lg">كل ما تحتاجه لإدارة طلابك في مكان واحد، متاح فقط للمعلمين المسجلين.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
            { name: 'تسجيل الحضور اليومي', icon: CalendarCheck, href: '/attendance', color: 'bg-blue-600', desc: 'نظام مسح الكود QR وتسجيل الغياب التلقائي.' },
            { name: 'إدارة شؤون الطلاب', icon: Users, href: '/students', color: 'bg-emerald-600', desc: 'قواعد بيانات شاملة وأكواد تعريفية رقمية لكل طالب.' },
            { name: 'المدفوعات والتقارير', icon: Wallet, href: '/payments', color: 'bg-amber-600', desc: 'تتبع المستحقات المالية وتحليل نسب الالتزام الشهرية.' },
            ].map((item) => (
            <Link href={item.href} key={item.name} onClick={handleProtectedClick} className="group">
               <Card className="border-0 bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] p-10 text-center flex flex-col items-center gap-6 group-hover:-translate-y-2 transition-all duration-500 relative overflow-hidden h-full">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center ${item.color} text-white shadow-2xl group-hover:rotate-6 transition-transform`}>
                     <item.icon className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-slate-800 dark:text-white">{item.name}</h3>
                     <p className="text-sm text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                     فتح الأداة الآن <ArrowRight className="h-4 w-4 rotate-180" />
                  </div>
               </Card>
            </Link>
            ))}
         </div>
      </section>

      {/* قسم دعائي للمدونة */}
      <section className="bg-primary/5 rounded-[3rem] p-10 md:p-20 text-center space-y-8 border-2 border-primary/10 mb-20 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white relative z-10">هل تبحث عن المعرفة التقنية؟</h2>
          <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto relative z-10">تابع مدونتنا للحصول على شروحات حصرية في الذكاء الاصطناعي والحياة الرقمية، متاحة للجميع مجاناً وبدون تسجيل دخول.</p>
          <Link href="/blog" className="relative z-10 inline-block">
            <Button size="lg" variant="default" className="rounded-2xl px-10 h-14 text-lg font-black gap-2">
              <BookOpen className="h-5 w-5" /> زيارة قسم المدونة
            </Button>
          </Link>
      </section>

      {/* نافذة التحذير الذكية */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] border-0 shadow-2xl max-w-sm overflow-hidden p-0">
          <div className="bg-primary h-2 w-full" />
          <div className="p-10 space-y-8">
              <DialogHeader className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <DialogTitle className="text-3xl font-black text-slate-800">تحتاج للدخول</DialogTitle>
                <DialogDescription className="font-bold pt-3 text-slate-400 leading-relaxed">
                  هذه الأدوات مخصصة للمعلمين المسجلين في المنظومة. يرجى الدخول لمتابعة عملك.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => router.push('/login')} className="h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20">
                   <LogIn className="h-5 w-5" /> تسجيل الدخول
                 </Button>
                 <Button onClick={() => router.push('/signup')} variant="outline" className="h-14 rounded-2xl font-black text-lg gap-3 border-primary/20 hover:bg-primary/5">
                   <UserPlus className="h-5 w-5" /> إنشاء حساب جديد
                 </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
