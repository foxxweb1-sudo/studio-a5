
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, GraduationCap, CalendarCheck, Wallet, School, Smartphone } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useAppConfig } from '@/hooks/use-app-config';

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

  const isLoading = teacherLoading || studentLoading || attendanceLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground animate-pulse">جاري جلب بيانات الطالب...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 text-center px-4">
        <div className="p-6 bg-rose-50 rounded-full">
            <School className="h-16 w-16 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">بيانات الطالب غير متاحة</h1>
        <p className="text-muted-foreground max-w-xs">يرجى التأكد من صحة الرابط أو التواصل مع المدرس.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 px-4 md:px-8" dir="rtl">
      {/* رأس الصفحة - معلومات المدرس */}
      <div className="max-w-4xl mx-auto pt-8 space-y-8">
        <div className="flex flex-col items-center text-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800">
                <Image src={config.appLogo} alt="App Logo" fill className="object-contain p-2" />
            </div>
            <div className="space-y-1">
                <h2 className="text-xs font-bold text-primary uppercase tracking-widest">المعلم المسؤول</h2>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{teacher?.displayName || 'مدرس المادة'}</h1>
            </div>
        </div>

        {/* بطاقة الطالب الرئيسية */}
        <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border-b-8 border-primary">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="p-6 bg-primary/10 rounded-[2rem] text-primary">
                    <User className="h-16 w-16" />
                </div>
                <div className="flex-grow text-center md:text-right space-y-4">
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground mb-1 uppercase">اسم الطالب</h3>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white">{student.name}</h2>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <Badge variant="secondary" className="px-6 py-2 rounded-xl font-bold text-sm bg-slate-100">
                            <GraduationCap className="h-4 w-4 ms-2" />
                            {student.grade}
                        </Badge>
                        {student.parentPhone && (
                            <Badge variant="outline" className="px-6 py-2 rounded-xl font-bold text-sm border-emerald-200 text-emerald-600">
                                <Smartphone className="h-4 w-4 ms-2" />
                                {student.parentPhone}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* شبكة البيانات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* سجل الحضور */}
            <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-emerald-500" />
                        سجل الحضور والغياب
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-auto">
                        {attendance && attendance.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right font-bold px-6">التاريخ</TableHead>
                                        <TableHead className="text-center font-bold px-6">الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.map((record: any) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="px-6 py-4 font-medium text-xs">
                                                {format(new Date(record.date), 'eeee, d MMMM yyyy', { locale: ar })}
                                            </TableCell>
                                            <TableCell className="text-center px-6">
                                                <Badge className={`rounded-lg px-4 ${record.status === 'present' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                                                    {record.status === 'present' ? 'حاضر' : 'غائب'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-20 text-center text-muted-foreground font-bold text-sm italic">لا توجد سجلات حضور مسجلة حتى الآن.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* سجل المدفوعات */}
            <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-amber-500" />
                        سجل المدفوعات المالية
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-auto">
                        {payments && payments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right font-bold px-6">الشهر</TableHead>
                                        <TableHead className="text-center font-bold px-6">المبلغ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="px-6 py-4 font-medium text-xs">
                                                {format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                                            </TableCell>
                                            <TableCell className="text-center px-6">
                                                <span className="font-black text-emerald-600 text-sm">{payment.amount} ج.م</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-20 text-center text-muted-foreground font-bold text-sm italic">لا توجد سجلات مدفوعات مسجلة حتى الآن.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="text-center space-y-4 pt-10">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                تم إنشاء هذا التقرير تلقائياً عبر تطبيق {config.appName}
            </p>
            <p className="text-[8px] opacity-40">تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')}</p>
        </div>
      </div>
    </div>
  );
}
