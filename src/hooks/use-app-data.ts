"use client";

import { Student, AttendanceRecord, PaymentRecord } from "@/lib/definitions";
import useLocalStorage from "./use-local-storage";
import { format } from 'date-fns';

// --- Students Hook ---
export function useStudents() {
  const [students, setStudents] = useLocalStorage<Student[]>("students", []);

  const addStudent = (studentData: Omit<Student, "id" | "createdAt">) => {
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setStudents([...students, newStudent]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(
      students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const deleteStudent = (studentId: string) => {
    setStudents(students.filter((s) => s.id !== studentId));
  };

  return { students, addStudent, updateStudent, deleteStudent };
}

// --- Attendance Hook ---
export function useAttendance() {
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>(
    "attendance",
    []
  );

  const addAttendance = (studentId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newRecord: AttendanceRecord = {
      studentId,
      date: today,
      status: "present",
    };
    setAttendance([...attendance, newRecord]);
  };
  
  return { attendance, addAttendance };
}

// --- Payments Hook ---
export function usePayments() {
    const [payments, setPayments] = useLocalStorage<PaymentRecord[]>("payments", []);

    const addPayment = (paymentData: Omit<PaymentRecord, 'id' | 'date'>) => {
        const newPayment: PaymentRecord = {
            ...paymentData,
            id: `payment-${Date.now()}`,
            date: format(new Date(), 'yyyy-MM-dd'),
        };
        setPayments([...payments, newPayment]);
    };

    return { payments, addPayment };
}
