"use client";

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { Student, AttendanceRecord, PaymentRecord, NewStudent, NewPayment } from "@/lib/definitions";
import { collection, addDoc, doc, serverTimestamp, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { format } from 'date-fns';

// --- Students Hook ---
export function useStudents() {
  const firestore = useFirestore();
  const { user } = useUser();

  const studentsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, `users/${user.uid}/students`), orderBy("createdAt", "asc")) : null,
  [user, firestore]);

  const { data: students, isLoading } = useCollection<Student>(studentsQuery);

  const addStudent = (studentData: NewStudent) => {
    if (!user) return;
    const studentCollection = collection(firestore, `users/${user.uid}/students`);
    const newStudent = {
      ...studentData,
      createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(studentCollection, newStudent);
  };

  const updateStudent = (studentId: string, studentData: Partial<Student>) => {
    if (!user) return;
    const studentDoc = doc(firestore, `users/${user.uid}/students`, studentId);
    updateDocumentNonBlocking(studentDoc, studentData);
  };
  
  const deleteStudent = (studentId: string) => {
    if (!user) return;
    const studentDoc = doc(firestore, `users/${user.uid}/students`, studentId);
    deleteDocumentNonBlocking(studentDoc);
  };

  return { students: students || [], isLoading, addStudent, updateStudent, deleteStudent };
}

// --- Attendance Hook ---
export function useAttendance() {
  const firestore = useFirestore();
  const { user } = useUser();

  const attendanceQuery = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/attendance`) : null,
  [user, firestore]);
  
  const { data: attendance, isLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const addAttendance = (studentId: string) => {
    if (!user) return;
    const attendanceCollection = collection(firestore, `users/${user.uid}/attendance`);
    const today = format(new Date(), 'yyyy-MM-dd');
    const newRecord = {
      studentId,
      date: today,
      status: "present",
      createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(attendanceCollection, newRecord);
  };
  
  return { attendance: attendance || [], isLoading, addAttendance };
}

// --- Payments Hook ---
export function usePayments() {
    const firestore = useFirestore();
    const { user } = useUser();

    const paymentsQuery = useMemoFirebase(() =>
      user ? collection(firestore, `users/${user.uid}/payments`) : null,
    [user, firestore]);

    const { data: payments, isLoading } = useCollection<PaymentRecord>(paymentsQuery);

    const addPayment = (paymentData: NewPayment) => {
        if (!user) return;
        const paymentCollection = collection(firestore, `users/${user.uid}/payments`);
        const newPayment = {
            ...paymentData,
            date: format(new Date(), 'yyyy-MM-dd'),
            createdAt: serverTimestamp(),
        };
        addDocumentNonBlocking(paymentCollection, newPayment);
    };

    return { payments: payments || [], isLoading, addPayment };
}

    