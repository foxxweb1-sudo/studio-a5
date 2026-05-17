
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
import { Loader2, MessageSquare, CalendarClock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface OutstandingPaymentsProps {
  gradeFilter?: string;
}

const getRequiredMonths = (startMonthStr: string | undefined, endMonthStr: string | undefined): string[] => {
  if (!startMonthStr) return [];
  
  const months: string[] = [];
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  
  let startDate = parse(startMonthStr, 'yyyy-MM', new Date());
  let limitDate = currentMonthStart;
  
  if (endMonthStr) {
    const definedEndDate = parse(endMonthStr, 'yyyy-MM', new Date());
    if (isBefore(definedEndDate, currentMonthStart)) {
      limitDate = definedEndDate;
    }
  }

  let checkDate = startDate;
  while (isBefore(checkDate, limitDate) || isSameMonth(checkDate, limitDate)) {
    months.push(format(checkDate, 'yyyy-MM'));
    checkDate = addMonths(checkDate, 1);
  }
  
  return months;
};

const getOutstandingStudents = (
  students: Student[],
  payments: PaymentRecord[],
  gradeConfigs: Record<string, any> | undefined
): (Student & { outstandingMonths: string[] })[] => {
  if (!students || !payments) return [];

  return students
    .map((student) => {
      // جلب إعدادات الفترة الخاصة بصف هذا الطالب تحديداً
      const gradeConfig = gradeConfigs?.[student.grade];
      if (!gradeConfig) return { ...student, outstandingMonths: [] };

      const requiredMonths = getRequiredMonths(gradeConfig.startMonth, gradeConfig.endMonth);
      const paidMonths = payments
        .filter((p) => p.studentId === student.id)
        .map((p) => p.month);

      const outstandingMonths = requiredMonths.filter(
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

  const outstandingStudents = getOutstandingStudents(
    students,
    payments,
    settings?.grades
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
      `تذكير مالي من الأستاذ لولي أمر الطالب/ة ${student.name}:\nنحيطكم علماً بوجود مستحقات لم تسدد عن الشهور التالية:\n( ${monthsNames} )\nيرجى التكرم بالسداد في أقرب وقت. نشكر تعاونكم.`
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
                        <Badge key={month} variant="destructive" className="bg-rose-500 hover:bg-rose-600 rounded-lg text-[10px] h-6 border-0">
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
          <p className="text-[10px] text-emerald-600/60 mt-1">كافة الطلاب في هذا الصف قاموا بالسداد وفق الفترة المحددة لهم في الإعدادات.</p>
        </div>
      )}

      <div className="p-4 bg-slate-50 rounded-2xl flex items-start gap-3 border border-dashed">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-500 leading-relaxed font-bold">
            ملاحظة: يتم حساب المتأخرات بناءً على "الفترة المحاسبية" المحددة لكل صف في الصفحة الرئيسية. إذا لم يظهر طالب، تأكد من ضبط فترة صفه.
          </p>
      </div>
    </div>
  );
}
