
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useStudents, useAttendance, usePayments } from '@/hooks/use-app-data';
import { useUser } from '@/firebase';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, GraduationCap, Phone, ArrowLeft } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const { user } = useUser();

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
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
         <PageHeader className="border-0 pb-0">
            <PageHeaderTitle>ملف الطالب: {student.name}</PageHeaderTitle>
            <PageHeaderDescription>عرض جميع تفاصيل وسجلات الطالب.</PageHeaderDescription>
         </PageHeader>
         <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-primary/20 hover:bg-primary/5 flex-1 md:flex-none">
                <ArrowLeft className="ms-2 h-4 w-4" />
                العودة
            </Button>
         </div>
       </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="rounded-[2rem] border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">معلومات الطالب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                <User className="h-5 w-5 text-primary" />
                <span className="font-bold text-slate-800">{student.name}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-bold text-slate-600">{student.grade}</span>
              </div>
              {student.parentPhone && (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <Phone className="h-5 w-5 text-emerald-600" />
                  <span className="font-mono font-bold text-emerald-700">{student.parentPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">سجل الحضور ({studentAttendance.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {studentAttendance.length > 0 ? (
                 <div className="max-h-80 overflow-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="text-right px-6">التاريخ</TableHead>
                            <TableHead className="text-center px-6">الحالة</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {studentAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
                            <TableRow key={record.id}>
                            <TableCell className="text-right px-6 font-medium text-xs">
                                {format(new Date(record.date), 'eeee, d MMMM yyyy', { locale: ar })}
                            </TableCell>
                            <TableCell className="text-center px-6">
                                <Badge className={`rounded-lg ${record.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {record.status === 'present' ? 'حاضر' : 'غائب'}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                 </div>
              ) : (
                <p className="text-muted-foreground text-center py-12 font-bold italic">لا يوجد سجل حضور لهذا الطالب.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">سجل المدفوعات ({studentPayments.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {studentPayments.length > 0 ? (
                <div className="max-h-80 overflow-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="text-right px-6">الشهر المدفوع</TableHead>
                            <TableHead className="text-center px-6">المبلغ</TableHead>
                            <TableHead className="text-right px-6">تاريخ الدفع</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {studentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                            <TableRow key={payment.id}>
                            <TableCell className="text-right px-6 font-black text-slate-700">
                                {format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                            </TableCell>
                            <TableCell className="text-center px-6">
                                <span className="font-black text-emerald-600">{payment.amount} ج.م</span>
                            </TableCell>
                            <TableCell className="text-right px-6 text-[10px] text-muted-foreground font-bold">
                                {format(new Date(payment.date), 'd MMMM yyyy', { locale: ar })}
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12 font-bold italic">لا يوجد سجل مدفوعات لهذا الطالب.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
