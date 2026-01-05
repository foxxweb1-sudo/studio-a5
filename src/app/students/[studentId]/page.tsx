"use client";

import { useParams } from 'next/navigation';
import { useStudents, useAttendance, usePayments } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, GraduationCap, Phone, Calendar, BadgeDollarSign, ArrowLeft } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const { students, isLoading: studentsLoading } = useStudents();
  const { attendance, isLoading: attendanceLoading } = useAttendance();
  const { payments, isLoading: paymentsLoading } = usePayments();

  const student = students.find((s) => s.id === studentId);
  const studentAttendance = attendance.filter((a) => a.studentId === studentId);
  const studentPayments = payments.filter((p) => p.studentId === studentId);

  const isLoading = studentsLoading || attendanceLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center">
        <PageHeader>
          <PageHeaderTitle>الطالب غير موجود</PageHeaderTitle>
          <PageHeaderDescription>لم يتم العثور على الطالب المطلوب.</PageHeaderDescription>
        </PageHeader>
         <Button variant="outline" asChild className="mt-4">
          <Link href="/students">
             <ArrowLeft className="ms-2 h-4 w-4" />
            العودة للطلاب
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
       <div className="flex justify-between items-start mb-8">
         <PageHeader>
            <PageHeaderTitle>ملف الطالب: {student.name}</PageHeaderTitle>
            <PageHeaderDescription>عرض جميع تفاصيل وسجلات الطالب.</PageHeaderDescription>
         </PageHeader>
         <Button variant="outline" asChild>
            <Link href={`/students?grade=${encodeURIComponent(student.grade)}`}>
                <ArrowLeft className="ms-2 h-4 w-4" />
                العودة لقائمة الطلاب
            </Link>
        </Button>
       </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الطالب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{student.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <span>{student.grade}</span>
              </div>
              {student.parentPhone && (
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{student.parentPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحضور ({studentAttendance.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {studentAttendance.length > 0 ? (
                 <div className="max-h-60 overflow-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>الحالة</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {studentAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
                            <TableRow key={record.id}>
                            <TableCell>{format(new Date(record.date), 'eeee, d MMMM yyyy', { locale: ar })}</TableCell>
                            <TableCell>
                                <Badge variant="default" className="bg-green-500">حاضر</Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                 </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">لا يوجد سجل حضور لهذا الطالب.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سجل المدفوعات ({studentPayments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {studentPayments.length > 0 ? (
                <div className="max-h-60 overflow-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>الشهر المدفوع</TableHead>
                            <TableHead>المبلغ</TableHead>
                            <TableHead>تاريخ الدفع</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {studentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                            <TableRow key={payment.id}>
                            <TableCell>{format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}</TableCell>
                            <TableCell className="font-medium">{payment.amount} جنيه</TableCell>
                            <TableCell>{format(new Date(payment.date), 'd MMMM yyyy', { locale: ar })}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">لا يوجد سجل مدفوعات لهذا الطالب.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
