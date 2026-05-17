
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStudents, usePayments } from "@/hooks/use-app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const currentYear = new Date().getFullYear();
const formSchema = z.object({
  studentId: z.string().min(1, "الرجاء اختيار طالب."),
  amount: z.coerce.number().min(1, "الرجاء إدخال المبلغ."),
  year: z.string().min(1, "الرجاء اختيار السنة."),
  month: z.string().min(1, "الرجاء اختيار الشهر."),
});

const availableYears = Array.from({ length: 6 }, (_, i) => (2025 + i).toString());

const availableMonths = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, '0'),
  label: format(new Date(2000, i), "MMMM", { locale: ar }),
}));

interface PaymentTrackerProps {
  gradeFilter?: string;
}

export default function PaymentTracker({ gradeFilter }: PaymentTrackerProps) {
  const { students: allStudents, isLoading: studentsLoading } = useStudents();
  const { payments, addPayment, isLoading: paymentsLoading } = usePayments();
  const { toast } = useToast();

  const activeStudents = useMemo(() => 
    allStudents.filter(s => !s.isArchived && (!gradeFilter || s.grade === gradeFilter)),
  [allStudents, gradeFilter]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      amount: undefined,
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const student = activeStudents.find((s) => s.id === values.studentId);
    if (!student) return; 

    const paymentMonth = `${values.year}-${values.month}`;

    const alreadyPaid = payments.some(
      (p) => p.studentId === values.studentId && p.month === paymentMonth
    );

    if (alreadyPaid) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: `تم تسجيل دفعة لهذا الشهر للطالب ${student.name} بالفعل.`,
      });
      return;
    }

    addPayment({
      studentId: values.studentId,
      amount: values.amount,
      month: paymentMonth,
    });
    const monthLabel = availableMonths.find(m => m.value === values.month)?.label;
    toast({
      title: "تم تسجيل الدفعة",
      description: `تم تسجيل دفعة للطالب ${student.name} لشهر ${monthLabel} ${values.year}.`,
    });
    form.reset({
      studentId: "",
      amount: undefined,
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    });
  };

  const isLoading = studentsLoading || paymentsLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الطالب</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || activeStudents.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "جاري تحميل الطلاب..." : "اختر طالباً..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المبلغ</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" placeholder="0.00" className="pr-10" {...field} disabled={isLoading}/>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السنة</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر سنة..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الشهر</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر شهراً..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <CreditCard className="ms-2 h-4 w-4" />}
          تسجيل الدفعة
        </Button>
      </form>
    </Form>
  );
}
