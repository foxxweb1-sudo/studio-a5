"use client";

import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError, useDatabase } from "@/firebase";
import { Student, AttendanceRecord, PaymentRecord, NewStudent, NewPayment, UserProfile, WorkingSchedule, PaymentConfig, GradePaymentConfig, ExamResult, NewExamResult } from "@/lib/definitions";
import { collection, addDoc, doc, serverTimestamp, updateDoc, deleteDoc, query, orderBy, setDoc, getDocs, where, limit, getDoc } from "firebase/firestore";
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

export async function syncStudentPortal(db: any, rtdb: any, teacherId: string, studentId: string) {
  if (!db || !rtdb || !teacherId || !studentId) return false;
  try {
    const teacherSnap = await getDoc(doc(db, 'users', teacherId));
    const teacherData = teacherSnap.exists() ? teacherSnap.data() : null;
    const studentSnap = await getDoc(doc(db, `users/${teacherId}/students`, studentId));
    if (!studentSnap.exists()) return false;
    const studentData = studentSnap.data();
    const attendanceSnap = await getDocs(query(collection(db, `users/${teacherId}/attendance`), where('studentId', '==', studentId)));
    const paymentsSnap = await getDocs(query(collection(db, `users/${teacherId}/payments`), where('studentId', '==', studentId)));
    const examsSnap = await getDocs(query(collection(db, `users/${teacherId}/exams`), where('studentId', '==', studentId)));
    const configSnap = await getDoc(doc(db, `users/${teacherId}/config`, 'payments'));
    const paymentConfig = configSnap.exists() ? configSnap.data() as PaymentConfig : null;

    const sortedAttendance = attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() as any }))
      .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25);
    const sortedPayments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }))
      .sort((a, b) => b.month.localeCompare(a.month)).slice(0, 12);
    const sortedExams = examsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }))
      .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

    let outstandingMonths: string[] = [];
    if (paymentConfig?.grades?.[studentData.grade]) {
        const requiredMonths = getAllRequiredMonths(paymentConfig.grades[studentData.grade].periods);
        const paidMonths = sortedPayments.map(p => p.month);
        outstandingMonths = requiredMonths.filter(m => !paidMonths.includes(m));
    }

    const portalRef = ref(rtdb, `portal/${teacherId}/${studentId}`);
    await set(portalRef, {
      info: {
        name: studentData.name,
        grade: studentData.grade,
        teacherId: teacherId,
        teacherName: teacherData?.displayName || 'المعلم',
        teacherPhone: teacherData?.phone || ''
      },
      attendance: sortedAttendance,
      payments: sortedPayments,
      exams: sortedExams,
      outstandingMonths,
      lastUpdate: rtdbTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Portal Sync Error", error);
    throw error;
  }
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
    const userDoc = doc(firestore, 'users', userId);
    updateDoc(userDoc, { isBlocked: !currentStatus });
  };

  const toggleUserVerify = (userId: string, currentStatus: boolean) => {
    if (!isAdmin || !firestore) return;
    const userDoc = doc(firestore, 'users', userId);
    updateDoc(userDoc, { isVerified: !currentStatus });
  };

  return { users: users || [], isLoading, toggleUserBlock, toggleUserVerify };
}

export function useSchedule() {
  const firestore = useFirestore();
  const { user } = useUser();
  const scheduleRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, `users/${user.uid}/config`, 'schedule') : null, [user, firestore]);
  const { data: schedule, isLoading } = useDoc<WorkingSchedule>(scheduleRef);
  const updateSchedule = (data: Partial<WorkingSchedule>) => {
    if (!user || !firestore || !scheduleRef) return;
    setDoc(scheduleRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  };
  return { schedule, isLoading, updateSchedule };
}

export function usePaymentSettings() {
  const firestore = useFirestore();
  const { user } = useUser();
  const settingsRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, `users/${user.uid}/config`, 'payments') : null, [user, firestore]);
  const { data: settings, isLoading } = useDoc<PaymentConfig>(settingsRef);
  const updateGradeSettings = (grade: string, data: GradePaymentConfig) => {
    if (!user || !firestore || !settingsRef) return;
    const newGrades = { ...(settings?.grades || {}) };
    newGrades[grade] = data;
    setDoc(settingsRef, { grades: newGrades, updatedAt: serverTimestamp() }, { merge: true });
  };
  return { settings, isLoading, updateGradeSettings };
}

