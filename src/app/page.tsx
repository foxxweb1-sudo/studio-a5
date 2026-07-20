
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
  LayoutDashboard,
  Bell,
  Coffee,
  Heart,
  UserCheck,
  Star,
  DownloadCloud,
  Smartphone,
  AppWindow
} from 'lucide-react';
import { useAppConfig } from '@/hooks/use-app-config';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import placeholderImages from '@/app/lib/placeholder-images.json';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { user } = useUser();
  const { config } = useAppConfig();
  const router = useRouter();
  const { toast } = useToast();
  
  const { students, isLoading: studentsLoading } = useStudents();
  const { attendance, isLoading: attendanceLoading } = useAttendance();
  const { payments, isLoading: paymentsLoading } = usePayments();

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // التعامل مع حدث تثبيت الـ PWA
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      toast({ title: "شكراً لك!", description: "يتم الآن تثبيت التطبيق على جهازك." });
    }
    setDeferredPrompt(null);
  };

  const handleDownloadApk = () => {
    if (config.apkDownloadUrl && config.apkDownloadUrl !== '#') {
      window.open(config.apkDownloadUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 px-4">
      
      {/* PWA Install Banner */}
      {isInstallable && (
        <div className="animate-in slide-in-from-top-4 duration-700">
           <Card className="border-0 shadow-2xl rounded-[2rem] bg-indigo-900 text-white overflow-hidden relative group">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite]" />
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4 text-center sm:text-right">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <AppWindow className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black">تثبيت التطبيق على جهازك</h4>
                        <p className="text-xs font-medium text-white/70">استخدم المنصة كأنه تطبيق أصلي، أسرع وبدون إنترنت.</p>
                      </div>
                  </div>
                  <Button 
                    onClick={handleInstallApp}
                    className="bg-white text-indigo-900 hover:bg-slate-100 rounded-2xl h-12 px-10 font-black text-base shadow-xl"
                  >
                    تثبيت الآن
                  </Button>
              </CardContent>
           </Card>
        </div>
      )}

      {/* Upper Row: Welcome & Time Compact Side-by-Side */}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        
        {/* Right: Compact Welcome Card */}
        <Card className="border-0 shadow-xl rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-500 to-primary text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            
            {/* Action Buttons Column (Top Left) */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <a 
                  href={config.updatesUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all border border-white/10 hover:scale-110 active:scale-95 group/bell relative"
                  title="الإشعارات والتحديثات"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                </a>

                <button 
                  onClick={(e) => handleProtectedClick(e, '/offline-sync')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all border border-white/10 hover:scale-110 active:scale-95 group/sync"
                  title="العمل بدون إنترنت ومزامنة البيانات"
                >
                  <DownloadCloud className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button 
                      className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all border border-white/10 hover:scale-110 active:scale-95 group/apk"
                      title="تحميل تطبيق الأندرويد APK"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5 fill-emerald-300" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.523 15.3414c-.551 0-.999-.448-.999-.999s.448-.999.999-.999.999.448.999.999-.448.999-.999.999m-11.046 0c-.551 0-.999-.448-.999-.999s.448-.999.999-.999.999.448.999.999-.448.999-.999.999m11.4045-6.02l1.9973-3.4592a.416.416 0 10-.7205-.416l-2.0223 3.5028C14.0045 8.3514 13.0374 8.0163 12 8.0163c-1.0374 0-2.0045.3351-2.856 1.009L7.1217 5.5225a.416.416 0 10-.7205.416L8.3985 9.3214C6.0125 10.514 4.3983 12.8716 4.3983 15.656h15.2034c0-2.7844-1.6142-5.142-3.9997-6.3346"/>
                      </svg>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2.5rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-right text-xl font-black">تحميل تطبيق المنصة (APK)</AlertDialogTitle>
                      <AlertDialogDescription className="text-right font-bold leading-relaxed">
                        أنت على وشك التوجه لتحميل النسخة الخاصة بنظام الأندرويد (APK). يرجى التأكد من السماح بتثبيت التطبيقات من مصادر غير معروفة في إعدادات هاتفك.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse gap-2">
                      <AlertDialogAction onClick={handleDownloadApk} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold flex-1 h-12">تأكيد التوجيه</AlertDialogAction>
                      <AlertDialogCancel className="rounded-xl font-bold flex-1 h-12">إلغاء</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>

            <CardContent className="h-full p-4 sm:p-6 flex flex-col justify-center relative z-10">
                <div className="space-y-1 text-right">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider mb-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        Smart Panel
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black leading-none">أهلاً بك،</h2>
                    <h3 className="text-sm sm:text-xl font-bold opacity-90 truncate max-w-full">
                        {user?.displayName || 'المعلم'} 👋
                    </h3>
                    <p className="text-[10px] font-medium opacity-70 mt-1">
                        {currentTime ? format(currentTime, 'EEEE، d MMMM', { locale: ar }) : '...'}
                    </p>
                </div>
            </CardContent>
        </Card>

        {/* Left: Compact Digital Clock */}
        <Card className="border-0 shadow-xl rounded-[2rem] bg-white dark:bg-slate-900 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="p-2 bg-primary/10 text-primary rounded-xl mb-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="text-xl sm:text-3xl font-black tracking-tighter text-slate-800 dark:text-white tabular-nums flex items-baseline gap-1">
                    {currentTime ? format(currentTime, 'hh:mm:ss', { locale: ar }) : '--:--:--'}
                    <span className="text-xs sm:text-base text-primary font-bold">{currentTime ? format(currentTime, 'a', { locale: ar }) : ''}</span>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">System Time</p>
            </div>
        </Card>
      </div>

      {/* Main Command Center (The Dark Platform) */}
      <Card className="border-0 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[4rem] bg-[#0A0F1E] text-white overflow-hidden relative min-h-[450px] hover-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_50%)]" />
        
        <CardContent className="p-8 md:p-16 relative z-10 flex flex-col justify-center h-full">
            <div className="flex flex-col xl:flex-row gap-12 items-center">
                
                {/* Hero Text & Premium Actions (Right Side in RTL) */}
                <div className="flex-grow text-center xl:text-right space-y-10 order-1">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tighter">
                            إدارة ذكية <br/> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-indigo-300">
                              لمستقبل تعليمي أفضل
                            </span>
                        </h1>
                        <p className="text-slate-400 text-base md:text-xl font-medium max-w-2xl xl:ml-0 xl:mr-auto leading-relaxed">
                          تابع حضور طلابك ومدفوعاتهم بدقة متناهية وسهولة تامة.
                        </p>
                    </div>

                    <div className="flex flex-col gap-5 items-center xl:items-end">
                        {/* Upper Buttons Row */}
                        <div className="flex flex-wrap gap-4 justify-center xl:justify-start">
                            <button 
                                onClick={(e) => handleProtectedClick(e, '/attendance')}
                                className="rounded-[1.5rem] h-16 px-10 font-black gap-3 shadow-lg bg-blue-600 hover:bg-blue-700 text-white text-lg transition-all flex items-center"
                            >
                                <CalendarCheck className="h-6 w-6" /> تسجيل الحضور الآن
                            </button>
                            <button 
                                onClick={(e) => handleProtectedClick(e, '/students')}
                                className="rounded-[1.5rem] h-16 px-8 font-black gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-base backdrop-blur-md flex items-center"
                            >
                                <Users className="h-5 w-5" /> عرض جميع الطلاب
                            </button>
                            <button 
                                onClick={(e) => handleProtectedClick(e, '/schedule')}
                                className="rounded-[1.5rem] h-16 px-8 font-black gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-base flex items-center"
                            >
                                <Clock className="h-5 w-5" /> مواعيد العمل
                            </button>
                        </div>
                        
                        {/* Lower Button Row */}
                        <button 
                            onClick={(e) => handleProtectedClick(e, '/accounting-period')}
                            className="rounded-[1.5rem] h-16 px-12 font-black gap-2 bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/20 text-white text-lg w-full sm:w-auto flex items-center justify-center"
                        >
                            <History className="h-5 w-5" /> الفترة المحاسبية
                        </button>
                    </div>
                </div>

                {/* Visual Stats Grid (Left Side in RTL) */}
                <div className="grid grid-cols-2 gap-4 w-full xl:w-[420px] shrink-0 order-2">
                    {[
                        { label: 'حضور اليوم', value: stats.attended, icon: CheckCircle2, color: 'text-emerald-500', shadow: 'shadow-emerald-500/20' },
                        { label: 'إجمالي الطلاب', value: stats.total, icon: Users, color: 'text-blue-500', shadow: 'shadow-blue-500/20' },
                        { label: 'مدفوعات الشهر', value: stats.paid, icon: Wallet, color: 'text-amber-500', shadow: 'shadow-amber-500/20' },
                        { label: 'غياب اليوم', value: stats.absent, icon: Clock, color: 'text-rose-500', shadow: 'shadow-rose-500/20' },
                    ].map((s, i) => (
                        <div key={i} className={`bg-white/[0.04] border border-white/10 p-7 rounded-[2.5rem] text-center space-y-2 hover:bg-white/[0.08] transition-all duration-500 group relative overflow-hidden`}>
                            <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.05] ${s.color} shadow-lg mb-3`}>
                                <s.icon className="h-6 w-6" />
                            </div>
                            <div className="text-4xl font-black tabular-nums tracking-tighter">{s.value}</div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{s.label}</p>
                        </div>
                    ))}
                </div>

            </div>
        </CardContent>
      </Card>

      {/* Modern Stage Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'المرحلة الابتدائية', desc: 'تأسيس المستقبل من الأول للسادس', icon: School, href: '/stage/primary', color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { name: 'المرحلة الإعدادية', desc: 'بناء الشخصية من الأول للثالث', icon: Building2, href: '/stage/preparatory', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { name: 'المرحلة الثانوية', desc: 'طريق النجاح من الأول للثالث', icon: GraduationCap, href: '/stage/secondary', color: 'text-violet-500', bg: 'bg-violet-500/5' },
        ].map((stage) => (
          <button key={stage.name} onClick={(e) => handleProtectedClick(e, stage.href)} className="group text-right outline-none">
            <Card className={`border border-transparent hover:border-primary/20 bg-white dark:bg-slate-900 shadow-lg rounded-[3rem] p-8 text-center flex flex-col items-center gap-6 group-hover:-translate-y-2 transition-all duration-500 h-full relative overflow-hidden`}>
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${stage.bg} ${stage.color} group-hover:rotate-12 transition-transform shadow-inner`}>
                    <stage.icon className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{stage.name}</h3>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">{stage.desc}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-primary text-white rounded-xl shadow-lg">
                        <ArrowRight className="h-4 w-4 rotate-180" />
                    </div>
                </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Support Banner (Buy Me a Coffee) */}
      <Link href="/support" className="block group">
        <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-white relative transition-all duration-500 hover:scale-[1.01] hover:shadow-amber-500/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
            
            <CardContent className="p-8 sm:p-10 relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 text-center sm:text-right">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <Coffee className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl sm:text-3xl font-black">Buy Me a Coffee</h3>
                            <p className="text-sm font-bold opacity-90">ادعم تطوير التطبيق واستمرارية فريق TECH</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex -space-x-4 space-x-reverse">
                           {[1, 2, 3].map(i => (
                               <div key={i} className="w-10 h-10 rounded-full border-2 border-amber-500 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                   <Heart className="h-4 w-4 text-white fill-current" />
                               </div>
                           ))}
                        </div>
                        <div className="rounded-2xl h-14 px-8 bg-white text-amber-600 font-black text-lg hover:bg-slate-50 gap-2 shadow-xl flex items-center">
                            ادعمنا الآن
                            <ArrowRight className="h-5 w-5 rotate-180" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </Link>

      {/* Plans Banner (Personal Assistant) */}
      <Link href="/plans" className="block group">
        <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white relative transition-all duration-500 hover:scale-[1.01] hover:shadow-emerald-500/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            
            <CardContent className="p-8 sm:p-10 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-inner shrink-0">
                            <UserCheck className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <h3 className="text-2xl sm:text-3xl font-black">باقة المساعد الشخصي</h3>
                                <Badge className="bg-yellow-400 text-emerald-900 font-black px-2 py-0.5 rounded-lg text-[10px]">الأكثر مبيعاً</Badge>
                            </div>
                            <p className="text-sm font-bold opacity-90 leading-relaxed max-w-xl">
                                احصل على مساعد متخصص مهمته إدارة حسابك بالكامل، تسجيل بيانات طلابك، ومتابعة حضورهم ومالياتهم، مع تواصل مباشر عبر WhatsApp على مدار الساعة.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center lg:items-end gap-4 shrink-0">
                        <div className="text-center lg:text-right">
                            <div className="flex items-baseline gap-1 justify-center lg:justify-end">
                                <span className="text-5xl font-black tabular-nums tracking-tighter">100</span>
                                <span className="text-xl font-bold opacity-80">ج.م</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">اشتراك شهري شامل</p>
                        </div>
                        <div 
                            className="rounded-2xl h-16 px-12 bg-white text-emerald-700 font-black text-xl hover:bg-emerald-50 gap-3 shadow-xl transition-all active:scale-95 flex items-center"
                        >
                            <Star className="h-6 w-6 fill-emerald-700" />
                            عرض التفاصيل
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </Link>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] border-0 shadow-2xl max-w-md overflow-hidden p-0 bg-white">
          <div className="bg-primary h-2 w-full" />
          <div className="p-10 space-y-8 text-right">
              <DialogHeader className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900">هوية المعلم</DialogTitle>
                <DialogDescription className="font-bold pt-2 text-slate-400 leading-relaxed">
                  هذا النطاق مخصص للمعلمين المسجلين فقط. يرجى إثبات هويتك للمتابعة.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => router.push('/login')} className="h-14 rounded-2xl font-black text-lg gap-3 shadow-lg bg-primary hover:bg-indigo-700 transition-all">
                   <LogIn className="h-5 w-5" /> تسجيل الدخول
                 </Button>
                 <Button onClick={() => router.push('/signup')} variant="outline" className="h-14 rounded-2xl font-black text-lg gap-3 border-slate-200 hover:bg-slate-50 text-slate-600 transition-all">
                   <UserPlus className="h-5 w-5" /> إنشاء حساب جديد
                 </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
