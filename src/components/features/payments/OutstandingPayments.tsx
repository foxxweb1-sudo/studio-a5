'use client';

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
import { subMonths, format } from 'date-fns';
import { Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ar } from 'date-fns/locale';

interface OutstandingPaymentsProps {
  gradeFilter?: string;
}

// Function to get the last N months
const getLastNMonths = (n: number): string[] => {
  const months: string[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    months.push(format(subMonths(today, i), 'yyyy-MM'));
  }
  return months;
};

// Determine which students have outstanding payments
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

  const students = gradeFilter
    ? allStudents.filter(s => s.grade === gradeFilter)
    : allStudents;

  const requiredMonths = getLastNMonths(3); // Check last 3 months for payment
  const outstandingStudents = getOutstandingStudents(
    students,
    payments,
    requiredMonths
  );

  const isLoading = studentsLoading || paymentsLoading;
  
  const handleSendReminder = () => {
    const currentMonthLabel = format(new Date(), "MMMM yyyy", { locale: ar });
    outstandingStudents.forEach(student => {
      if (student.parentPhone) {
        const message = encodeURIComponent(`تذكير: لم يتم استلام رسوم شهر ${currentMonthLabel} للطالب/ة ${student.name}. يرجى السداد في أقرب وقت ممكن. نشكر تفهمكم.`);
        // Basic phone number validation - should be improved for production
        const phone = student.parentPhone.replace(/\D/g, '');
        // Assuming EGY country code if not present
        const whatsappUrl = `https://wa.me/${phone.startsWith('20') ? phone : '20' + phone}?text=${message}`;
        window.open(whatsappUrl, '_blank');
      }
    });
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
       {outstandingStudents.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSendReminder}>
            <MessageCircle className="ms-2 h-4 w-4" />
            إرسال تذكير عبر واتساب للجميع
          </Button>
        </div>
      )}
      {outstandingStudents.length > 0 ? (
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الطالب</TableHead>
                { !gradeFilter && <TableHead>الفصل</TableHead> }
                <TableHead>هاتف ولي الأمر</TableHead>
                <TableHead>الشهور المستحقة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstandingStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  { !gradeFilter && <TableCell>{student.grade}</TableCell> }
                   <TableCell>{student.parentPhone || 'غير مسجل'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.outstandingMonths.map((month) => (
                        <Badge key={month} variant="destructive">
                           {format(new Date(month), 'MMMM yyyy', { locale: ar })}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center text-muted-foreground p-8">
          <p>لا يوجد طلاب لديهم مدفوعات مستحقة حالياً.</p>
        </div>
      )}
    </div>
  );
}
