
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useStudents, useAttendance, usePayments } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, GraduationCap, Phone, BadgeDollarSign, ArrowLeft } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
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
      <div className="text-center py-20">
        <PageHeader>
          <PageHeaderTitle>الطالب غير موجود</PageHeaderTitle>
          <PageHeaderDescription>لم يتم العثور على الطالب المطلوب.</PageHeaderDescription>
        </PageHeader>
         <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="ms-2 h-4 w-4" />
          العودة
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
         <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-primary/20 hover:bg-primary/5">
            <ArrowLeft className="ms-2 h-4 w-4" />
            العودة
        </Button>
       </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الطالب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                <User className="h-5 w-5 text-primary" />
                <span className="font-bold">{student.name}</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>{student.grade}</span>
              </div>
              {student.parentPhone && (
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                  <Phone className="h-5 w-5 text-primary" />
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
                 <div className="max-h-60 overflow-auto rounded-xl border">
                    <Table>
                        <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {studentAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
                            <TableRow key={record.id}>
                            <TableCell className="text-right">{format(new Date(record.date), 'eeee, d MMMM yyyy', { locale: ar })}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant="default" className="bg-emerald-500">حاضر</Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                 </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">لا يوجد سجل حضور لهذا الطالب.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سجل المدفوعات ({studentPayments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {studentPayments.length > 0 ? (
                <div className="max-h-60 overflow-auto rounded-xl border">
                    <Table>
                        <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead className="text-right">الشهر المدفوع</TableHead>
                            <TableHead className="text-right">المبلغ</TableHead>
                            <TableHead className="text-right">تاريخ الدفع</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {studentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                            <TableRow key={payment.id}>
                            <TableCell className="text-right font-bold">{format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}</TableCell>
                            <TableCell className="text-right font-bold text-emerald-600">{payment.amount} جنيه</TableCell>
                            <TableCell className="text-right text-muted-foreground">{format(new Date(payment.date), 'd MMMM yyyy', { locale: ar })}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">لا يوجد سجل مدفوعات لهذا الطالب.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
