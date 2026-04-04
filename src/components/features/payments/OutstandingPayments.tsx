"use client";

import { useStudents, usePayments } from '@/hooks/use-app-data';
import { Student, PaymentRecord } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parse } from 'date-fns';
import { Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface OutstandingPaymentsProps {
  gradeFilter?: string;
}

// دالة لجلب الشهور المطلوبة (من فبراير السنة الحالية حتى الشهر الحالي)
const getRequiredMonths = (): string[] => {
  const months: string[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  for (let m = 1; m <= currentMonth; m++) {
    const date = new Date(currentYear, m, 1);
    months.push(format(date, 'yyyy-MM'));
  }
  return months;
};

// تحديد الطلاب الذين لديهم متأخرات
const getOutstandingStudents = (
  students: Student[],
  payments: PaymentRecord[],
  months: string[]
): (Student & { outstandingMonths: string[] })[] => {
  if (!students || !payments) return [];
  return students
    .map((student) => {
      const paidMonths = payments
        .filter((p) => p.studentId === student.id)
        .map((p) => p.month);

      const outstandingMonths = months.filter(
        (month) => !paidMonths.includes(month)
      );

      return { ...student, outstandingMonths };
    })
    .filter((student) => student.outstandingMonths.length > 0);
};

export default function OutstandingPayments({ gradeFilter }: OutstandingPaymentsProps) {
  const { students: allStudents, isLoading: studentsLoading } = useStudents();
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { toast } = useToast();

  const students = gradeFilter
    ? allStudents.filter(s => s.grade === gradeFilter)
    : allStudents;

  const requiredMonths = getRequiredMonths();
  const outstandingStudents = getOutstandingStudents(
    students,
    payments,
    requiredMonths
  );

  const handleSendReminder = (student: Student & { outstandingMonths: string[] }) => {
    if (!student.parentPhone) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لا يوجد رقم هاتف مسجل لولي أمر الطالب.",
      });
      return;
    }

    const monthsNames = student.outstandingMonths
      .map(m => format(parse(m, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar }))
      .join(' ، ');

    const message = encodeURIComponent(
      `تذكير من تطبيق الحضور:\nنحيطكم علماً بأن الطالب/ة ${student.name} لديه متأخرات في الرسوم عن الشهور التالية:\n( ${monthsNames} )\nيرجى التكرم بالسداد في أقرب وقت ممكن. نشكر تفهمكم.`
    );

    const phone = student.parentPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phone.startsWith('20') ? phone : '20' + phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const isLoading = studentsLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {outstandingStudents.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-primary/10">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="text-right">اسم الطالب</TableHead>
                {!gradeFilter && <TableHead className="text-right">الفصل</TableHead>}
                <TableHead className="text-right">الشهور المتأخرة</TableHead>
                <TableHead className="text-center">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstandingStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-bold">{student.name}</TableCell>
                  {!gradeFilter && <TableCell className="text-muted-foreground">{student.grade}</TableCell>}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.outstandingMonths.map((month) => (
                        <Badge key={month} variant="destructive" className="bg-rose-500 hover:bg-rose-600 rounded-lg">
                          {format(parse(month, 'yyyy-MM', new Date()), 'MMMM', { locale: ar })}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      size="sm" 
                      onClick={() => handleSendReminder(student)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <MessageSquare className="h-4 w-4" />
                      تذكير
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
          <p className="text-emerald-600 font-bold">رائع! لا توجد متأخرات حالياً.</p>
        </div>
      )}
    </div>
  );
}
