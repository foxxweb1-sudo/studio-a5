
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/firebase';
import { useStudents, useAttendance, usePayments } from '@/hooks/use-app-data';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GraduationCap, 
  CalendarCheck, 
  Users, 
  Wallet, 
  Clock, 
  Bell, 
  ArrowRight,
  School,
  BookOpen,
  History,
  LogIn,
  UserPlus,
  ShieldCheck,
  Calendar as CalendarIcon,
  UserX,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { ADMIN_EMAIL } from '@/lib/constants';
import { useAppConfig } from '@/hooks/use-app-config';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Home() {
  const { user } = useUser();
  const { config } = useAppConfig();
  const router = useRouter();
  
  const { students, isLoading: studentsLoading } = useStudents();
  const { attendance, isLoading: attendanceLoading } = useAttendance();
  const { payments, isLoading: paymentsLoading } = usePayments();

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    
    const activeStudents = students.filter(s => !s.isArchived);
    const attendedToday = attendance.filter(a => a.date === todayStr && a.status === 'present').length;
    const absentToday = attendance.filter(a => a.date === todayStr && a.status === 'absent').length;
    const monthlyPayments = payments.filter(p => p.month === currentMonthStr).length;

    return {
      total: activeStudents.length,
      attended: attendedToday,
      absent: absentToday,
      paid: monthlyPayments
    };
  }, [students, attendance, payments]);

  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setShowAuthDialog(true);
    } else {
      router.push(href);
    }
  };

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center text-center py-12 animate-in fade-in duration-700">
        <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl text-primary font-black">مرحباً أيها المشرف</h1>
            <p className="text-lg font-bold opacity-60">أنت تستخدم حساب الإدارة الرئيسي للنظام</p>
        </div>
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
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20">
      
      {/* الصف العلوي: الترحيب والوقت */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-0 shadow-sm rounded-[2.5rem] bg-gradient-to-l from-primary to-blue-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-right space-y-2">
                    <h2 className="text-2xl font-black flex items-center gap-2">
                        <span>أهلاً بك،</span>
                        <span className="text-white/90">{user?.displayName || 'ضيفنا العزيز'} 👋</span>
                    </h2>
                    <p className="text-sm font-bold text-white/70">نتمنى لك يوماً دراسياً موفقاً ومليئاً بالإنجازات.</p>
                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-xl text-xs font-bold mt-2">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{currentTime ? format(currentTime, 'EEEE، d MMMM yyyy', { locale: ar }) : '...'}</span>
                    </div>
                </div>
                <Button variant="ghost" className="rounded-2xl h-14 w-14 bg-white/10 hover:bg-white/20 text-white border-0 shadow-none">
                    <Bell className="h-6 w-6" />
                </Button>
            </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute top-2 right-2 p-2 bg-primary/5 rounded-xl text-primary">
                <Clock className="h-5 w-5" />
            </div>
            <div className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white tabular-nums">
                {currentTime ? format(currentTime, 'hh:mm:ss', { locale: ar }) : '--:--:--'}
                <span className="text-lg mr-2">{currentTime ? format(currentTime, 'a', { locale: ar }) : ''}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">الوقت الآن بتوقيتك المحلي</p>
        </Card>
      </div>

      {/* المنصة السوداء المركزية */}
      <Card className="border-0 shadow-2xl rounded-[3.5rem] bg-slate-950 text-white overflow-hidden relative group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)]" />
        <CardContent className="p-8 md:p-14 relative z-10">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
                
                {/* الإحصائيات الأربعة */}
                <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
                    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] text-center space-y-1 hover:bg-white/10 transition-colors">
                        <div className="flex justify-center mb-2 text-primary"><Users className="h-6 w-6" /></div>
                        <div className="text-2xl font-black">{stats.total}</div>
                        <p className="text-[10px] font-bold text-slate-400">إجمالي الطلاب</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] text-center space-y-1 hover:bg-white/10 transition-colors">
                        <div className="flex justify-center mb-2 text-emerald-500"><CheckCircle2 className="h-6 w-6" /></div>
                        <div className="text-2xl font-black">{stats.attended}</div>
                        <p className="text-[10px] font-bold text-slate-400">حضور اليوم</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] text-center space-y-1 hover:bg-white/10 transition-colors">
                        <div className="flex justify-center mb-2 text-rose-500"><UserX className="h-6 w-6" /></div>
                        <div className="text-2xl font-black">{stats.absent}</div>
                        <p className="text-[10px] font-bold text-slate-400">غياب اليوم</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] text-center space-y-1 hover:bg-white/10 transition-colors">
                        <div className="flex justify-center mb-2 text-amber-500"><Wallet className="h-6 w-6" /></div>
                        <div className="text-2xl font-black">{stats.paid}</div>
                        <p className="text-[10px] font-bold text-slate-400">مدفوعات الشهر</p>
                    </div>
                </div>

                {/* النص التحفيزي والأزرار */}
                <div className="flex-grow text-center lg:text-right space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                            إدارة ذكية <br/> <span className="text-primary italic">لمستقبل تعليمي</span> أفضل
                        </h1>
                        <p className="text-slate-400 text-sm md:text-lg font-bold">تابع حضور طلابك ومدفوعاتهم بدقة متناهية وسهولة تامة.</p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        <Button 
                            onClick={(e) => handleProtectedClick(e, '/attendance')}
                            className="rounded-2xl h-14 px-8 font-black gap-2 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                        >
                            <CalendarCheck className="h-5 w-5" /> تسجيل الحضور الآن
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={(e) => handleProtectedClick(e, '/students')}
                            className="rounded-2xl h-14 px-8 font-black gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                            <Users className="h-5 w-5" /> عرض جميع الطلاب
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={(e) => handleProtectedClick(e, '/schedule')}
                            className="rounded-2xl h-14 px-8 font-black gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                            <Clock className="h-5 w-5" /> مواعيد العمل
                        </Button>
                        <Button 
                            onClick={(e) => handleProtectedClick(e, '/accounting-period')}
                            className="rounded-2xl h-14 px-8 font-black gap-2 bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-600/20"
                        >
                            <History className="h-5 w-5" /> الفترة المحاسبية
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* بطاقات المراحل */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: 'المرحلة الابتدائية', desc: 'من الصف الأول حتى السادس الابتدائي', icon: School, href: '/stage/primary', color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { name: 'المرحلة الإعدادية', desc: 'من الصف الأول حتى الثالث الإعدادي', icon: BookOpen, href: '/stage/preparatory', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { name: 'المرحلة الثانوية', desc: 'من الصف الأول حتى الثالث الثانوي', icon: GraduationCap, href: '/stage/secondary', color: 'text-purple-500', bg: 'bg-purple-500/5' },
        ].map((stage) => (
          <Link href={stage.href} key={stage.name} onClick={(e) => handleProtectedClick(e, stage.href)} className="group">
            <Card className="border-0 bg-white dark:bg-slate-900 shadow-lg rounded-[2.5rem] p-10 text-center flex flex-col items-center gap-6 group-hover:-translate-y-2 transition-all duration-500 h-full">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${stage.bg} ${stage.color} group-hover:rotate-6 transition-transform`}>
                    <stage.icon className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stage.name}</h3>
                    <p className="text-xs text-slate-400 font-bold">{stage.desc}</p>
                </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* نافذة التحذير (لغير المسجلين) */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] border-0 shadow-2xl max-w-sm overflow-hidden p-0">
          <div className="bg-primary h-2 w-full" />
          <div className="p-10 space-y-8 text-right">
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
