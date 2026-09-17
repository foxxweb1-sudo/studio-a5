
"use client";

import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, useDatabase } from "@/firebase";
import { Student, AttendanceRecord, PaymentRecord, UserProfile, WorkingSchedule, PaymentConfig, ExamResult, PromoCode } from "@/lib/definitions";
import { collection, addDoc, doc, serverTimestamp, updateDoc, deleteDoc, query, orderBy, setDoc, getDocs, where, getDoc } from "firebase/firestore";
import { ref, set, serverTimestamp as rtdbTimestamp } from "firebase/database";
import { format, parse, startOfMonth, addMonths, isBefore, isSameMonth } from 'date-fns';
import { ADMIN_EMAIL } from "@/lib/constants";

function getAllRequiredMonths(periods: any[] | undefined): string[] {
  if (!periods || !Array.isArray(periods) || periods.length === 0) return [];
  const allMonths = new Set<string>();
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  periods.forEach(period => {
    try {
      let startDate = parse(period.startMonth, 'yyyy-MM', new Date());
      let endDate = parse(period.endMonth, 'yyyy-MM', new Date());
      let limitDate = isBefore(endDate, currentMonthStart) ? endDate : currentMonthStart;
      let checkDate = startDate;
      while (isBefore(checkDate, limitDate) || isSameMonth(checkDate, limitDate)) {
        allMonths.add(format(checkDate, 'yyyy-MM'));
        checkDate = addMonths(checkDate, 1);
      }
    } catch (e) {}
  });
  return Array.from(allMonths).sort();
}

export function useTargetUid() {
    const { user } = useUser();
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: profile } = useDoc<UserProfile>(userRef);
    
    // إذا كان المستخدم مساعداً، نستهدف بيانات المعلم المسؤول عنه
    return profile?.isAssistant ? profile.assignedTeacherId : user?.uid;
}

