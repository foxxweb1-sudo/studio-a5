'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/firebase';
import { useStudents, useAttendance, usePayments } from '@/hooks/use-app-data';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Wallet, 
  Clock, 
  LogIn,
  UserPlus,
  ShieldCheck,
  Calendar as CalendarIcon,
  UserX,
  CheckCircle2,
  School,
  Building2,
  GraduationCap,
  CalendarCheck,
  History,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  LayoutDashboard
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
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-24">
      
      {/* Upper Row: Time & Welcome Floating Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left: Digital Clock Neo-Style */}
        <Card className="border-0 shadow-2xl rounded-[3rem] bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl mb-4 animate-pulse">
                    <Clock className="h-6 w-6" />
                </div>
                <div className="text-5xl font-black tracking-tighter text-slate-800 dark:text-white tabular-nums flex items-baseline gap-2">
                    {currentTime ? format(currentTime, 'hh:mm:ss', { locale: ar }) : '--:--:--'}
                    <span className="text-xl text-primary">{currentTime ? format(currentTime, 'a', { locale: ar }) : ''}</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Local Sync Time</p>
            </div>
        </Card>

        {/* Right: Premium Welcome Card */}
        <Card className="lg:col-span-2 border-0 shadow-2xl rounded-[3rem] bg-gradient-to-br from-indigo-600 via-indigo-500 to-primary text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
            
            <CardContent className="h-full p-10 flex flex-col justify-between relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                            <Sparkles className="h-3 w-3" />
                            Premium Dashboard
                        </div>
                        <h2 className="text-4xl font-black leading-none">أهلاً بك،</h2>
                        <h3 className="text-2xl font-bold opacity-90">{user?.displayName || 'Ahmed Kamal'} 👋</h3>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[2rem] border border-white/20 text-center min-w-[140px]">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">تاريخ اليوم</p>
                        <p className="text-sm font-black">{currentTime ? format(currentTime, 'EEEE، d MMMM', { locale: ar }) : '...'}</p>
                    </div>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                    <p className="text-xs font-medium text-white/70 italic">"الإبداع يبدأ عندما تتوقف عن التفكير في القواعد."</p>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '200ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Main Command Center (The Dark Platform) */}
      <Card className="border-0 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[4.5rem] bg-[#0A0F1E] text-white overflow-hidden relative min-h-[500px] hover-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20 pointer-events-none" />
        
        <CardContent className="p-12 md:p-20 relative z-10 flex flex-col justify-center h-full">
            <div className="flex flex-col xl:flex-row gap-16 items-center">
                
                {/* Visual Stats Grid */}
                <div className="grid grid-cols-2 gap-6 w-full xl:w-[450px] shrink-0">
                    {[
                        { label: 'إجمالي الطلاب', value: stats.total, icon: Users, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
                        { label: 'حضور اليوم', value: stats.attended, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
                        { label: 'غياب اليوم', value: stats.absent, icon: UserX, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
                        { label: 'مدفوعات الشهر', value: stats.paid, icon: Wallet, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
                    ].map((s, i) => (
                        <div key={i} className={`bg-white/[0.04] border border-white/10 p-8 rounded-[3rem] text-center space-y-3 hover:bg-white/[0.08] transition-all duration-500 group relative overflow-hidden ${s.shadow}`}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg`}>
                                <s.icon className="h-6 w-6" />
                            </div>
                            <div className="text-4xl font-black tabular-nums tracking-tighter">{s.value}</div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Hero Text & Premium Actions */}
                <div className="flex-grow text-center xl:text-right space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-2xl border border-indigo-500/20">
                            <Zap className="h-4 w-4 fill-current" />
                            <span className="text-xs font-black uppercase tracking-widest">v3.0 Next-Gen Admin</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black leading-[1] tracking-tighter">
                            الذكاء في <br/> <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-indigo-300">إدارة التعليم</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-2xl font-medium max-w-2xl xl:ml-0 xl:mr-auto leading-relaxed">بوابتك الرقمية المتطورة لمتابعة أدق تفاصيل طلابك بأسلوب عصري ومبسط.</p>
                    </div>

                    <div className="flex flex-wrap gap-5 justify-center xl:justify-start">
                        <Button 
                            onClick={(e) => handleProtectedClick(e, '/attendance')}
                            className="rounded-[2rem] h-20 px-12 font-black gap-4 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.4)] bg-primary hover:bg-indigo-700 text-xl transition-all hover:-translate-y-1"
                        >
                            <CalendarCheck className="h-8 w-8" /> سجل الحضور الآن
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={(e) => handleProtectedClick(e, '/students')}
                            className="rounded-[2rem] h-20 px-10 font-black gap-3 border-white/10 bg-white/5 hover:bg-white/10 text-white text-lg backdrop-blur-md"
                        >
                            <Users className="h-6 w-6" /> إدارة الطلاب
                        </Button>
                        <Button 
                            onClick={(e) => handleProtectedClick(e, '/accounting-period')}
                            className="rounded-[2rem] h-20 px-10 font-black gap-3 bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-600/20 text-lg transition-all hover:-translate-y-1"
                        >
                            <History className="h-6 w-6" /> الفترة المحاسبية
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={(e) => handleProtectedClick(e, '/schedule')}
                            className="rounded-[2rem] h-20 px-10 font-black gap-3 border-white/10 bg-white/5 hover:bg-white/10 text-white text-lg"
                        >
                            <Clock className="h-6 w-6" /> جدول المواعيد
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Modern Stage Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: 'المرحلة الابتدائية', desc: 'تأسيس المستقبل من الصف الأول للسادس', icon: School, href: '/stage/primary', color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-100' },
          { name: 'المرحلة الإعدادية', desc: 'بناء الشخصية من الأول للثالث الإعدادي', icon: Building2, href: '/stage/preparatory', color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-100' },
          { name: 'المرحلة الثانوية', desc: 'طريق النجاح من الأول للثالث الثانوي', icon: GraduationCap, href: '/stage/secondary', color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-100' },
        ].map((stage) => (
          <button key={stage.name} onClick={(e) => handleProtectedClick(e, stage.href)} className="group text-right outline-none">
            <Card className={`border border-transparent hover:border-primary/20 bg-white dark:bg-slate-900 shadow-xl rounded-[3.5rem] p-12 text-center flex flex-col items-center gap-8 group-hover:-translate-y-4 transition-all duration-700 h-full relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[4rem] transition-all group-hover:scale-150`} />
                <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center ${stage.bg} ${stage.color} group-hover:rotate-12 transition-transform shadow-inner relative z-10`}>
                    <stage.icon className="w-14 h-14" />
                </div>
                <div className="space-y-4 relative z-10">
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">{stage.name}</h3>
                    <p className="text-sm text-slate-400 font-bold leading-relaxed max-w-[200px]">{stage.desc}</p>
                </div>
                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30">
                        <ArrowRight className="h-5 w-5 rotate-180" />
                    </div>
                </div>
            </Card>
          </button>
        ))}
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[4rem] border-0 shadow-[0_50px_100px_rgba(0,0,0,0.4)] max-w-md overflow-hidden p-0 bg-white">
          <div className="bg-primary h-3 w-full" />
          <div className="p-12 space-y-10 text-right">
              <DialogHeader className="text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <ShieldCheck className="h-12 w-12 text-primary" />
                </div>
                <DialogTitle className="text-4xl font-black text-slate-900">هوية المعلم</DialogTitle>
                <DialogDescription className="font-bold pt-4 text-slate-400 leading-relaxed text-lg">
                  هذا النطاق مخصص للمعلمين المسجلين فقط. يرجى إثبات هويتك للمتابعة.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                 <Button onClick={() => router.push('/login')} className="h-16 rounded-[1.5rem] font-black text-xl gap-4 shadow-2xl shadow-primary/30 bg-primary hover:bg-indigo-700 transition-all">
                   <LogIn className="h-6 w-6" /> تسجيل الدخول
                 </Button>
                 <Button onClick={() => router.push('/signup')} variant="outline" className="h-16 rounded-[1.5rem] font-black text-xl gap-4 border-slate-200 hover:bg-slate-50 text-slate-600 transition-all">
                   <UserPlus className="h-6 w-6" /> إنشاء حساب جديد
                 </Button>
              </div>
              <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Secured by TECH Admin System</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}