
"use client";

import { useStudents, usePayments, usePaymentSettings } from '@/hooks/use-app-data';
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
import { format, parse, startOfMonth, addMonths, isBefore, isSameMonth } from 'date-fns';
import { Loader2, MessageSquare, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface OutstandingPaymentsProps {
  gradeFilter?: string;
}

// دالة لجلب الشهور المطلوبة بناءً على تاريخ بدء المحاسبة
const getRequiredMonths = (startMonthStr: string | undefined): string[] => {
  const months: string[] = [];
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  
  // إذا لم يتم تحديد شهر بدء، نفترض يناير من السنة الحالية
  let startDate = startMonthStr 
    ? parse(startMonthStr, 'yyyy-MM', new Date()) 
    : startOfMonth(new Date(today.getFullYear(), 0, 1));

  let checkDate = startDate;
  
  while (isBefore(checkDate, currentMonthStart) || isSameMonth(checkDate, currentMonthStart)) {
    months.push(format(checkDate, 'yyyy-MM'));
    checkDate = addMonths(checkDate, 1);
  }
  
  return months;
};

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
  const { settings, isLoading: settingsLoading } = usePaymentSettings();
  const { toast } = useToast();

  const students = gradeFilter
    ? allStudents.filter(s => s.grade === gradeFilter)
    : allStudents;

  const requiredMonths = getRequiredMonths(settings?.startMonth);
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

  const isLoading = studentsLoading || paymentsLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
          <CalendarClock className="h-5 w-5 text-primary" />
          <p className="text-xs font-bold text-slate-600">
             يتم حساب المتأخرات بدءاً من: 
             <span className="text-primary mr-1">
                {settings?.startMonth 
                  ? format(parse(settings.startMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar })
                  : 'يناير ' + new Date().getFullYear()}
             </span>
          </p>
      </div>

      {outstandingStudents.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-primary/10">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="text-right px-6 py-4 font-black">اسم الطالب</TableHead>
                {!gradeFilter && <TableHead className="text-right font-black">الفصل</TableHead>}
                <TableHead className="text-right font-black">الشهور المتأخرة</TableHead>
                <TableHead className="text-center font-black">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstandingStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-bold px-6 py-4">{student.name}</TableCell>
                  {!gradeFilter && <TableCell className="text-muted-foreground text-xs">{student.grade}</TableCell>}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.outstandingMonths.map((month) => (
                        <Badge key={month} variant="destructive" className="bg-rose-500 hover:bg-rose-600 rounded-lg text-[10px] h-6">
                          {format(parse(month, 'yyyy-MM', new Date()), 'MMMM', { locale: ar })}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSendReminder(student)}
                      className="rounded-xl gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 h-9"
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
        <div className="text-center py-20 bg-emerald-50/50 rounded-[2rem] border-2 border-dashed border-emerald-100">
           <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-pulse" />
           </div>
          <p className="text-emerald-700 font-black">لا توجد أي متأخرات مالية حالياً.</p>
          <p className="text-[10px] text-emerald-600/60 mt-1">كافة الطلاب قاموا بسداد الرسوم المطلوبة حتى هذا الشهر.</p>
        </div>
      )}
    </div>
  );
}
