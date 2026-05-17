
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useStudents, useAttendance, usePayments, usePaymentSettings } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, School, Building, CalendarCheck, ShieldCheck, Users, Wallet, Clock, Calendar, Bell, ArrowRightLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ADMIN_EMAIL } from '@/lib/constants';
import { useAppConfig } from '@/hooks/use-app-config';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

const GRADES = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي', 'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
];

const YEARS = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 1 + i).toString());
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, '0'),
  label: format(new Date(2000, i), "MMMM", { locale: ar }),
}));

export default function Home() {
  const { user } = useUser();
  const { config } = useAppConfig();
  const { students } = useStudents();
  const { attendance } = useAttendance();
  const { payments } = usePayments();
  const { settings, updateGradeSettings, isLoading: settingsLoading } = usePaymentSettings();
  const { toast } = useToast();

  const [now, setNow] = useState<Date | null>(null);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  
  // إعدادات الفترة المحاسبية
  const [selectedGrade, setSelectedGrade] = useState(GRADES[0]);
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [startMonth, setStartMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());
  const [endMonth, setEndMonth] = useState('12');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    
    const lastSeenUrl = localStorage.getItem('last_seen_update_url');
    if (config.updatesUrl && config.updatesUrl !== '#' && lastSeenUrl !== config.updatesUrl) {
      setHasNewUpdate(true);
    }

    return () => clearInterval(timer);
  }, [config.updatesUrl]);

  // تحديث الحقول عند تغيير الصف المختار
  useEffect(() => {
    if (settings?.grades?.[selectedGrade]) {
      const gConfig = settings.grades[selectedGrade];
      const [sy, sm] = gConfig.startMonth.split('-');
      setStartYear(sy);
      setStartMonth(sm);
      if (gConfig.endMonth) {
        const [ey, em] = gConfig.endMonth.split('-');
        setEndYear(ey);
        setEndMonth(em);
      }
    }
  }, [selectedGrade, settings]);

  const handleUpdateClick = () => {
    if (config.updatesUrl && config.updatesUrl !== '#') {
      localStorage.setItem('last_seen_update_url', config.updatesUrl);
      setHasNewUpdate(false);
      window.open(config.updatesUrl, '_blank');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateGradeSettings(selectedGrade, {
        startMonth: `${startYear}-${startMonth}`,
        endMonth: `${endYear}-${endMonth}`
      });
      toast({ 
        title: "تم الحفظ", 
        description: `تم تحديث الفترة المحاسبية لـ (${selectedGrade}) بنجاح.` 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const attendedToday = attendance.filter(a => a.date === today).length;
    
    return [
      { label: 'إجمالي الطلاب', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'حضور اليوم', value: attendedToday, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      { label: 'غياب اليوم', value: totalStudents - attendedToday, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-100' },
      { label: 'مدفوعات الشهر', value: payments.filter(p => p.month === currentMonth).length, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];
  }, [students, attendance, payments, today, currentMonth]);

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center text-center py-12">
        <PageHeader className="border-0">
            <PageHeaderTitle className="text-4xl md:text-5xl text-primary font-black">مرحباً أيها المشرف</PageHeaderTitle>
            <PageHeaderTitle className="text-lg font-bold opacity-60">
                أنت تستخدم حساب الإدارة الرئيسي ({ADMIN_EMAIL})
            </PageHeaderTitle>
        </PageHeader>
        <Link href="/admin" className="w-full max-w-md group">
            <Card className="hover-lift overflow-hidden border-2 border-primary/20 bg-white/50 backdrop-blur-md">
                <CardContent className="flex flex-col items-center justify-center p-12 gap-6 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transform group-hover:rotate-12 transition-transform">
                        <ShieldCheck className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">لوحة تحكم المشرف</h2>
                      <p className="text-muted-foreground">عرض وإدارة جميع بيانات النظام.</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 py-4">
      {/* قسم الوقت والترحيب */}
      {now && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-r from-primary to-blue-600 text-white rounded-[2rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
              <Calendar className="w-32 h-32" />
            </div>
            <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black mb-2">أهلاً بك، {user?.displayName || 'أستاذنا'} 👋</h2>
                  <p className="text-blue-100 font-bold text-sm">نتمنى لك يوماً دراسياً موفقاً ومليئاً بالإنجازات.</p>
                </div>
                <div className="relative">
                  <Button 
                    onClick={handleUpdateClick}
                    variant="ghost" 
                    className="h-14 w-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-all group"
                  >
                    <Bell className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                    {hasNewUpdate && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-primary"></span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 bg-white/10 w-fit px-5 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                 <Calendar className="h-4 w-4 text-blue-200" />
                 <span className="text-sm font-black">{format(now, 'eeee، d MMMM yyyy', { locale: ar })}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center p-6 text-center border-b-4 border-b-primary">
            <div className="p-3 bg-primary/10 rounded-2xl mb-2">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white tabular-nums">
              {format(now, 'hh:mm:ss a', { locale: ar })}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">الوقت الآن بتوقيتك المحلي</p>
          </Card>
        </div>
      )}

      {/* قسم إدارة الفترات المحاسبية */}
      <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b p-8">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                      <ArrowRightLeft className="h-6 w-6" />
                  </div>
                  <div>
                      <CardTitle className="text-2xl font-black">إدارة الفترات المحاسبية</CardTitle>
                      <CardDescription className="text-amber-700/60 dark:text-amber-200/40 font-bold">حدد نطاق المتأخرات المالية لكل صف دراسي على حدة.</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* اختيار الصف */}
                  <div className="space-y-4">
                      <Label className="font-black text-slate-400 uppercase text-[10px] tracking-widest px-1">1. اختر الصف الدراسي</Label>
                      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 font-black text-lg">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                              {GRADES.map(g => <SelectItem key={g} value={g} className="font-bold py-3">{g}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>

                  {/* نطاق البداية والنهاية */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                          <Label className="font-black text-primary text-sm flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> 2. بداية الفترة
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                              <Select value={startYear} onValueChange={setStartYear}>
                                  <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              <Select value={startMonth} onValueChange={setStartMonth}>
                                  <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>

                      <div className="space-y-4 p-6 rounded-[2rem] bg-emerald-50/50 border border-emerald-100">
                          <Label className="font-black text-emerald-600 text-sm flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> 3. نهاية الفترة
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                              <Select value={endYear} onValueChange={setEndYear}>
                                  <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              <Select value={endMonth} onValueChange={setEndMonth}>
                                  <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-dashed">
                  <p className="text-xs text-slate-500 font-bold max-w-xl text-center md:text-right">
                      * النظام سيقوم بحساب الشهور المتأخرة لطلاب <span className="text-primary">({selectedGrade})</span> فقط ضمن هذا النطاق المختار، ولن يطالبهم بأي مبالغ خارج هذه التواريخ.
                  </p>
                  <Button 
                      onClick={handleSaveSettings} 
                      disabled={isSaving || settingsLoading}
                      className="w-full md:w-auto h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 px-12 bg-primary hover:bg-primary/90"
                  >
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      حفظ إعدادات الصف
                  </Button>
              </div>
          </CardContent>
      </Card>

      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center lg:text-right">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              إدارة ذكية <br /> <span className="text-primary">لمستقبل تعليمي</span> أفضل
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto lg:mx-0">
              تابع حضور طلابك ومدفوعاتهم بدقة متناهية وسهولة تامة.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/attendance">
                <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5" />
                  تسجيل الحضور الآن
                </button>
              </Link>
              <Link href="/students">
                <button className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold shadow-lg hover:bg-white/20 transition-all flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  عرض جميع الطلاب
                </button>
              </Link>
              <Link href="/schedule">
                <button className="px-8 py-4 bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl font-bold shadow-lg hover:bg-slate-700 transition-all flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  مواعيد العمل
                </button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col items-center gap-2">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-xs text-slate-500 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <Link href={`/stage/${stage.slug}`} key={stage.slug} className="group">
            <Card className="h-full border-0 bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="flex flex-col items-center p-10 gap-6 text-center">
                <div className={`flex items-center justify-center w-24 h-24 rounded-[2rem] ${stage.color}`}>
                  <stage.icon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold">{stage.name}</h3>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
