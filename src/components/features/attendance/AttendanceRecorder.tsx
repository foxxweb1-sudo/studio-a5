
"use client";

import { useState, useMemo } from 'react';
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
import { CheckCircle, UserPlus, Loader2, PartyPopper, QrCode, Type, Settings2, ShieldAlert, BadgeCheck } from 'lucide-react';
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
import ScheduleSettings from './ScheduleSettings';
import { Badge } from '@/components/ui/badge';


const formSchema = z.object({
  studentCode: z.string().min(1, 'الرجاء إدخال كود الطالب.'),
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
  const { attendance, addAttendance, isLoading: attendanceLoading } = useAttendance();
  const { schedule, isLoading: scheduleLoading } = useSchedule();
  const { toast } = useToast();
  const [lastAttended, setLastAttended] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentCode: '',
    },
  });

  const todayDate = new Date();
  const todayStr = format(todayDate, 'yyyy-MM-dd');
  const currentDayName = format(todayDate, 'EEEE'); // e.g. Saturday
  const currentTimeStr = format(todayDate, 'HH:mm');

  const isWithinSchedule = useMemo(() => {
    if (!schedule || !schedule.isActive) return true;
    
    const isWorkingDay = schedule.workingDays?.includes(currentDayName);
    if (!isWorkingDay) return false;

    return currentTimeStr >= schedule.startTime && currentTimeStr <= schedule.endTime;
  }, [schedule, currentDayName, currentTimeStr]);

  const recordAttendance = (studentCode: string) => {
    if (schedule?.isActive && !isWithinSchedule) {
        toast({
            variant: "destructive",
            title: "خارج وقت العمل",
            description: "لا يمكنك تسجيل الحضور حالياً بناءً على إعدادات جدولك."
        });
        return;
    }

    let student = students.find(s => s.id === studentCode);

    if (!student) {
      const sequentialId = parseInt(studentCode, 10);
      if (!isNaN(sequentialId) && sequentialId > 0 && sequentialId <= students.length) {
        student = students[sequentialId - 1];
      }
    }
    
    if (!student) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الطالب غير موجود.',
      });
      return;
    }

    const alreadyAttended = attendance.some(
      (a) => a.studentId === student!.id && a.date === todayStr
    );

    if (alreadyAttended) {
      toast({
        title: 'تم التسجيل مسبقاً',
        description: `تم تسجيل حضور الطالب ${student!.name} اليوم بالفعل.`,
      });
      return;
    }

    addAttendance(student!.id);
    setLastAttended(student!.name);
    toast({
      title: 'تم تسجيل الحضور',
      description: `تم تسجيل حضور الطالب ${student!.name} بنجاح.`,
    });
    form.reset();
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    recordAttendance(values.studentCode);
  };
  
  const attendedToday = attendance
    .filter((a) => a.date === todayStr)
    .map((a) => {
        const student = students.find((s) => s.id === a.studentId);
        return student || null;
    })
    .filter(Boolean);

  const isLoading = studentsLoading || attendanceLoading || scheduleLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* عرض شريط حالة العمل */}
      {schedule?.isActive && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${isWithinSchedule ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
             <div className="flex items-center gap-3">
                {isWithinSchedule ? (
                    <div className="p-2 bg-emerald-500 rounded-xl text-white">
                        <BadgeCheck className="h-5 w-5" />
                    </div>
                ) : (
                    <div className="p-2 bg-rose-500 rounded-xl text-white">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                )}
                <div>
                    <h5 className={`font-black text-sm ${isWithinSchedule ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isWithinSchedule ? 'أنت الآن في وقت العمل الرسمي' : 'أنت الآن خارج وقت العمل الرسمي'}
                    </h5>
                    <p className="text-[10px] opacity-70 font-bold">
                        اليوم: {DAY_MAP[currentDayName]} | الفترة: {schedule.startTime} - {schedule.endTime}
                    </p>
                </div>
             </div>
             <Badge variant={isWithinSchedule ? "default" : "destructive"} className="rounded-lg">
                {isWithinSchedule ? 'متاح للتسجيل' : 'التسجيل مغلق'}
             </Badge>
          </div>
      )}

      <Tabs defaultValue="recorder" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl mb-6 w-full flex justify-start h-auto gap-2">
            <TabsTrigger value="recorder" className="rounded-xl px-8 py-2.5 font-bold flex-1 sm:flex-initial">
                <QrCode className="ms-2 h-4 w-4" />
                لوحة التسجيل
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-8 py-2.5 font-bold flex-1 sm:flex-initial">
                <Settings2 className="ms-2 h-4 w-4" />
                إعدادات المواعيد
            </TabsTrigger>
        </TabsList>

        <TabsContent value="recorder">
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
                            <CardTitle className="text-xl">الحاضرون اليوم</CardTitle>
                            <CardDescription>قائمة الطلاب المسجلين بتاريخ {todayStr}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="h-10 px-4 rounded-xl font-black text-lg">
                            {attendedToday.length} طالب
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                    </div>
                    ) : attendedToday.length > 0 ? (
                    <div className="max-h-[500px] overflow-auto">
                        <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                            <TableHead className="text-right font-black px-6">كود</TableHead>
                            <TableHead className="text-right font-black">الاسم</TableHead>
                            <TableHead className="text-right font-black">الصف</TableHead>
                            <TableHead className="text-center font-black">الحالة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendedToday.map((student, idx) => (
                            student &&
                            <TableRow key={student.id} className="group transition-colors">
                                <TableCell className="font-mono font-bold text-slate-400 px-6">{(students.findIndex(s => s.id === student.id) + 1)}</TableCell>
                                <TableCell className="font-black text-slate-700 dark:text-slate-200">{student.name}</TableCell>
                                <TableCell className="text-slate-500 font-medium text-xs">{student.grade}</TableCell>
                                <TableCell className="text-center">
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-lg">حاضر</Badge>
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
                        {students.length === 0 && !isLoading && (
                        <Button asChild variant="outline" className="rounded-xl border-dashed">
                            <Link href="/students">
                            <UserPlus className="ms-2 h-4 w-4" />
                            إضافة الطلاب أولاً
                            </Link>
                        </Button>
                        )}
                    </div>
                    )}
                </CardContent>
                </Card>
            </div>
            </div>
        </TabsContent>

        <TabsContent value="settings">
            <ScheduleSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
