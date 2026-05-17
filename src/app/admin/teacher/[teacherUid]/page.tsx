
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  Users, 
  Trash2,
  Copy,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ADMIN_EMAIL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function TeacherStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const teacherUid = params.teacherUid as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  useEffect(() => {
    if (isUserLoading) return;
    
    if (!isAdmin) {
      router.push('/');
      return;
    }

    if (!firestore || !teacherUid) return;

    setLoading(true);

    const unsub = onSnapshot(collection(firestore, `users/${teacherUid}/students`), (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, [firestore, isAdmin, isUserLoading, router, teacherUid]);

  const handleDeleteStudent = (studentId: string) => {
    if (!firestore || !isAdmin) return;
    const docRef = doc(firestore, `users/${teacherUid}/students`, studentId);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "تم الحذف" });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        }));
      });
  };

  const handleDeleteAllStudents = () => {
    if (!firestore || !isAdmin || students.length === 0) return;
    
    students.forEach((student) => {
      const docRef = doc(firestore, `users/${teacherUid}/students`, student.id);
      deleteDoc(docRef).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        }));
      });
    });

    toast({ title: "جاري حذف الكل" });
  };

  if (isUserLoading || loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="font-bold">جاري تحميل القائمة...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">طلاب المعرف UID</PageHeaderTitle>
          <PageHeaderDescription className="font-mono text-xs break-all opacity-60">
            {teacherUid}
          </PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={students.length === 0} className="rounded-xl font-bold">
                  حذف الكل
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف كافة الطلاب؟</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogAction onClick={handleDeleteAllStudents}>تأكيد الحذف</AlertDialogAction>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold">
                رجوع
            </Button>
        </div>
      </div>

      <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right px-8">اسم الطالب</TableHead>
                <TableHead className="text-right">المرحلة</TableHead>
                <TableHead className="text-center px-8">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-bold px-8">{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell className="text-center px-8">
                     <Button variant="ghost" size="icon" className="text-rose-500" onClick={() => handleDeleteStudent(student.id)}>
                        <Trash2 className="h-5 w-5" />
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
