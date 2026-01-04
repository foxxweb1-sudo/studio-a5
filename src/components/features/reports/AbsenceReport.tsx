"use client";

import { useStudents, useAttendance } from "@/hooks/use-app-data";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserX } from "lucide-react";

export default function AbsenceReport() {
  const { students } = useStudents();
  const { attendance } = useAttendance();
  const today = format(new Date(), "yyyy-MM-dd");

  const attendedTodayIds = new Set(
    attendance.filter((a) => a.date === today).map((a) => a.studentId)
  );

  const absentStudents = students.filter(
    (student) => !attendedTodayIds.has(student.id)
  );

  return (
    <div>
      {students.length === 0 ? (
        <div className="text-center text-muted-foreground p-8">
          <p>يرجى إضافة طلاب أولاً لعرض تقرير الغياب.</p>
        </div>
      ) : absentStudents.length > 0 ? (
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الفصل</TableHead>
                <TableHead>هاتف ولي الأمر</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absentStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.parentPhone || "لا يوجد"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Alert>
          <UserX className="h-4 w-4" />
          <AlertTitle>لا يوجد غياب اليوم!</AlertTitle>
          <AlertDescription>
            جميع الطلاب المسجلين قد سجلوا حضورهم اليوم.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
