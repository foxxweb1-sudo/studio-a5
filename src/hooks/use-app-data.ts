
"use client";

import { useCollection, useFirestore, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { Student, AttendanceRecord, PaymentRecord, NewStudent, NewPayment, UserProfile } from "@/lib/definitions";
import { collection, addDoc, doc, serverTimestamp, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { format } from 'date-fns';
import { ADMIN_EMAIL } from "@/lib/constants";

// --- Users Hook (For Admin) ---
export function useAllUsers() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const usersQuery = useMemoFirebase(() => 
    isAdmin ? query(collection(firestore, 'users'), orderBy("displayName", "asc")) : null,
  [isAdmin, firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const toggleUserBlock = (userId: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    const userDoc = doc(firestore, 'users', userId);
    updateDoc(userDoc, { isBlocked: !currentStatus }).catch(error => {
       errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: userDoc.path,
          operation: 'update',
          requestResourceData: { isBlocked: !currentStatus },
        })
      )
    });
  };

  return { users: users || [], isLoading, toggleUserBlock };
}

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
    addDoc(studentCollection, newStudent).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: studentCollection.path,
          operation: 'create',
          requestResourceData: newStudent,
        })
      )
    });
  };

  const updateStudent = (studentId: string, studentData: Partial<Student>) => {
    if (!user) return;
    const studentDoc = doc(firestore, `users/${user.uid}/students`, studentId);
    updateDoc(studentDoc, studentData).catch(error => {
       errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: studentDoc.path,
          operation: 'update',
          requestResourceData: studentData,
        })
      )
    });
  };
  
  const deleteStudent = (studentId: string) => {
    if (!user) return;
    const studentDoc = doc(firestore, `users/${user.uid}/students`, studentId);
    deleteDoc(studentDoc).catch(error => {
       errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: studentDoc.path,
          operation: 'delete',
        })
      )
    });
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
    addDoc(attendanceCollection, newRecord).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: attendanceCollection.path,
          operation: 'create',
          requestResourceData: newRecord,
        })
      )
    });
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
        addDoc(paymentCollection, newPayment).catch(error => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                path: paymentCollection.path,
                operation: 'create',
                requestResourceData: newPayment,
                })
            );
        });
    };

    return { payments: payments || [], isLoading, addPayment };
}
