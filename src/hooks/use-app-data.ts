"use client";

import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError, useDatabase } from "@/firebase";
import { Student, AttendanceRecord, PaymentRecord, NewStudent, NewPayment, UserProfile, WorkingSchedule, PaymentConfig, GradePaymentConfig, ExamResult, NewExamResult } from "@/lib/definitions";
import { collection, addDoc, doc, serverTimestamp, updateDoc, deleteDoc, query, orderBy, setDoc, getDocs, where, limit } from "firebase/firestore";
import { ref, set, serverTimestamp as rtdbTimestamp } from "firebase/database";
import { format } from 'date-fns';
import { ADMIN_EMAIL } from "@/lib/constants";

// دالة لمزامنة بيانات الطالب مع Realtime Database لولي الأمر
async function syncStudentPortal(db: any, rtdb: any, teacherId: string, studentId: string) {
  if (!db || !rtdb || !teacherId || !studentId) return;

  try {
    const studentRef = doc(db, `users/${teacherId}/students`, studentId);
    const studentSnap = await getDocs(query(collection(db, `users/${teacherId}/students`), where('__name__', '==', studentId), limit(1)));
    if (studentSnap.empty) return;
    const studentData = studentSnap.docs[0].data();

    const attendanceSnap = await getDocs(query(collection(db, `users/${teacherId}/attendance`), where('studentId', '==', studentId), orderBy('date', 'desc'), limit(15)));
    const paymentsSnap = await getDocs(query(collection(db, `users/${teacherId}/payments`), where('studentId', '==', studentId), orderBy('month', 'desc'), limit(5)));
    const examsSnap = await getDocs(query(collection(db, `users/${teacherId}/exams`), where('studentId', '==', studentId), orderBy('date', 'desc'), limit(10)));

    const portalRef = ref(rtdb, `portal/${teacherId}/${studentId}`);
    await set(portalRef, {
      info: {
        name: studentData.name,
        grade: studentData.grade,
        teacherId: teacherId
      },
      attendance: attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      payments: paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      exams: examsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      lastUpdate: rtdbTimestamp()
    });
  } catch (error) {
    console.error("Portal Sync Failed:", error);
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
    const targetUser = users?.find(u => u.uid === userId);
    if (targetUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return;
    const userDoc = doc(firestore, 'users', userId);
    updateDoc(userDoc, { isBlocked: !currentStatus }).catch(error => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDoc.path, operation: 'update', requestResourceData: { isBlocked: !currentStatus } }));
    });
  };

  return { users: users || [], isLoading, toggleUserBlock };
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

  const addStudent = (studentData: NewStudent) => {
    if (!user || !firestore) return;
    addDoc(collection(firestore, `users/${user.uid}/students`), { ...studentData, createdAt: serverTimestamp() });
  };

  const updateStudent = (studentId: string, studentData: Partial<Student>) => {
    if (!user || !firestore) return;
    updateDoc(doc(firestore, `users/${user.uid}/students`, studentId), studentData);
    syncStudentPortal(firestore, rtdb, user.uid, studentId);
  };
  
  const deleteStudent = (studentId: string) => {
    if (!user || !firestore) return;
    deleteDoc(doc(firestore, `users/${user.uid}/students`, studentId));
  };

  return { students: students || [], isLoading, addStudent, updateStudent, deleteStudent };
}

export function useAttendance() {
  const firestore = useFirestore();
  const rtdb = useDatabase();
  const { user } = useUser();
  const attendanceQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, `users/${user.uid}/attendance`) : null, [user, firestore]);
  const { data: attendance, isLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const addAttendance = (studentId: string, status: 'present' | 'absent' = 'present') => {
    if (!user || !firestore) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    addDoc(collection(firestore, `users/${user.uid}/attendance`), { studentId, date: today, status, createdAt: serverTimestamp() });
    syncStudentPortal(firestore, rtdb, user.uid, studentId);
  };

  const markAbsentees = async (grade: string, studentsList: Student[]) => {
    if (!user || !firestore || !attendance) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const studentsInGrade = studentsList.filter(s => s.grade === grade);
    const recordsToday = attendance.filter(a => a.date === today);
    const studentsWithRecordsIds = new Set(recordsToday.map(r => r.studentId));
    const absentees = studentsInGrade.filter(s => !studentsWithRecordsIds.has(s.id));
    for (const student of absentees) {
      addAttendance(student.id, 'absent');
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

    const addPayment = (paymentData: NewPayment) => {
        if (!user || !firestore) return;
        addDoc(collection(firestore, `users/${user.uid}/payments`), { ...paymentData, date: format(new Date(), 'yyyy-MM-dd'), createdAt: serverTimestamp() });
        syncStudentPortal(firestore, rtdb, user.uid, paymentData.studentId);
    };

    return { payments: payments || [], isLoading, addPayment };
}

export function useExams() {
  const firestore = useFirestore();
  const rtdb = useDatabase();
  const { user } = useUser();
  const examsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, `users/${user.uid}/exams`), orderBy("createdAt", "desc")) : null, [user, firestore]);
  const { data: exams, isLoading } = useCollection<ExamResult>(examsQuery);

  const addExamResult = (examData: NewExamResult) => {
    if (!user || !firestore) return;
    addDoc(collection(firestore, `users/${user.uid}/exams`), { ...examData, createdAt: serverTimestamp() });
    syncStudentPortal(firestore, rtdb, user.uid, examData.studentId);
  };

  const deleteExamResult = (id: string) => {
    if (!user || !firestore) return;
    deleteDoc(doc(firestore, `users/${user.uid}/exams`, id));
  };

  return { exams: exams || [], isLoading, addExamResult, deleteExamResult };
}
