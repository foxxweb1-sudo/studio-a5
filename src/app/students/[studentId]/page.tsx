
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useStudents, useAttendance, usePayments, useExams } from '@/hooks/use-app-data';
import { useUser } from '@/firebase';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, GraduationCap, Phone, ArrowLeft, Share2, Award, CheckCircle2, XCircle, Trophy, Sparkles, Construction, Wallet } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const { user } = useUser();
  const { toast } = useToast();
  const [showBetaDialog, setShowBetaDialog] = useState(false);

  const { students, isLoading: studentsLoading } = useStudents();
  const { attendance, isLoading: attendanceLoading } = useAttendance();
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { exams, isLoading: examsLoading } = useExams();

  const student = students.find((s) => s.id === studentId);
  const studentAttendance = attendance.filter((a) => a.studentId === studentId);
  const studentPayments = payments.filter((p) => p.studentId === studentId);
  const studentExams = exams.filter((e) => e.studentId === studentId);

  const handleShareLink = () => {
    setShowBetaDialog(true);
  };

  const isLoading = studentsLoading || attendanceLoading || paymentsLoading || examsLoading;

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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <PageHeader className="border-0 pb-0">
            <PageHeaderTitle className="text-3xl font-black">ملف الطالب: {student.name}</PageHeaderTitle>
            <PageHeaderDescription>عرض كافة السجلات الأكاديمية والمالية.</PageHeaderDescription>
         </PageHeader>
         <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleShareLink} className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1 md:flex-none">
                <Share2 className="h-4 w-4" />
                رابط المتابعة للأهل
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-primary/20 hover:bg-primary/5 flex-1 md:flex-none">
                <ArrowLeft className="ms-2 h-4 w-4" />
                رجوع
            </Button>
         </div>
       </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg">بطاقة الهوية</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-primary text-white rounded-xl">
                    <User className="h-5 w-5" />
                </div>
                <span className="font-black text-slate-800">{student.name}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-indigo-500 text-white rounded-xl">
                    <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-600">{student.grade}</span>
              </div>
              {student.parentPhone && (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="font-mono font-bold text-emerald-700">{student.parentPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <Trophy className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                    <h4 className="font-black text-indigo-900">تقرير الأداء</h4>
                    <p className="text-xs text-indigo-700/70 font-bold">إجمالي الامتحانات المسجلة: {studentExams.length}</p>
                </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Exams History for Teacher */}
          <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-indigo-50 border-b flex flex-row items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl">
                        <Award className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-black">سجل الامتحانات</CardTitle>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-lg">{studentExams.length} امتحان</Badge>
            </CardHeader>
            <CardContent className="p-0">
                {studentExams.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right px-6 font-black">التاريخ</TableHead>
                                <TableHead className="text-center font-black">الدرجة</TableHead>
                                <TableHead className="text-center px-6 font-black">النسبة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentExams.map(exam => {
                                const perc = Math.round((exam.score / exam.totalScore) * 100);
                                return (
                                    <TableRow key={exam.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="px-6 font-bold text-slate-600">{format(new Date(exam.date), 'd MMMM yyyy', { locale: ar })}</TableCell>
                                        <TableCell className="text-center font-black text-indigo-600">{exam.score} / {exam.totalScore}</TableCell>
                                        <TableCell className="text-center px-6">
                                            <Badge variant="outline" className={`rounded-xl ${perc >= 50 ? 'border-emerald-200 text-emerald-600' : 'border-rose-200 text-rose-600'}`}>
                                                {perc}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="py-12 text-center text-slate-300 font-bold italic">لا توجد درجات مسجلة.</div>
                )}
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">سجل الحضور</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
              {studentAttendance.length > 0 ? (
                 <div className="max-h-80 overflow-auto">
                    <Table>
                        <TableBody>
                        {studentAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
                            <TableRow key={record.id} className="hover:bg-slate-50 border-b">
                            <TableCell className="text-right px-8 py-4 font-bold text-slate-700">
                                {format(new Date(record.date), 'eeee, d MMMM yyyy', { locale: ar })}
                            </TableCell>
                            <TableCell className="text-center px-8">
                                <Badge className={`rounded-xl px-4 py-1 gap-1.5 ${record.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {record.status === 'present' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
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

          <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-amber-50 border-b p-6">
                <div className="flex items-center gap-3 text-amber-700">
                    <Wallet className="h-5 w-5" />
                    <CardTitle className="text-lg">سجل المدفوعات</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
              {studentPayments.length > 0 ? (
                <div className="max-h-80 overflow-auto">
                    <Table>
                        <TableBody>
                        {studentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                            <TableRow key={payment.id} className="hover:bg-amber-50/30 transition-colors border-b">
                            <TableCell className="text-right px-8 py-5 font-black text-slate-700">
                                {format(parse(payment.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })}
                            </TableCell>
                            <TableCell className="text-center px-8">
                                <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-2xl font-black border border-emerald-100">{payment.amount} ج.م</span>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12 font-bold italic">لا يوجد سجل مدفوعات.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showBetaDialog} onOpenChange={setShowBetaDialog}>
        <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl overflow-hidden p-0 max-w-sm">
            <div className="bg-indigo-600 h-2 w-full" />
            <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto relative">
                    <Sparkles className="h-10 w-10 text-indigo-600" />
                    <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md border">
                        <Construction className="h-4 w-4 text-amber-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <DialogTitle className="text-2xl font-black text-slate-900">نظام المتابعة (Beta)</DialogTitle>
                    <DialogDescription className="text-sm font-bold text-slate-500 leading-relaxed px-2">
                        نحن نعمل حالياً على تطوير نظام متابعة الطلاب للأهل. سيتم إطلاق الروابط التفاعلية والتقارير الذكية قريباً جداً لتزويدكم بتجربة أفضل.
                    </DialogDescription>
                </div>
                <Button onClick={() => setShowBetaDialog(false)} className="w-full h-12 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                    فهمت ذلك
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