export function useStudents() {
  const firestore = useFirestore();
  const rtdb = useDatabase();
  const { user } = useUser();
  const studentsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, `users/${user.uid}/students`), orderBy("createdAt", "asc")) : null, [user, firestore]);
  const { data: students, isLoading } = useCollection<Student>(studentsQuery);

  const addStudent = async (studentData: NewStudent) => {
    if (!user || !firestore) return;
    const docRef = await addDoc(collection(firestore, `users/${user.uid}/students`), { ...studentData, createdAt: serverTimestamp() });
    try { await syncStudentPortal(firestore, rtdb, user.uid, docRef.id); } catch (e) {}
  };

  const updateStudent = async (studentId: string, studentData: Partial<Student>) => {
    if (!user || !firestore) return;
    await updateDoc(doc(firestore, `users/${user.uid}/students`, studentId), studentData);
    try { await syncStudentPortal(firestore, rtdb, user.uid, studentId); } catch (e) {}
  };
  
  const deleteStudent = (studentId: string) => {
    if (!user || !firestore) return;
    deleteDoc(doc(firestore, `users/${user.uid}/students`, studentId));
  };

  const forceSync = async (studentId: string) => {
    if (!user || !firestore || !rtdb) return;
    return await syncStudentPortal(firestore, rtdb, user.uid, studentId);
  };

  return { students: students || [], isLoading, addStudent, updateStudent, deleteStudent, forceSync };
}

export function useAttendance() {
  const firestore = useFirestore();
  const rtdb = useDatabase();
  const { user } = useUser();
  const attendanceQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, `users/${user.uid}/attendance`) : null, [user, firestore]);
  const { data: attendance, isLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const addAttendance = async (studentId: string, status: 'present' | 'absent' = 'present') => {
    if (!user || !firestore) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    await addDoc(collection(firestore, `users/${user.uid}/attendance`), { studentId, date: today, status, createdAt: serverTimestamp() });
    try { await syncStudentPortal(firestore, rtdb, user.uid, studentId); } catch (e) {}
  };

  const markAbsentees = async (grade: string, studentsList: Student[]) => {
    if (!user || !firestore || !attendance) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const studentsInGrade = studentsList.filter(s => s.grade === grade);
    const recordsToday = attendance.filter(a => a.date === today);
    const studentsWithRecordsIds = new Set(recordsToday.map(r => r.studentId));
    const absentees = studentsInGrade.filter(s => !studentsWithRecordsIds.has(s.id));
    for (const student of absentees) {
      await addAttendance(student.id, 'absent');
    }
  };
  
  return { attendance: attendance || [], isLoading, addAttendance, markAbsentees };
}

export function usePayments() {
    const firestore = useFirestore();
    const rtdb = useDatabase();
    const { user } = useUser();
    const paymentsQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, `users/${user.uid}/payments`) : null, [user, firestore]);
    const { data: payments, isLoading } = useCollection<PaymentRecord>(paymentsQuery);

    const addPayment = async (paymentData: NewPayment) => {
        if (!user || !firestore) return;
        await addDoc(collection(firestore, `users/${user.uid}/payments`), { ...paymentData, date: format(new Date(), 'yyyy-MM-dd'), createdAt: serverTimestamp() });
        try { await syncStudentPortal(firestore, rtdb, user.uid, paymentData.studentId); } catch (e) {}
    };

    return { payments: payments || [], isLoading, addPayment };
}

export function useExams() {
  const firestore = useFirestore();
  const rtdb = useDatabase();
  const { user } = useUser();
  const examsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, `users/${user.uid}/exams`), orderBy("createdAt", "desc")) : null, [user, firestore]);
  const { data: exams, isLoading } = useCollection<ExamResult>(examsQuery);

  const addExamResult = async (examData: NewExamResult) => {
    if (!user || !firestore) return;
    await addDoc(collection(firestore, `users/${user.uid}/exams`), { ...examData, createdAt: serverTimestamp() });
    try { await syncStudentPortal(firestore, rtdb, user.uid, examData.studentId); } catch (e) {}
  };

  const deleteExamResult = (id: string) => {
    if (!user || !firestore) return;
    deleteDoc(doc(firestore, `users/${user.uid}/exams`, id));
  };

  return { exams: exams || [], isLoading, addExamResult, deleteExamResult };
}
