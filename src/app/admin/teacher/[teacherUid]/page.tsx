
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
  GraduationCap
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
import { ADMIN_UID } from '@/lib/constants';
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

export default function TeacherStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const teacherUid = params.teacherUid as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

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

  const handleDeleteStudent = async (studentId: string) => {
    if (!firestore || !isAdmin) return;
    try {
      await deleteDoc(doc(firestore, `users/${teacherUid}/students`, studentId));
      toast({ title: "تم الحذف", description: "تم حذف الطالب بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف." });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "تم نسخ المعرف بنجاح." });
  };

  if (isUserLoading || loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="font-bold">جاري تحميل قائمة الطلاب...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg">
                <Users className="h-6 w-6" />
             </div>
             <div>
                <PageHeaderTitle className="text-3xl font-black">طلاب المعرف UID</PageHeaderTitle>
                <PageHeaderDescription className="font-mono text-xs break-all opacity-60">
                  {teacherUid}
                </PageHeaderDescription>
             </div>
          </div>
        </PageHeader>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => copyToClipboard(teacherUid)} className="rounded-xl h-12 font-bold px-4">
                <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl h-12 font-bold px-6 border-primary/20 hover:bg-primary/5 transition-all">
                <ArrowLeft className="ms-2 h-5 w-5" />
                رجوع للوحة التحكم
            </Button>
        </div>
      </div>

      <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right font-bold px-8 h-14">اسم الطالب</TableHead>
                <TableHead className="text-right font-bold h-14">المرحلة / الصف</TableHead>
                <TableHead className="text-center font-bold px-8 h-14">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? students.map(student => (
                <TableRow key={student.id} className="hover:bg-muted/20 transition-colors h-16">
                  <TableCell className="font-bold px-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <GraduationCap className="h-4 w-4" />
                        </div>
                        {student.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">
                      {student.grade}
                    </span>
                  </TableCell>
                  <TableCell className="text-center px-8">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-black text-right">حذف الطالب نهائياً؟</AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-right">
                            أنت على وشك حذف الطالب <span className="font-bold text-rose-600">({student.name})</span>. لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3 flex-row-reverse">
                          <AlertDialogAction 
                            className="rounded-2xl h-12 font-bold bg-rose-600 hover:bg-rose-700 flex-1" 
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            تأكيد الحذف
                          </AlertDialogAction>
                          <AlertDialogCancel className="rounded-2xl h-12 font-bold flex-1">إلغاء</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 text-muted-foreground font-bold italic">
                    لا يوجد طلاب مسجلين لهذا الحساب حالياً.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-center opacity-40 text-[10px] font-bold uppercase tracking-widest">
          End of Student List for this UID
      </div>
    </div>
  );
}
