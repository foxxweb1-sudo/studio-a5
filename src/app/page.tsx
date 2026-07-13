
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
  School,
  BookOpen,
  History,
  LogIn,
  UserPlus,
  ShieldCheck,
  Calendar as CalendarIcon,
  UserX,
  CheckCircle2,
  Building2
} from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000">
      
      {/* Top Row: Clock and Greeting */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* Clock Card */}
        <Card className="flex-1 border-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] bg-white flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
            <div className="absolute top-6 right-8 p-2 bg-blue-50 text-blue-500 rounded-xl">
                <Clock className="h-5 w-5" />
            </div>
            <div className="text-5xl font-black tracking-tighter text-slate-800 tabular-nums">
                {currentTime ? format(currentTime, 'hh:mm:ss', { locale: ar }) : '--:--:--'}
                <span className="text-2xl mr-2">{currentTime ? format(currentTime, 'a', { locale: ar }) : ''}</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-3">الوقت الآن بتوقيتك المحلي</p>
        </Card>

        {/* Notification & Greeting Row */}
        <div className="flex-[2] flex gap-6">
            <Button variant="ghost" className="h-full w-20 rounded-[2rem] bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 shadow-none border-0 self-stretch flex items-center justify-center">
                <Bell className="h-7 w-7" />
            </Button>
            
            <Card className="flex-grow border-0 shadow-xl rounded-[2.5rem] bg-gradient-to-l from-blue-600 to-blue-400 text-white overflow-hidden relative">
                <CardContent className="h-full p-10 flex flex-col justify-between relative z-10">
                    <div className="text-right space-y-2">
                        <h2 className="text-3xl font-black flex items-center gap-2">
                            <span>أهلاً بك،</span>
                            <span>{user?.displayName || 'Ahmed Kamal'} 👋</span>
                        </h2>
                        <p className="text-sm font-bold text-white/80">نتمنى لك يوماً دراسياً موفقاً ومليئاً بالإنجازات.</p>
                    </div>
                    <div className="flex justify-end">
                        <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-2xl text-xs font-black">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{currentTime ? format(currentTime, 'EEEE، d MMMM yyyy', { locale: ar }) : '...'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Main Dashboard (The Dark Platform) */}
      <Card className="border-0 shadow-2xl rounded-[4rem] bg-[#0F172A] text-white overflow-hidden relative min-h-[450px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.08),transparent)]" />
        <CardContent className="p-12 md:p-16 relative z-10 flex flex-col justify-center h-full">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
                
                {/* Stats Grid on the Left */}
                <div className="grid grid-cols-2 gap-5 w-full lg:w-[400px] shrink-0">
                    {[
                        { label: 'إجمالي الطلاب', value: stats.total, icon: Users, color: 'text-blue-500' },
                        { label: 'حضور اليوم', value: stats.attended, icon: CheckCircle2, color: 'text-emerald-500' },
                        { label: 'غياب اليوم', value: stats.absent, icon: UserX, color: 'text-rose-500' },
                        { label: 'مدفوعات الشهر', value: stats.paid, icon: Wallet, color: 'text-amber-500' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-[2.5rem] text-center space-y-2 hover:bg-white/[0.08] transition-all duration-300 group">
                            <div className={`flex justify-center mb-1 ${s.color} group-hover:scale-110 transition-transform`}><s.icon className="h-6 w-6" /></div>
                            <div className="text-3xl font-black tabular-nums">{s.value}</div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Text and Actions on the Right */}
                <div className="flex-grow text-center lg:text-right space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter">
                            إدارة ذكية <br/> <span className="text-blue-500">لمستقبل تعليمي</span> أفضل
                        </h1>
                        <p className="text-slate-400 text-base md:text-xl font-medium max-w-2xl lg:ml-0 lg:mr-auto">تابع حضور طلابك ومدفوعاتهم بدقة متناهية وسهولة تامة.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Button 
                            onClick={(e) => handleProtectedClick(e, '/attendance')}
                            className="rounded-[1.5rem] h-16 px-10 font-black gap-3 shadow-2xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-lg"
                        >
                            <CalendarCheck className="h-6 w-6" /> تسجيل الحضور الآن
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={(e) => handleProtectedClick(e, '/students')}
                            className="rounded-[1.5rem] h-16 px-8 font-black gap-3 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                            <Users className="h-5 w-5" /> عرض جميع الطلاب
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={(e) => handleProtectedClick(e, '/schedule')}
                            className="rounded-[1.5rem] h-16 px-8 font-black gap-3 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                            <Clock className="h-5 w-5" /> مواعيد العمل
                        </Button>
                        <Button 
                            onClick={(e) => handleProtectedClick(e, '/accounting-period')}
                            className="rounded-[1.5rem] h-16 px-8 font-black gap-3 bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-600/20"
                        >
                            <History className="h-5 w-5" /> الفترة المحاسبية
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Stage Cards (Bottom Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: 'المرحلة الابتدائية', desc: 'من الصف الأول حتى السادس الابتدائي', icon: School, href: '/stage/primary', color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { name: 'المرحلة الإعدادية', desc: 'من الصف الأول حتى الثالث الإعدادي', icon: Building2, href: '/stage/preparatory', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { name: 'المرحلة الثانوية', desc: 'من الصف الأول حتى الثالث الثانوي', icon: GraduationCap, href: '/stage/secondary', color: 'text-purple-500', bg: 'bg-purple-500/5' },
        ].map((stage) => (
          <button key={stage.name} onClick={(e) => handleProtectedClick(e, stage.href)} className="group text-right outline-none">
            <Card className="border-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] p-12 text-center flex flex-col items-center gap-8 group-hover:-translate-y-3 transition-all duration-500 h-full">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center ${stage.bg} ${stage.color} group-hover:rotate-6 transition-transform shadow-inner`}>
                    <stage.icon className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-800">{stage.name}</h3>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">{stage.desc}</p>
                </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] border-0 shadow-2xl max-w-sm overflow-hidden p-0">
          <div className="bg-blue-600 h-2 w-full" />
          <div className="p-10 space-y-8 text-right">
              <DialogHeader className="text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="h-10 w-10 text-blue-600" />
                </div>
                <DialogTitle className="text-3xl font-black text-slate-800">تحتاج للدخول</DialogTitle>
                <DialogDescription className="font-bold pt-3 text-slate-400 leading-relaxed text-center">
                  هذه الأدوات مخصصة للمعلمين المسجلين في المنظومة. يرجى الدخول لمتابعة عملك.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => router.push('/login')} className="h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
                   <LogIn className="h-5 w-5" /> تسجيل الدخول
                 </Button>
                 <Button onClick={() => router.push('/signup')} variant="outline" className="h-14 rounded-2xl font-black text-lg gap-3 border-blue-100 hover:bg-blue-50 text-blue-600">
                   <UserPlus className="h-5 w-5" /> إنشاء حساب جديد
                 </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
