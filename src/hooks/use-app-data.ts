"use client";

import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, useDatabase } from "@/firebase";
import { Student, AttendanceRecord, PaymentRecord, UserProfile, WorkingSchedule, PaymentConfig, ExamResult } from "@/lib/definitions";
import { collection, addDoc, doc, serverTimestamp, updateDoc, deleteDoc, query, orderBy, setDoc, onSnapshot } from "firebase/firestore";
import { format } from 'date-fns';
import { ADMIN_EMAIL } from "@/lib/constants";
import { useEffect, useState } from "react";

export function useTargetUid() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [targetUid, setTargetUid] = useState<string | undefined>(undefined);
    
    useEffect(() => {
        if (!user || !firestore) {
            setTargetUid(undefined);
            return;
        }
        
        const userRef = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.isAssistant && data.assignedTeacherId) {
                    setTargetUid(data.assignedTeacherId);
                } else {
                    setTargetUid(user.uid);
                }
            }
        });
        
        return () => unsubscribe();
    }, [user, firestore]);
    
    return targetUid;
}

export function useAllUsers() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const usersQuery = useMemoFirebase(() => 
    (firestore && isAdmin && user) ? collection(firestore, 'users') : null,
  [isAdmin, firestore, user]);

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

export function useSchedule() {
  const firestore = useFirestore();
  const { user } = useUser();
  const targetUid = useTargetUid();
  const scheduleRef = useMemoFirebase(() => (firestore && targetUid && user) ? doc(firestore, `users/${targetUid}/config`, 'schedule') : null, [targetUid, firestore, user]);
  const { data: schedule, isLoading } = useDoc<WorkingSchedule>(scheduleRef);
  const updateSchedule = (data: Partial<WorkingSchedule>) => {
    if (!targetUid || !firestore || !scheduleRef) return;
    setDoc(scheduleRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  };
  return { schedule, isLoading, updateSchedule };
}

export function useStudents() {
  const firestore = useFirestore();
  const { user } = useUser();
  const targetUid = useTargetUid();
  const studentsQuery = useMemoFirebase(() => (firestore && targetUid && user) ? query(collection(firestore, `users/${targetUid}/students`), orderBy("createdAt", "asc")) : null, [targetUid, firestore, user]);
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
  const { user } = useUser();
  const targetUid = useTargetUid();
  const attendanceQuery = useMemoFirebase(() => (firestore && targetUid && user) ? collection(firestore, `users/${targetUid}/attendance`) : null, [targetUid, firestore, user]);
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
    const { user } = useUser();
    const targetUid = useTargetUid();
    const paymentsQuery = useMemoFirebase(() => (firestore && targetUid && user) ? collection(firestore, `users/${targetUid}/payments`) : null, [targetUid, firestore, user]);
    const { data: payments, isLoading } = useCollection<PaymentRecord>(paymentsQuery);

    const addPayment = async (paymentData: any) => {
        if (!targetUid || !firestore) return;
        await addDoc(collection(firestore, `users/${targetUid}/payments`), { ...paymentData, date: format(new Date(), 'yyyy-MM-dd'), createdAt: serverTimestamp() });
    };

    return { payments: payments || [], isLoading, addPayment };
}

export function useExams() {
  const firestore = useFirestore();
  const { user } = useUser();
  const targetUid = useTargetUid();
  const examsQuery = useMemoFirebase(() => (firestore && targetUid && user) ? query(collection(firestore, `users/${targetUid}/exams`), orderBy("createdAt", "desc")) : null, [targetUid, firestore, user]);
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
  const { user } = useUser();
  const targetUid = useTargetUid();
  const settingsRef = useMemoFirebase(() => (firestore && targetUid && user) ? doc(firestore, `users/${targetUid}/config`, 'payments') : null, [targetUid, firestore, user]);
  const { data: settings, isLoading } = useDoc<PaymentConfig>(settingsRef);
  const updateGradeSettings = (grade: string, data: any) => {
    if (!targetUid || !firestore || !settingsRef) return;
    const newGrades = { ...(settings?.grades || {}) };
    newGrades[grade] = data;
    setDoc(settingsRef, { grades: newGrades, updatedAt: serverTimestamp() }, { merge: true });
  };
  return { settings, isLoading, updateGradeSettings };
}