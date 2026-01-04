"use client";

import { useStudents, usePayments } from "@/hooks/use-app-data";
import { Student, PaymentRecord } from "@/lib/definitions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { subMonths, format } from "date-fns";
import { Loader2 } from "lucide-react";

// Function to get the last N months
const getLastNMonths = (n: number): string[] => {
  const months: string[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    months.push(format(subMonths(today, i), "yyyy-MM"));
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

export default function OutstandingPayments() {
  const { students, isLoading: studentsLoading } = useStudents();
  const { payments, isLoading: paymentsLoading } = usePayments();

  const requiredMonths = getLastNMonths(3); // Check last 3 months for payment
  const outstandingStudents = getOutstandingStudents(students, payments, requiredMonths);

  const isLoading = studentsLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {outstandingStudents.length > 0 ? (
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الطالب</TableHead>
                <TableHead>الفصل</TableHead>
                <TableHead>الشهور المستحقة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstandingStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.outstandingMonths.map((month) => (
                        <Badge key={month} variant="destructive">
                          {month}
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