export function useAllUsers() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const usersQuery = useMemoFirebase(() => 
    (firestore && isAdmin) ? collection(firestore, 'users') : null,
  [isAdmin, firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const toggleUserBlock = (userId: string, currentStatus: boolean) => {
    if (!isAdmin || !firestore) return;
    updateDoc(doc(firestore, 'users', userId), { isBlocked: !currentStatus });
  };

  const toggleUserVerify = (userId: string, currentStatus: boolean) => {
    if (!isAdmin || !firestore) return;
    updateDoc(doc(firestore, 'users', userId), { isVerified: !currentStatus });
  };

  return { users: users || [], isLoading, toggleUserBlock, toggleUserVerify };
}

export function usePromoCodes() {
    const firestore = useFirestore();
    const { user } = useUser();
    const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    
    const codesQuery = useMemoFirebase(() => 
        (firestore && isAdmin) ? query(collection(firestore, 'promoCodes'), orderBy('createdAt', 'desc')) : null,
    [isAdmin, firestore]);

    const { data: codes, isLoading } = useCollection<PromoCode>(codesQuery);

    const generateCode = async () => {
        if (!isAdmin) return;
        const newCode = `CYBE-PRO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await addDoc(collection(firestore, 'promoCodes'), {
            code: newCode,
            isUsed: false,
            createdAt: serverTimestamp()
        });
    };

    const deleteCode = async (id: string) => {
        if (!isAdmin) return;
        await deleteDoc(doc(firestore, 'promoCodes', id));
    };

    return { codes: codes || [], isLoading, generateCode, deleteCode };
}

export function useSchedule() {
  const firestore = useFirestore();
  const targetUid = useTargetUid();
  const scheduleRef = useMemoFirebase(() => (firestore && targetUid) ? doc(firestore, `users/${targetUid}/config`, 'schedule') : null, [targetUid, firestore]);
  const { data: schedule, isLoading } = useDoc<WorkingSchedule>(scheduleRef);
  const updateSchedule = (data: Partial<WorkingSchedule>) => {
    if (!targetUid || !firestore || !scheduleRef) return;
    setDoc(scheduleRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  };
  return { schedule, isLoading, updateSchedule };
}

export function useStudents() {
  const firestore = useFirestore();
  const rtdb = useDatabase();
  const targetUid = useTargetUid();
  const studentsQuery = useMemoFirebase(() => (firestore && targetUid) ? query(collection(firestore, `users/${targetUid}/students`), orderBy("createdAt", "asc")) : null, [targetUid, firestore]);
  const { data: students, isLoading } = useCollection<Student>(studentsQuery);

  const addStudent = async (studentData: any) => {
    if (!targetUid || !firestore) return;
    await addDoc(collection(firestore, `users/${targetUid}/students`), { ...studentData, createdAt: serverTimestamp() });
  };

  const updateStudent = async (studentId: string, studentData: Partial<Student>) => {
    if (!targetUid || !firestore) return;
    await updateDoc(doc(firestore, `users/${targetUid}/students`, studentId), studentData);
  };
  
  const deleteStudent = (studentId: string) => {
    if (!targetUid || !firestore) return;
    deleteDoc(doc(firestore, `users/${targetUid}/students`, studentId));
  };

  return { students: students || [], isLoading, addStudent, updateStudent, deleteStudent };
}

export function useAttendance() {
  const firestore = useFirestore();
  const targetUid = useTargetUid();
  const attendanceQuery = useMemoFirebase(() => (firestore && targetUid) ? collection(firestore, `users/${targetUid}/attendance`) : null, [targetUid, firestore]);
  const { data: attendance, isLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const addAttendance = async (studentId: string, status: 'present' | 'absent' = 'present') => {
    if (!targetUid || !firestore) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    await addDoc(collection(firestore, `users/${targetUid}/attendance`), { studentId, date: today, status, createdAt: serverTimestamp() });
  };
  
  return { attendance: attendance || [], isLoading, addAttendance };
}

export function usePayments() {
    const firestore = useFirestore();
    const targetUid = useTargetUid();
    const paymentsQuery = useMemoFirebase(() => (firestore && targetUid) ? collection(firestore, `users/${targetUid}/payments`) : null, [targetUid, firestore]);
    const { data: payments, isLoading } = useCollection<PaymentRecord>(paymentsQuery);

    const addPayment = async (paymentData: any) => {
        if (!targetUid || !firestore) return;
        await addDoc(collection(firestore, `users/${targetUid}/payments`), { ...paymentData, date: format(new Date(), 'yyyy-MM-dd'), createdAt: serverTimestamp() });
    };

    return { payments: payments || [], isLoading, addPayment };
}

export function useExams() {
  const firestore = useFirestore();
  const targetUid = useTargetUid();
  const examsQuery = useMemoFirebase(() => (firestore && targetUid) ? query(collection(firestore, `users/${targetUid}/exams`), orderBy("createdAt", "desc")) : null, [targetUid, firestore]);
  const { data: exams, isLoading } = useCollection<ExamResult>(examsQuery);

  const addExamResult = async (examData: any) => {
    if (!targetUid || !firestore) return;
    await addDoc(collection(firestore, `users/${targetUid}/exams`), { ...examData, createdAt: serverTimestamp() });
  };

  const deleteExamResult = (id: string) => {
    if (!targetUid || !firestore) return;
    deleteDoc(doc(firestore, `users/${targetUid}/exams`, id));
  };

  return { exams: exams || [], isLoading, addExamResult, deleteExamResult };
}

export function usePaymentSettings() {
  const firestore = useFirestore();
  const targetUid = useTargetUid();
  const settingsRef = useMemoFirebase(() => (firestore && targetUid) ? doc(firestore, `users/${targetUid}/config`, 'payments') : null, [targetUid, firestore]);
  const { data: settings, isLoading } = useDoc<PaymentConfig>(settingsRef);
  const updateGradeSettings = (grade: string, data: any) => {
    if (!targetUid || !firestore || !settingsRef) return;
    const newGrades = { ...(settings?.grades || {}) };
    newGrades[grade] = data;
    setDoc(settingsRef, { grades: newGrades, updatedAt: serverTimestamp() }, { merge: true });
  };
  return { settings, isLoading, updateGradeSettings };
}
