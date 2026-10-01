
"use client";

import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, useDatabase } from "@/firebase";
import { Student, AttendanceRecord, PaymentRecord, UserProfile, WorkingSchedule, PaymentConfig, ExamResult, GradePaymentPeriod } from "@/lib/definitions";
import { 
  collection, 
  addDoc, 
  doc, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  setDoc, 
  onSnapshot,
  getDocs,
  where,
  getDoc
} from "firebase/firestore";
import { ref, set } from "firebase/database";
import { format, parse, startOfMonth, addMonths, isBefore, isSameMonth } from 'date-fns';
import { ADMIN_EMAILS } from "@/lib/constants";
import { useEffect, useState } from "react";

/**
 * دالة ذكية لحساب كافة الشهور المطلوبة من مجموعة فترات زمنية
 * (منسوخة من OutstandingPayments للاتساق)
 */
const getAllRequiredMonths = (periods: GradePaymentPeriod[] | undefined): string[] => {
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
    } catch (e) {
      console.error("Error parsing period:", period);
    }
  });
  
  return Array.from(allMonths).sort();
};

/**
 * دالة المزامنة الشاملة لرفع بيانات الطالب إلى بوابة الأهل (RTDB)
 */
export async function syncStudentPortal(firestore: any, rtdb: any, teacherId: string, studentId: string) {
    if (!firestore || !rtdb || !teacherId || !studentId) return false;

    try {
        // 1. جلب بيانات الطالب الأساسية
        const studentDoc = await getDoc(doc(firestore, `users/${teacherId}/students`, studentId));
        if (!studentDoc.exists()) return false;
        const studentData = studentDoc.data();

        // 2. جلب الحضور والمدفوعات والامتحانات بشكل متوازي للسرعة
        const [attendanceSnap, paymentsSnap, examsSnap, teacherDoc, configSnap] = await Promise.all([
            getDocs(query(collection(firestore, `users/${teacherId}/attendance`), where("studentId", "==", studentId))),
            getDocs(query(collection(firestore, `users/${teacherId}/payments`), where("studentId", "==", studentId))),
            getDocs(query(collection(firestore, `users/${teacherId}/exams`), where("studentId", "==", studentId))),
            getDoc(doc(firestore, 'users', teacherId)),
            getDoc(doc(firestore, `users/${teacherId}/config`, 'payments'))
        ]);

        const attendance = attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const payments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const exams = examsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const teacherData = teacherDoc.exists() ? teacherDoc.data() : {};
        const paymentConfig = configSnap.exists() ? configSnap.data() as PaymentConfig : null;

        // 3. حساب المتأخرات المالية
        let outstandingMonths: string[] = [];
        const gradeConfig = paymentConfig?.grades?.[studentData.grade];
        if (gradeConfig && gradeConfig.periods) {
            const requiredMonths = getAllRequiredMonths(gradeConfig.periods);
            const paidMonths = payments.map((p: any) => p.month);
            outstandingMonths = requiredMonths.filter(m => !paidMonths.includes(m));
        }

        // 4. رفع البيانات للـ RTDB (البوابة العامة)
        const portalRef = ref(rtdb, `portal/${teacherId}/${studentId}`);
        await set(portalRef, {
            info: {
                name: studentData.name,
                grade: studentData.grade,
                teacherName: teacherData.displayName || 'المعلم',
                teacherPhone: teacherData.phone || '',
            },
            attendance: attendance.sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, 50), // آخر 50 سجل فقط
            payments: payments.sort((a: any, b: any) => b.month.localeCompare(a.month)),
            exams: exams.sort((a: any, b: any) => b.date.localeCompare(a.date)),
            outstandingMonths,
            lastUpdate: new Date().toISOString()
        });

        return true;
    } catch (e) {
        console.error("Sync Error:", e);
        return false;
    }
}

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
  const isAdmin = !!user?.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase());

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
  const rtdb = useDatabase();
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

  const forceSync = async (studentId: string) => {
    if (!targetUid || !firestore || !rtdb) return false;
    return await syncStudentPortal(firestore, rtdb, targetUid, studentId);
  };

  return { students: students || [], isLoading, addStudent, updateStudent, deleteStudent, forceSync };
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

  const markAbsentees = async (grade: string, studentsInGroup: Student[]) => {
    if (!targetUid || !firestore || studentsInGroup.length === 0) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // جلب الحضور المسجل اليوم فعلياً
    const querySnapshot = await getDocs(query(
        collection(firestore, `users/${targetUid}/attendance`), 
        where("date", "==", today)
    ));
    const attendedIds = new Set(querySnapshot.docs.map(d => d.data().studentId));

    // رصد الطلاب الذين ينتمون للمجموعة ولم يسجلوا حضوراً
    const absentees = studentsInGroup.filter(s => !attendedIds.has(s.id));

    for (const student of absentees) {
        await addDoc(collection(firestore, `users/${targetUid}/attendance`), { 
            studentId: student.id, 
            date: today, 
            status: 'absent', 
            createdAt: serverTimestamp() 
        });
    }
  };
  
  return { attendance: attendance || [], isLoading, addAttendance, markAbsentees };
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
