
'use client';

import { useParams } from 'next/navigation';
import { useDatabase } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, 
  User, 
  GraduationCap, 
  CalendarCheck, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Activity, 
  Info,
  Calendar,
  Award,
  Clock,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useAppConfig } from '@/hooks/use-app-config';
import { useState, useEffect, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BannerAd, NativeArticleAd } from '@/components/layout/AdSections';

export default function ParentPortalPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const studentId = params.studentId as string;
  const database = useDatabase();
  const { config } = useAppConfig();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database || !teacherId || !studentId) return;

    const portalRef = ref(database, `portal/${teacherId}/${studentId}`);
    const unsubscribe = onValue(portalRef, (snapshot) => {
      setData(snapshot.val());
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [database, teacherId, studentId]);

  const stats = useMemo(() => {
    if (!data?.attendance || data.attendance.length === 0) return { rate: 0, present: 0, absent: 0, status: 'لا توجد بيانات' };
    const presentCount = data.attendance.filter((a: any) => a.status === 'present').length;
    const totalCount = data.attendance.length;
    const rate = Math.round((presentCount / totalCount) * 100);
    
    let status = 'ممتاز';
    if (rate < 80) status = 'جيد جداً';
    if (rate < 60) status = 'مقبول';
    if (rate < 50) status = 'يحتاج متابعة';

    return { rate, present: presentCount, absent: totalCount - presentCount, status };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6 bg-slate-50">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="font-black text-slate-400 animate-pulse text-lg">جاري جلب تقرير الطالب...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-slate-50">
        <div className="p-10 bg-white rounded-[3rem] shadow-2xl border-2 border-dashed border-rose-100 max-w-sm">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Info className="h-10 w-10 text-rose-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">التقرير غير جاهز</h1>
            <p className="text-slate-400 mt-3 font-bold leading-relaxed">يرجى الطلب من المعلم تحديث سجل الطالب لتفعيل هذا الرابط.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 px-4 sm:px-6 font-body" dir="rtl">
      <div className="max-w-5xl mx-auto pt-8 space-y-8">
        
        {/* Header Section with Teacher Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-50">
                    <Image src={config.appLogo || ''} alt="Logo" fill className="object-contain p-2" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-900 leading-none mb-1">تقرير الحضور الذكي</h1>
                    <p className="text-xs text-muted-foreground font-bold">بوابة المتابعة المباشرة للأهل</p>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-center sm:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المعلم المسؤول</p>
                    <h4 className="text-base font-black text-primary">{data.info.teacherName}</h4>
                </div>
                {data.info.teacherPhone && (
                    <Button asChild variant="outline" className="rounded-2xl h-12 gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 font-bold">
                        <a href={`https://wa.me/${data.info.teacherPhone.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4" />
                            تواصل واتساب
                        </a>
                    </Button>
                )}
            </div>
        </div>

        {/* إعلان بانر أول */}
        <BannerAd />

        {/* قسم المتأخرات المالية - يظهر فقط إذا وجدت */}
        {data.outstandingMonths && data.outstandingMonths.length > 0 && (
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-rose-50 border-r-8 border-rose-500 overflow-hidden animate-in slide-in-from-top-4 duration-500">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 text-center md:text-right">
                        <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-rose-900">تنبيه بالمتأخرات المالية</h3>
                            <p className="text-sm font-bold text-rose-700/70 mt-1">يرجى العلم بوجود مستحقات لم يتم تسديدها عن الشهور التالية:</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-end max-w-sm">
                        {data.outstandingMonths.map((m: string) => (
                            <Badge key={m} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2 text-xs font-black border-0">
                                {format(parse(m, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <CardContent className="p-8 flex flex-col items-center text-center justify-center h-full relative z-10">
                    <div className="p-4 bg-white/20 rounded-2xl mb-4 backdrop-blur-md">
                        <User className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black mb-1 drop-shadow-sm">{data.info.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {data.info.grade}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Activity className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="rounded-full px-3 py-0.5 border-blue-100 text-blue-600 font-black text-[10px]">
                            المستوى: {stats.status}
                        </Badge>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <h4 className="text-4xl font-black text-slate-800">{stats.rate}%</h4>
                            <p className="text-[10px] font-bold text-slate-400">معدل الحضور</p>
                        </div>
                        <Progress value={stats.rate} className="h-3 bg-slate-100" />
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-slate-50 flex-1 p-3 rounded-2xl text-center">
                            <span className="block text-[10px] font-bold text-slate-400">حضور</span>
                            <span className="text-lg font-black text-emerald-600">{stats.present}</span>
                        </div>
                        <div className="bg-slate-50 flex-1 p-3 rounded-2xl text-center">
                            <span className="block text-[10px] font-bold text-slate-400">غياب</span>
                            <span className="text-lg font-black text-rose-500">{stats.absent}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-8 space-y-6">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-800">
                            {data.payments?.[0] ? `${data.payments[0].amount} ج.م` : 'لا توجد دفعات'}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">آخر دفعة مستلمة</p>
                    </div>
                    {data.payments?.[0] && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-black text-amber-700">
                                {format(parse(data.payments[0].month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* إعلان Native في منتصف التقرير */}
        <NativeArticleAd />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl rounded-[3rem] bg-white overflow-hidden flex flex-col lg:col-span-2">
                <CardHeader className="p-8 border-b bg-indigo-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-black text-slate-800">نتائج الإمتحانات</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        {data.exams && data.exams.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-right px-8 py-5 font-black text-slate-400">التاريخ</TableHead>
                                        <TableHead className="text-center py-5 font-black text-slate-400">الدرجة</TableHead>
                                        <TableHead className="text-center py-5 font-black text-slate-400">النسبة</TableHead>
                                        <TableHead className="text-center px-8 py-5 font-black text-slate-400">الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.exams.map((exam: any) => {
                                        const percentage = Math.round((exam.score / exam.totalScore) * 100);
                                        return (
                                            <TableRow key={exam.id} className="hover:bg-slate-50/50 transition-colors border-b">
                                                <TableCell className="px-8 py-5">
                                                    <div className="flex items-center gap-2 font-bold text-slate-600">
                                                        <Calendar className="h-4 w-4 opacity-30" />
                                                        {format(new Date(exam.date), 'd MMMM yyyy', { locale: ar })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full font-black text-indigo-700">
                                                        {exam.score} <span className="opacity-30 text-[10px]">/ {exam.totalScore}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-black text-slate-800">{percentage}%</TableCell>
                                                <TableCell className="text-center px-8">
                                                    <Badge variant="outline" className={`rounded-xl px-4 py-1 font-black ${
                                                        percentage >= 85 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        percentage >= 65 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                        {percentage >= 50 ? 'ناجح' : 'يحتاج اجتهاد'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-20 text-center text-slate-300 space-y-4">
                                <Award className="h-12 w-12 mx-auto opacity-20" />
                                <p className="font-black italic">لا توجد نتائج امتحانات مسجلة بعد.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-[3rem] bg-white overflow-hidden flex flex-col">
                <CardHeader className="p-8 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg">
                            <CalendarCheck className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-black">سجل الحضور</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[350px] overflow-auto">
                        {data.attendance && data.attendance.length > 0 ? (
                            <Table>
                                <TableBody>
                                    {data.attendance.map((record: any) => (
                                        <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors border-b">
                                            <TableCell className="px-8 py-5">
                                                <span className="font-bold text-slate-700">
                                                    {format(new Date(record.date), 'eeee, d MMMM', { locale: ar })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center px-8">
                                                {record.status === 'present' ? (
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white rounded-xl px-4 py-1 border-0">
                                                        <CheckCircle2 className="h-3 w-3 ms-1" /> حاضر
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-rose-500 hover:bg-rose-500 text-white rounded-xl px-4 py-1 border-0">
                                                        <XCircle className="h-3 w-3 ms-1" /> غائب
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-20 text-center text-slate-300">
                                <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="font-black italic">لا توجد سجلات حضور.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-[3rem] bg-white overflow-hidden flex flex-col">
                <CardHeader className="p-8 border-b">
                    <div className="flex items-center gap-3 text-amber-600">
                        <Wallet className="h-5 w-5" />
                        <CardTitle className="text-xl font-black">المدفوعات</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[350px] overflow-auto">
                        {data.payments && data.payments.length > 0 ? (
                            <Table>
                                <TableBody>
                                    {data.payments.map((payment: any) => (
                                        <TableRow key={payment.id} className="hover:bg-amber-50/30 transition-colors border-b">
                                            <TableCell className="px-8 py-6 font-black text-slate-800">
                                                {format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                                            </TableCell>
                                            <TableCell className="text-center px-8">
                                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl font-black border border-emerald-100 inline-block">
                                                    {payment.amount} ج.م
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-20 text-center text-slate-300">
                                <p className="font-black italic">لا توجد مدفوعات مسجلة.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* إعلان بانر نهائي */}
        <BannerAd />

        <div className="text-center pt-16 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مصدر البيانات</span>
                <span className="text-sm font-black text-primary tracking-tighter">{config.appName}</span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium opacity-60">تم التحديث: {data.lastUpdate ? new Date(data.lastUpdate).toLocaleString('ar-EG') : '...'}</p>
        </div>
      </div>
    </div>
  );
}
