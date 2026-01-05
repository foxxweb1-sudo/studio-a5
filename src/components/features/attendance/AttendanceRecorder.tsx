"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStudents, useAttendance } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, UserPlus, Loader2, PartyPopper, QrCode, Type } from 'lucide-react';
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


const formSchema = z.object({
  studentCode: z.string().min(1, 'الرجاء إدخال كود الطالب.'),
});

export default function AttendanceRecorder() {
  const { students, isLoading: studentsLoading } = useStudents();
  const { attendance, addAttendance, isLoading: attendanceLoading } = useAttendance();
  const { toast } = useToast();
  const [lastAttended, setLastAttended] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentCode: '',
    },
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  const recordAttendance = (studentCode: string) => {
    let student = students.find(s => s.id === studentCode);

    // Fallback for manual entry with sequential code
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
      (a) => a.studentId === student!.id && a.date === today
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
    .filter((a) => a.date === today)
    .map((a) => {
        const student = students.find((s) => s.id === a.studentId);
        return student || null;
    })
    .filter(Boolean);

  const isLoading = studentsLoading || attendanceLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scanner">
              <QrCode className="ms-2 h-4 w-4" />
              مسح الكود
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Type className="ms-2 h-4 w-4" />
              إدخال يدوي
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scanner">
             <Card>
                <CardHeader>
                  <CardTitle>تسجيل الحضور</CardTitle>
                  <CardDescription>امسح QR Code الخاص بالطالب.</CardDescription>
                </CardHeader>
                <CardContent>
                  <QRCodeScanner onScan={recordAttendance} />
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>تسجيل الحضور</CardTitle>
                <CardDescription>أدخل كود الطالب يدوياً.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="studentCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كود الطالب (الرقم التسلسلي)</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل الكود هنا..." {...field} autoFocus className="text-center text-2xl h-16"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                      {isLoading ? <Loader2 className="ms-2 h-6 w-6 animate-spin" /> : <CheckCircle className="ms-2 h-6 w-6" />}
                      تسجيل
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {lastAttended && (
           <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg text-center">
            <div className="flex justify-center items-center gap-2">
              <PartyPopper className="h-6 w-6 text-green-600 dark:text-green-400"/>
              <p className="text-green-800 dark:text-green-200">آخر من سجل: <span className="font-bold">{lastAttended}</span></p>
            </div>
           </div>
        )}
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>الحاضرون اليوم ({attendedToday.length})</CardTitle>
            <CardDescription>قائمة الطلاب الذين سجلوا حضورهم اليوم.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center items-center h-48">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
               </div>
            ) : attendedToday.length > 0 ? (
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الكود</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الفصل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendedToday.map((student) => (
                      student &&
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">{(students.findIndex(s => s.id === student.id) + 1)}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">لم يسجل أي طالب حضوره اليوم بعد.</p>
                {students.length === 0 && !isLoading && (
                  <Button asChild variant="outline">
                    <Link href="/students">
                      <UserPlus className="ms-2 h-4 w-4" />
                      إضافة طلاب
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
