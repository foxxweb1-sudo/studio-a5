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
import { CheckCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const formSchema = z.object({
  studentCode: z.string().min(1, 'الرجاء إدخال كود الطالب.'),
});

export default function AttendanceRecorder() {
  const { students } = useStudents();
  const { attendance, addAttendance } = useAttendance();
  const { toast } = useToast();
  const [lastAttended, setLastAttended] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentCode: '',
    },
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const student = students.find((s) => s.id === values.studentCode);
    if (!student) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الطالب غير موجود.',
      });
      return;
    }

    const alreadyAttended = attendance.some(
      (a) => a.studentId === student.id && a.date === today
    );

    if (alreadyAttended) {
      toast({
        title: 'تم التسجيل مسبقاً',
        description: `تم تسجيل حضور الطالب ${student.name} اليوم بالفعل.`,
      });
      return;
    }

    addAttendance(student.id);
    setLastAttended(student.name);
    toast({
      title: 'تم تسجيل الحضور',
      description: `تم تسجيل حضور الطالب ${student.name} بنجاح.`,
    });
    form.reset();
  };

  const attendedToday = attendance
    .filter((a) => a.date === today)
    .map((a) => students.find((s) => s.id === a.studentId))
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>تسجيل الحضور</CardTitle>
            <CardDescription>أدخل كود الطالب أو امسح QR Code.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="studentCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كود الطالب</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل الكود هنا..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <CheckCircle className="ms-2 h-4 w-4" />
                  تسجيل
                </Button>
              </form>
            </Form>
            {lastAttended && (
               <div className="mt-4 p-3 bg-accent/20 border border-accent rounded-md text-center">
                <p className="text-sm text-accent-foreground">آخر من سجل الحضور: <span className="font-bold">{lastAttended}</span></p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>الحضور اليوم ({attendedToday.length})</CardTitle>
            <CardDescription>قائمة الطلاب الذين سجلوا حضورهم اليوم.</CardDescription>
          </CardHeader>
          <CardContent>
            {attendedToday.length > 0 ? (
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الفصل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendedToday.map((student) => (
                      student &&
                      <TableRow key={student.id}>
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
                {students.length === 0 && (
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
