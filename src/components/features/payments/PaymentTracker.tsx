"use client";

import { useState } from "react";
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
import { CreditCard, DollarSign } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ar } from "date-fns/locale";

const formSchema = z.object({
  studentId: z.string().min(1, "الرجاء اختيار طالب."),
  amount: z.coerce.number().min(1, "الرجاء إدخال المبلغ."),
  month: z.string().min(1, "الرجاء اختيار الشهر."),
});

const getLastNMonths = (n: number): { value: string; label: string }[] => {
  const months: { value: string; label: string }[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const date = subMonths(today, i);
    months.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: ar }),
    });
  }
  return months;
};

export default function PaymentTracker() {
  const { students } = useStudents();
  const { payments, addPayment } = usePayments();
  const { toast } = useToast();
  const availableMonths = getLastNMonths(12);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      amount: undefined,
      month: format(new Date(), "yyyy-MM"),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const student = students.find((s) => s.id === values.studentId);
    if (!student) return; // Should not happen if select is populated

    const alreadyPaid = payments.some(
      (p) => p.studentId === values.studentId && p.month === values.month
    );

    if (alreadyPaid) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: `تم تسجيل دفعة لهذا الشهر للطالب ${student.name} بالفعل.`,
      });
      return;
    }

    addPayment(values);
    toast({
      title: "تم تسجيل الدفعة",
      description: `تم تسجيل دفعة للطالب ${student.name} لشهر ${
        availableMonths.find((m) => m.value === values.month)?.label
      }.`,
    });
    form.reset({
      studentId: "",
      amount: undefined,
      month: format(new Date(), "yyyy-MM"),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الطالب</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طالباً..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المبلغ</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" placeholder="0.00" className="pr-10" {...field} />
                  </div>
                </FormControl>
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
        <Button type="submit" className="w-full">
          <CreditCard className="ms-2 h-4 w-4" />
          تسجيل الدفعة
        </Button>
      </form>
    </Form>
  );
}
