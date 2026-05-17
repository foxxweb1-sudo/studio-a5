
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
  AlertCircle,
  Clock,
  Sparkles,
  Trophy
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

  const teacherRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'users', teacherId) : null, 
  [firestore, teacherId]);
  const { data: teacher, isLoading: teacherLoading } = useDoc<any>(teacherRef);

  const studentRef = useMemoFirebase(() => 
    firestore ? doc(firestore, `users/${teacherId}/students`, studentId) : null, 
  [firestore, teacherId, studentId]);
  const { data: student, isLoading: studentLoading } = useDoc<any>(studentRef);

  const attendanceQuery = useMemoFirebase(() => 
    firestore ? query(
      collection(firestore, `users/${teacherId}/attendance`), 
      where('studentId', '==', studentId),
      orderBy('date', 'desc'),
      limit(15)
    ) : null, [firestore, teacherId, studentId]);
  const { data: attendance, isLoading: attendanceLoading } = useCollection<any>(attendanceQuery);

  const paymentsQuery = useMemoFirebase(() => 
    firestore ? query(
      collection(firestore, `users/${teacherId}/payments`), 
      where('studentId', '==', studentId),
      orderBy('month', 'desc'),
      limit(12)
    ) : null, [firestore, teacherId, studentId]);
  const { data: payments, isLoading: paymentsLoading } = useCollection<any>(paymentsQuery);

  const stats = useMemo(() => {
    if (!attendance || attendance.length === 0) return { rate: 0, present: 0, absent: 0, total: 0, status: 'لا توجد بيانات' };
    const presentCount = attendance.filter((a: any) => a.status === 'present').length;
    const absentCount = attendance.filter((a: any) => a.status === 'absent').length;
    const totalCount = presentCount + absentCount;
    const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
    
    let status = 'ممتاز';
    if (rate < 80) status = 'جيد جداً';
    if (rate < 60) status = 'مقبول';
    if (rate < 50) status = 'يحتاج متابعة';

    return { rate, present: presentCount, absent: absentCount, total: totalCount, status };
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
                <Sparkles className="h-6 w-6 text-primary/40 animate-pulse" />
            </div>
        </div>
        <p className="font-black text-slate-400 animate-pulse text-lg">تحليل بيانات الطالب...</p>
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
            <h1 className="text-2xl font-black text-slate-800">رابط غير صالح</h1>
            <p className="text-slate-400 mt-3 font-bold leading-relaxed">عذراً، يبدو أن الرابط الذي تحاول الوصول إليه غير موجود أو تم حذفه من قبل الإدارة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 px-4 sm:px-6 font-body" dir="rtl">
      <div className="max-w-5xl mx-auto pt-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-50">
                    <Image src={config.appLogo} alt="Logo" fill className="object-contain p-2" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-900 leading-none mb-1">الأستاذ {teacher?.displayName || 'مدرس المادة'}</h1>
                    <p className="text-xs text-muted-foreground font-bold">بوابة المتابعة الذكية للأهل</p>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-black tracking-tight">التقرير محدث لحظياً</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-primary text-primary-foreground overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                <CardContent className="p-8 flex flex-col items-center text-center justify-center h-full relative z-10">
                    <div className="p-4 bg-white/20 rounded-2xl mb-4 backdrop-blur-md">
                        <User className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black mb-1 drop-shadow-sm">{student.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {student.grade}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-white overflow-hidden hover-lift">
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="rounded-full px-3 py-0.5 border-blue-100 text-blue-600 font-black text-[10px]">
                            حالة الانضباط: {stats.status}
                        </Badge>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <h4 className="text-4xl font-black text-slate-800">{stats.rate}%</h4>
                            <p className="text-[10px] font-bold text-slate-400">معدل الالتزام</p>
                        </div>
                        <Progress value={stats.rate} className="h-3 bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-3 rounded-2xl text-center">
                            <span className="block text-xs font-bold text-slate-400">حضور</span>
                            <span className="text-lg font-black text-emerald-600">{stats.present}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl text-center">
                            <span className="block text-xs font-bold text-slate-400">غياب</span>
                            <span className="text-lg font-black text-rose-500">{stats.absent}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-white overflow-hidden hover-lift">
                <CardContent className="p-8 space-y-6">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-800">
                            {lastPayment ? `${lastPayment.amount} ج.م` : 'لا توجد دفعات'}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">آخر دفعة تم استلامها</p>
                    </div>
                    {lastPayment ? (
                        <div className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-amber-700/60 font-bold">عن شهر</span>
                                <span className="text-sm font-black text-amber-700">
                                    {format(parse(lastPayment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs font-bold text-slate-400 italic">
                            لم يتم تسجيل أي مدفوعات مالية حتى الآن.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl rounded-[3rem] bg-white overflow-hidden flex flex-col">
                <CardHeader className="p-8 border-b bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                            <CalendarCheck className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-black">آخر سجلات الحضور</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <div className="max-h-[400px] overflow-auto">
                        {attendance && attendance.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-right px-8 py-5 font-black text-slate-400">اليوم والتاريخ</TableHead>
                                        <TableHead className="text-center px-8 py-5 font-black text-slate-400">الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.map((record: any) => (
                                        <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors border-b">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 text-sm">
                                                        {format(new Date(record.date), 'eeee, d MMMM', { locale: ar })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{format(new Date(record.date), 'yyyy')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center px-8">
                                                {record.status === 'present' ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white rounded-xl px-4 py-1 gap-1.5 border-0">
                                                        <CheckCircle2 className="h-3 w-3" /> حاضر
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-rose-500 hover:bg-rose-500 text-white rounded-xl px-4 py-1 gap-1.5 border-0">
                                                        <XCircle className="h-3 w-3" /> غائب
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-24 text-center text-slate-300 space-y-4">
                                <Clock className="h-12 w-12 mx-auto opacity-20" />
                                <p className="font-black italic">لا توجد سجلات حضور مسجلة حالياً.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-[3rem] bg-white overflow-hidden flex flex-col">
                <CardHeader className="p-8 border-b bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-black">سجل المدفوعات</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <div className="max-h-[400px] overflow-auto">
                        {payments && payments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-right px-8 py-5 font-black text-slate-400">عن شهر</TableHead>
                                        <TableHead className="text-center px-8 py-5 font-black text-slate-400">القيمة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment: any) => (
                                        <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors border-b">
                                            <TableCell className="px-8 py-6">
                                                <span className="font-black text-slate-800">
                                                    {format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center px-8">
                                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl font-black text-sm border border-emerald-100 inline-block">
                                                    {payment.amount} ج.م
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-24 text-center text-slate-300 space-y-4">
                                <Wallet className="h-12 w-12 mx-auto opacity-20" />
                                <p className="font-black italic">لم يتم العثور على أي بيانات دفع.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="text-center pt-16 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by</span>
                <span className="text-sm font-black text-primary tracking-tighter">{config.appName} Smart Reports</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium opacity-60">تاريخ التقرير: {new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}</p>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
