
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, 
  User, 
  GraduationCap, 
  CalendarCheck, 
  Wallet, 
  School, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useAppConfig } from '@/hooks/use-app-config';
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

export default function ParentPortalPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const studentId = params.studentId as string;
  const firestore = useFirestore();
  const { config } = useAppConfig();

  // 1. جلب بيانات المدرس
  const teacherRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'users', teacherId) : null, 
  [firestore, teacherId]);
  const { data: teacher, isLoading: teacherLoading } = useDoc<any>(teacherRef);

  // 2. جلب بيانات الطالب (فقط الطالب صاحب الرابط)
  const studentRef = useMemoFirebase(() => 
    firestore ? doc(firestore, `users/${teacherId}/students`, studentId) : null, 
  [firestore, teacherId, studentId]);
  const { data: student, isLoading: studentLoading } = useDoc<any>(studentRef);

  // 3. جلب سجل الحضور (مفلتر للطالب الحالي فقط)
  const attendanceQuery = useMemoFirebase(() => 
    firestore ? query(
      collection(firestore, `users/${teacherId}/attendance`), 
      where('studentId', '==', studentId),
      orderBy('date', 'desc'),
      limit(20)
    ) : null, [firestore, teacherId, studentId]);
  const { data: attendance, isLoading: attendanceLoading } = useCollection<any>(attendanceQuery);

  // 4. جلب سجل المدفوعات (مفلتر للطالب الحالي فقط)
  const paymentsQuery = useMemoFirebase(() => 
    firestore ? query(
      collection(firestore, `users/${teacherId}/payments`), 
      where('studentId', '==', studentId),
      orderBy('month', 'desc')
    ) : null, [firestore, teacherId, studentId]);
  const { data: payments, isLoading: paymentsLoading } = useCollection<any>(paymentsQuery);

  // حساب الإحصائيات بذكاء
  const stats = useMemo(() => {
    if (!attendance) return { rate: 0, present: 0, absent: 0, total: 0 };
    const presentCount = attendance.filter((a: any) => a.status === 'present').length;
    const absentCount = attendance.filter((a: any) => a.status === 'absent').length;
    const totalCount = presentCount + absentCount;
    const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
    return { rate, present: presentCount, absent: absentCount, total: totalCount };
  }, [attendance]);

  const lastPayment = useMemo(() => {
    if (!payments || payments.length === 0) return null;
    return payments[0];
  }, [payments]);

  const isLoading = teacherLoading || studentLoading || attendanceLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6 bg-slate-50">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-white rounded-full border-2 border-primary/20" />
            </div>
        </div>
        <p className="font-black text-slate-400 animate-pulse text-lg">جاري تحميل تقرير الطالب...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 text-center px-4 bg-slate-50">
        <div className="p-10 bg-white rounded-[3rem] shadow-2xl border-2 border-dashed border-rose-100 max-w-sm">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-rose-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">بيانات غير متاحة</h1>
            <p className="text-slate-400 mt-3 font-bold leading-relaxed">عذراً، يبدو أن رابط الطالب لم يعد متاحاً أو تم نقله من قبل الإدارة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 px-4 sm:px-6 font-body" dir="rtl">
      <div className="max-w-4xl mx-auto pt-10 space-y-8">
        
        {/* رأس التقرير الذكي */}
        <div className="flex flex-col items-center text-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-emerald-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative w-28 h-28 rounded-[2.2rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
                    <Image src={config.appLogo} alt="School Logo" fill className="object-contain p-3" />
                </div>
            </div>
            <div className="space-y-2">
                <span className="bg-primary/10 text-primary px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">بوابة المتابعة الذكية</span>
                <h1 className="text-4xl font-black text-slate-900 leading-tight">الأستاذ {teacher?.displayName || 'مدرس المادة'}</h1>
            </div>
        </div>

        {/* لوحة الإحصائيات (Dashboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {/* نسبة الانضباط */}
            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-white overflow-hidden hover-lift group">
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                    <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[2rem] group-hover:rotate-6 transition-transform">
                        <TrendingUp className="h-10 w-10" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">معدل الانضباط</p>
                        <h4 className="text-4xl font-black text-emerald-600">{stats.rate}%</h4>
                    </div>
                    <div className="w-full space-y-2 mt-2">
                        <Progress value={stats.rate} className="h-2.5 bg-slate-100" />
                        <p className="text-[10px] font-bold text-slate-400">حضر {stats.present} من إجمالي {stats.total} حصة</p>
                    </div>
                </CardContent>
            </Card>

            {/* آخر دفعة مالية */}
            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-white overflow-hidden hover-lift group">
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                    <div className="p-5 bg-amber-50 text-amber-600 rounded-[2rem] group-hover:-rotate-6 transition-transform">
                        <Wallet className="h-10 w-10" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">الوضع المالي</p>
                        <h4 className="text-3xl font-black text-slate-800">
                            {lastPayment ? `${lastPayment.amount} ج.م` : 'لا يوجد'}
                        </h4>
                    </div>
                    {lastPayment ? (
                        <div className="bg-amber-100/50 text-amber-700 px-4 py-1 rounded-xl text-[10px] font-black">
                            عن شهر: {format(parse(lastPayment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                        </div>
                    ) : (
                        <div className="text-[10px] text-slate-300 font-bold italic">لم يتم تسجيل مدفوعات</div>
                    )}
                </CardContent>
            </Card>

            {/* هوية الطالب */}
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-primary text-white overflow-hidden relative hover-lift group sm:col-span-2 md:col-span-1">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-6 -translate-y-6">
                    <Award className="h-40 w-40" />
                </div>
                <CardContent className="p-8 flex flex-col items-center text-center gap-4 relative z-10 h-full justify-center">
                    <div className="p-5 bg-white/20 rounded-[2rem] backdrop-blur-md">
                        <User className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black truncate max-w-[240px] drop-shadow-md">{student.name}</h3>
                        <p className="text-xs font-bold opacity-80 flex items-center justify-center gap-2">
                           <School className="h-3 w-3" /> {student.grade}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* السجلات التفصيلية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            {/* سجل الحضور */}
            <Card className="border-0 shadow-2xl rounded-[3rem] bg-white overflow-hidden border-t-[10px] border-emerald-500">
                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30">
                            <CalendarCheck className="h-6 w-6" />
                        </div>
                        سجل آخر 20 حصة
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-auto">
                        {attendance && attendance.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-2">
                                        <TableHead className="text-right px-10 py-5 font-black text-slate-400">اليوم والتاريخ</TableHead>
                                        <TableHead className="text-center px-10 py-5 font-black text-slate-400">حالة الحضور</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.map((record: any) => (
                                        <TableRow key={record.id} className="group transition-all hover:bg-slate-50/50 border-b">
                                            <TableCell className="px-10 py-6 font-bold text-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[15px]">{format(new Date(record.date), 'eeee, d MMMM', { locale: ar })}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">{format(new Date(record.date), 'yyyy')}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center px-10">
                                                {record.status === 'present' ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white rounded-2xl px-5 py-1.5 gap-2 shadow-sm border-0">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> حاضر
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-rose-500 hover:bg-rose-500 text-white rounded-2xl px-5 py-1.5 gap-2 shadow-sm border-0">
                                                        <XCircle className="h-3.5 w-3.5" /> غائب
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-32 text-center text-slate-300 space-y-4 px-10">
                                <CalendarCheck className="h-16 w-16 mx-auto opacity-10" />
                                <p className="font-black text-lg italic">لا توجد سجلات حضور مسجلة لهذا الطالب.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* سجل المدفوعات */}
            <Card className="border-0 shadow-2xl rounded-[3rem] bg-white overflow-hidden border-t-[10px] border-amber-500">
                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-4">
                        <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                            <Wallet className="h-6 w-6" />
                        </div>
                        سجل السداد المالي
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-auto">
                        {payments && payments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-2">
                                        <TableHead className="text-right px-10 py-5 font-black text-slate-400">عن شهر</TableHead>
                                        <TableHead className="text-center px-10 py-5 font-black text-slate-400">القيمة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment: any) => (
                                        <TableRow key={payment.id} className="group transition-all hover:bg-slate-50/50 border-b">
                                            <TableCell className="px-10 py-7 font-black text-slate-800 text-lg">
                                                {format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                                            </TableCell>
                                            <TableCell className="text-center px-10">
                                                <div className="bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-[1.5rem] font-black text-[16px] inline-flex items-center gap-2 shadow-sm border border-emerald-100">
                                                    <BadgeDollarSign className="h-5 w-5" />
                                                    {payment.amount} ج.م
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-32 text-center text-slate-300 space-y-4 px-10">
                                <Wallet className="h-16 w-16 mx-auto opacity-10" />
                                <p className="font-black text-lg italic">لا توجد سجلات مدفوعات مسجلة.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* فوتر احترافي */}
        <div className="text-center space-y-8 pt-16">
            <div className="inline-flex flex-col items-center gap-4 bg-white/50 backdrop-blur-sm p-8 rounded-[3rem] border border-white shadow-xl">
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em]">مدعوم تقنياً بواسطة</p>
                <h5 className="text-2xl font-black text-primary tracking-tighter hover:scale-105 transition-transform cursor-default">{config.appName}</h5>
                <div className="h-1.5 w-12 bg-primary/20 rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold opacity-60">تاريخ استخراج هذا التقرير: {new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

// أيقونة مفقودة من lucide-react سنحاكيها بـ SVG
function BadgeDollarSign({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L7 13" />
      <path d="m7 17 .9-1c.2-.3.5-.5.9-.5h4.2c1.1 0 2.1-.9 2.1-2 0-1-.9-2-2.1-2h-3.8c-1.1 0-2.1-.9-2.1-2 0-1.1.9-2 2.1-2h4.1c.3 0 .7.2.9.5l.9 1" />
      <path d="M12 7v10" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
