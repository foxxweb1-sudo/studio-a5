
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, 
  User, 
  GraduationCap, 
  CalendarCheck, 
  Wallet, 
  School, 
  Smartphone,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Award
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

  // جلب بيانات المدرس
  const teacherRef = useMemoFirebase(() => doc(firestore, 'users', teacherId), [firestore, teacherId]);
  const { data: teacher, isLoading: teacherLoading } = useDoc<any>(teacherRef);

  // جلب بيانات الطالب
  const studentRef = useMemoFirebase(() => doc(firestore, `users/${teacherId}/students`, studentId), [firestore, teacherId, studentId]);
  const { data: student, isLoading: studentLoading } = useDoc<any>(studentRef);

  // جلب سجل الحضور
  const attendanceQuery = useMemoFirebase(() => 
    query(
      collection(firestore, `users/${teacherId}/attendance`), 
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    ), [firestore, teacherId, studentId]);
  const { data: attendance, isLoading: attendanceLoading } = useCollection<any>(attendanceQuery);

  // جلب سجل المدفوعات
  const paymentsQuery = useMemoFirebase(() => 
    query(
      collection(firestore, `users/${teacherId}/payments`), 
      where('studentId', '==', studentId),
      orderBy('month', 'desc')
    ), [firestore, teacherId, studentId]);
  const { data: payments, isLoading: paymentsLoading } = useCollection<any>(paymentsQuery);

  // حساب الإحصائيات بذكاء
  const stats = useMemo(() => {
    if (!attendance) return { rate: 0, present: 0, total: 0 };
    const presentCount = attendance.filter((a: any) => a.status === 'present').length;
    const totalCount = attendance.length;
    const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
    return { rate, present: presentCount, total: totalCount };
  }, [attendance]);

  const lastPayment = useMemo(() => {
    if (!payments || payments.length === 0) return null;
    return payments[0]; // لأن الاستعلام مرتب تنازلياً
  }, [payments]);

  const isLoading = teacherLoading || studentLoading || attendanceLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4 bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-black text-slate-400 animate-pulse">جاري جلب تقرير الطالب...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 text-center px-4 bg-slate-50">
        <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border-2 border-dashed border-rose-100">
            <School className="h-20 w-20 text-rose-500 mb-4 mx-auto" />
            <h1 className="text-2xl font-black text-slate-800">عذراً، الرابط غير متاح</h1>
            <p className="text-slate-400 mt-2 font-bold max-w-xs">يبدو أن البيانات قد تم نقلها أو أن الرابط غير صحيح.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 px-4 sm:px-6" dir="rtl">
      <div className="max-w-4xl mx-auto pt-10 space-y-10">
        
        {/* الهوية البصرية للمدرس */}
        <div className="flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-3">
                <Image src={config.appLogo} alt="Logo" fill className="object-contain p-2 bg-white" />
            </div>
            <div className="space-y-1">
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">المعلم المسؤول</span>
                <h1 className="text-4xl font-black text-slate-900">{teacher?.displayName || 'مدرس المادة'}</h1>
            </div>
        </div>

        {/* لوحة التحكم الذكية (Stats Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">نسبة الانضباط</p>
                        <h4 className="text-3xl font-black text-emerald-600">{stats.rate}%</h4>
                    </div>
                    <div className="w-full space-y-1 mt-2">
                        <Progress value={stats.rate} className="h-2 bg-slate-100" />
                        <p className="text-[9px] font-bold text-slate-400">حضر {stats.present} من أصل {stats.total} حصة</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <Wallet className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">آخر دفعة مستلمة</p>
                        <h4 className="text-2xl font-black text-slate-800">
                            {lastPayment ? `${lastPayment.amount} ج.م` : 'لا يوجد'}
                        </h4>
                    </div>
                    {lastPayment && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold">
                            عن شهر: {format(parse(lastPayment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                        </Badge>
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-[2rem] bg-primary text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                    <Award className="h-32 w-32" />
                </div>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3 relative z-10 h-full justify-center">
                    <div className="p-4 bg-white/20 rounded-2xl">
                        <User className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black truncate w-[180px]">{student.name}</h3>
                        <p className="text-[10px] font-bold opacity-80">{student.grade}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* السجلات التفصيلية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* سجل الحضور */}
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden border-t-8 border-emerald-500">
                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                            <CalendarCheck className="h-5 w-5" />
                        </div>
                        سجل الحضور والغياب
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[450px] overflow-auto">
                        {attendance && attendance.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-right px-8 font-black text-slate-400">التاريخ</TableHead>
                                        <TableHead className="text-center px-8 font-black text-slate-400">الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.map((record: any) => (
                                        <TableRow key={record.id} className="group transition-colors">
                                            <TableCell className="px-8 py-5 font-bold text-slate-700">
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{format(new Date(record.date), 'eeee, d MMMM', { locale: ar })}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{format(new Date(record.date), 'yyyy')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center px-8">
                                                {record.status === 'present' ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-500 rounded-xl px-4 py-1 gap-1.5 shadow-sm">
                                                        <CheckCircle2 className="h-3 w-3" /> حاضر
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-rose-500 hover:bg-rose-500 rounded-xl px-4 py-1 gap-1.5 shadow-sm">
                                                        <XCircle className="h-3 w-3" /> غائب
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-24 text-center text-slate-300 space-y-3 px-8">
                                <CalendarCheck className="h-12 w-12 mx-auto opacity-20" />
                                <p className="font-black text-sm italic">لا توجد سجلات حضور مسجلة حالياً.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* سجل المدفوعات */}
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden border-t-8 border-amber-500">
                <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-3">
                        <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
                            <Wallet className="h-5 w-5" />
                        </div>
                        سجل المدفوعات المالية
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[450px] overflow-auto">
                        {payments && payments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-right px-8 font-black text-slate-400">عن شهر</TableHead>
                                        <TableHead className="text-center px-8 font-black text-slate-400">المبلغ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment: any) => (
                                        <TableRow key={payment.id} className="group transition-colors">
                                            <TableCell className="px-8 py-5 font-black text-slate-800 text-sm">
                                                {format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                                            </TableCell>
                                            <TableCell className="text-center px-8">
                                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl font-black text-sm inline-block shadow-sm">
                                                    {payment.amount} ج.م
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-24 text-center text-slate-300 space-y-3 px-8">
                                <Wallet className="h-12 w-12 mx-auto opacity-20" />
                                <p className="font-black text-sm italic">لا توجد سجلات مدفوعات مسجلة حالياً.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* فوتر البوابة */}
        <div className="text-center space-y-6 pt-12">
            <div className="p-6 bg-slate-100 rounded-[2rem] inline-block border-2 border-white shadow-inner">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-1">تقرير ذكي مستخرج عبر</p>
                <h5 className="text-xl font-black text-primary tracking-tighter">{config.appName}</h5>
            </div>
            <p className="text-[9px] text-slate-400 font-bold">تاريخ التقرير: {new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>
      </div>
    </div>
  );
}
