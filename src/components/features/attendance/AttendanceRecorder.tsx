
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStudents, useAttendance, useSchedule } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CheckCircle, UserPlus, Loader2, PartyPopper, QrCode, BadgeCheck, Clock, UserX, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeScanner from './QRCodeScanner';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  studentCode: z.string().min(1, 'الرجاء إدخل كود الطالب.'),
});

const DAY_MAP: Record<string, string> = {
    'Saturday': 'السبت',
    'Sunday': 'الأحد',
    'Monday': 'الأثنين',
    'Tuesday': 'الثلاثاء',
    'Wednesday': 'الأربعاء',
    'Thursday': 'الخميس',
    'Friday': 'الجمعة',
};

export default function AttendanceRecorder() {
  const { students, isLoading: studentsLoading } = useStudents();
  const { attendance, addAttendance, markAbsentees, isLoading: attendanceLoading } = useAttendance();
  const { schedule, isLoading: scheduleLoading } = useSchedule();
  const { toast } = useToast();
  const [lastAttended, setLastAttended] = useState<string | null>(null);
  const [isMarkingAbsence, setIsMarkingAbsence] = useState(false);
  const [liveTime, setLiveTime] = useState<Date | null>(null);

  useEffect(() => {
    setLiveTime(new Date());
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentCode: '',
    },
  });

  const todayDate = new Date();
  const todayStr = format(todayDate, 'yyyy-MM-dd');
  const currentDayName = format(todayDate, 'EEEE');
  // المقارنة تتم بصيغة 24 ساعة لضمان الصحة برمجياً
  const currentTimeStr = liveTime ? format(liveTime, 'HH:mm') : format(todayDate, 'HH:mm');

  // الحصص النشطة الآن
  const activeSessionsNow = useMemo(() => {
    if (!schedule?.isActive || !schedule.sessions) return [];
    return schedule.sessions.filter(s => 
      s.days.includes(currentDayName) && 
      currentTimeStr >= s.startTime && 
      currentTimeStr <= s.endTime
    );
  }, [schedule, currentDayName, currentTimeStr]);

  // الحصص التي انتهت اليوم (لتسجيل الغياب)
  const finishedSessionsToday = useMemo(() => {
    if (!schedule?.isActive || !schedule.sessions) return [];
    return schedule.sessions.filter(s => 
      s.days.includes(currentDayName) && 
      currentTimeStr > s.endTime
    );
  }, [schedule, currentDayName, currentTimeStr]);

  const recordAttendance = (studentCode: string) => {
    let student = students.find(s => s.id === studentCode);

    if (!student) {
      const sequentialId = parseInt(studentCode, 10);
      if (!isNaN(sequentialId) && sequentialId > 0 && sequentialId <= students.length) {
        student = students[sequentialId - 1];
      }
    }
    
    if (!student) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الطالب غير موجود.' });
      return;
    }

    if (schedule?.isActive && schedule.sessions) {
        const hasSessionNow = schedule.sessions.some(s => 
            s.grade === student!.grade && 
            s.days.includes(currentDayName) && 
            currentTimeStr >= s.startTime && 
            currentTimeStr <= s.endTime
        );

        if (!hasSessionNow) {
            toast({
                variant: "destructive",
                title: "خارج وقت الحصة",
                description: `لا توجد حصة مسجلة لـ (${student.grade}) في هذا الوقت.`
            });
            return;
        }
    }

    const alreadyRecorded = attendance.some(
      (a) => a.studentId === student!.id && a.date === todayStr
    );

    if (alreadyRecorded) {
      toast({ title: 'مسجل مسبقاً', description: `تم تسجيل الطالب ${student!.name} اليوم بالفعل.` });
      return;
    }

    addAttendance(student!.id);
    setLastAttended(student!.name);
    toast({ title: 'تم التسجيل', description: `تم تسجيل حضور الطالب ${student!.name} بنجاح.` });
    form.reset();
  }

  const handleMarkAbsentees = async (grade: string) => {
    setIsMarkingAbsence(true);
    try {
        await markAbsentees(grade, students);
        toast({ title: "تم تسجيل الغياب", description: `تم رصد الغائبين لصف (${grade}) بنجاح.` });
    } catch (e) {
        toast({ variant: "destructive", title: "فشل رصد الغياب" });
    } finally {
        setIsMarkingAbsence(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => recordAttendance(values.studentCode);
  
  const recordsToday = attendance.filter((a) => a.date === todayStr);
  const attendedToday = recordsToday
    .filter(a => a.status === 'present')
    .map((a) => students.find((s) => s.id === a.studentId))
    .filter(Boolean);

  const absentToday = recordsToday
    .filter(a => a.status === 'absent')
    .map((a) => students.find((s) => s.id === a.studentId))
    .filter(Boolean);

  const isLoading = studentsLoading || attendanceLoading || scheduleLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* شريط المواعيد والحالة مع الساعة الحية */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className={`lg:col-span-3 p-5 rounded-[2rem] border-2 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg ${activeSessionsNow.length > 0 ? 'bg-emerald-50 border-emerald-100 shadow-emerald-500/5' : 'bg-slate-50 border-slate-200 shadow-slate-500/5'}`}>
            <div className="flex items-center gap-4 w-full md:w-auto text-center md:text-right">
                {activeSessionsNow.length > 0 ? (
                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                        <BadgeCheck className="h-6 w-6" />
                    </div>
                ) : (
                    <div className="p-3 bg-slate-400 rounded-2xl text-white">
                        <Clock className="h-6 w-6" />
                    </div>
                )}
                <div>
                    <h5 className={`font-black text-lg ${activeSessionsNow.length > 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {activeSessionsNow.length > 0 ? 'وقت الحصص الجارية الآن' : 'لا توجد حصص جارية حالياً'}
                    </h5>
                    <div className="flex flex-wrap gap-2 mt-1 justify-center md:justify-start">
                        {activeSessionsNow.length > 0 ? activeSessionsNow.map(s => (
                            <Badge key={s.id} variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold">
                                {s.grade} ({s.startTime}-{s.endTime})
                            </Badge>
                        )) : (
                            <span className="text-xs font-bold text-slate-400 italic">بإمكانك إضافة حصص من صفحة "مواعيد العمل"</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{DAY_MAP[currentDayName]}</span>
                    <span className="text-xs font-bold text-slate-600">{liveTime ? format(liveTime, 'd MMMM', { locale: ar }) : ''}</span>
                </div>
                <Badge variant={activeSessionsNow.length > 0 ? "default" : "secondary"} className="rounded-xl px-4 py-1.5 font-black h-10">
                    {activeSessionsNow.length > 0 ? 'الاستقبال متاح' : 'الاستقبال مغلق'}
                </Badge>
            </div>
          </div>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center p-4 text-center border-b-4 border-b-primary overflow-hidden">
             <div className="text-xl font-black tracking-tighter text-primary tabular-nums">
                {liveTime ? format(liveTime, 'hh:mm:ss a', { locale: ar }) : '--:--:--'}
             </div>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">توقيت التسجيل</p>
          </Card>
      </div>

      {/* قسم الحصص المنتهية لتسجيل الغياب */}
      {schedule?.isActive && finishedSessionsToday.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-100 p-5 rounded-[2rem] shadow-sm animate-in zoom-in-95 duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 text-white rounded-xl">
                          <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                          <h4 className="font-black text-amber-900 text-sm">حصص انتهى وقتها</h4>
                          <p className="text-[10px] text-amber-700 font-bold">يمكنك الآن تسجيل "غائب" لمن لم يحضر.</p>
                      </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                      {finishedSessionsToday.map(s => (
                          <Button 
                            key={s.id} 
                            size="sm" 
                            variant="outline" 
                            className="rounded-xl border-amber-200 bg-white text-amber-700 font-bold gap-2 hover:bg-amber-100"
                            onClick={() => handleMarkAbsentees(s.grade)}
                            disabled={isMarkingAbsence}
                          >
                              {isMarkingAbsence ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3 w-3" />}
                              غياب {s.grade}
                          </Button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="scanner" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1">
                    <TabsTrigger value="scanner" className="rounded-lg font-bold">مسح الكود</TabsTrigger>
                    <TabsTrigger value="manual" className="rounded-lg font-bold">إدخال يدوي</TabsTrigger>
                </TabsList>
                <TabsContent value="scanner">
                    <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg">تسجيل بالـ QR</CardTitle>
                            <CardDescription>وجه الكاميرا نحو كود الطالب.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <QRCodeScanner onScan={recordAttendance} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="manual">
                    <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg">إدخال يدوي</CardTitle>
                        <CardDescription>أدخل الكود أو الرقم التسلسلي.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="studentCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-bold">كود الطالب</FormLabel>
                                <FormControl>
                                    <Input placeholder="000" {...field} autoFocus className="text-center text-3xl font-black h-20 rounded-2xl bg-slate-50"/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black gap-2" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle className="h-6 w-6" />}
                            تسجيل الحضور
                            </Button>
                        </form>
                        </Form>
                    </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {lastAttended && (
            <div className="p-5 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-500/20 flex items-center gap-4 animate-bounce">
                <div className="p-3 bg-white/20 rounded-2xl">
                    <PartyPopper className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">آخر تسجيل ناجح</p>
                    <h4 className="font-black text-xl">{lastAttended}</h4>
                </div>
            </div>
            )}
        </div>

        <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">سجل اليوم</CardTitle>
                            <CardDescription>قائمة الطلاب المسجلين بتاريخ {todayStr}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="default" className="bg-emerald-500 h-10 px-4 rounded-xl font-black text-xs sm:text-sm">
                                {attendedToday.length} حضور
                            </Badge>
                            <Badge variant="destructive" className="bg-rose-500 h-10 px-4 rounded-xl font-black text-xs sm:text-sm">
                                {absentToday.length} غياب
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                    </div>
                    ) : (attendedToday.length > 0 || absentToday.length > 0) ? (
                    <div className="max-h-[500px] overflow-auto">
                        <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                            <TableHead className="text-right font-black px-6">الاسم</TableHead>
                            <TableHead className="text-right font-black">الصف</TableHead>
                            <TableHead className="text-center font-black">الحالة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...attendedToday, ...absentToday].map((student, idx) => (
                            student &&
                            <TableRow key={student.id} className="group transition-colors">
                                <TableCell className="font-black text-slate-700 dark:text-slate-200 px-6">{student.name}</TableCell>
                                <TableCell className="text-slate-500 font-medium text-xs">{student.grade}</TableCell>
                                <TableCell className="text-center">
                                    {attendance.find(a => a.studentId === student.id && a.date === todayStr)?.status === 'present' ? (
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-lg">حاضر</Badge>
                                    ) : (
                                        <Badge className="bg-rose-500 hover:bg-rose-600 rounded-lg">غائب</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                    ) : (
                    <div className="text-center py-24 px-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                            <QrCode className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-400 mb-2">لا توجد سجلات بعد</h3>
                        <p className="text-xs text-slate-400 mb-6">ابدأ بمسح كود الطالب لتسجيل الحضور</p>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
