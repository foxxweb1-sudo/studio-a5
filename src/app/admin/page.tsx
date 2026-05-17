'use client';

import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, collectionGroup, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
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
  MessageSquare,
  ShieldCheck,
  Trash2,
  Mail,
  UserCircle,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from "@/components/ui/alert-dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [usersProfiles, setUsersProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  // تجميع الطلاب حسب المعلم
  const groupedStudents = useMemo(() => {
    const groups: Record<string, any[]> = {};
    allStudents.forEach(student => {
      if (!groups[student.teacherUid]) {
        groups[student.teacherUid] = [];
      }
      groups[student.teacherUid].push(student);
    });
    return groups;
  }, [allStudents]);

  useEffect(() => {
    if (isUserLoading) return;
    
    if (!isAdmin) {
      router.push('/');
      return;
    }

    if (!firestore) return;

    setLoading(true);

    // مراقبة كافة الطلاب
    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => {
        const pathSegments = doc.ref.path.split('/');
        const teacherUid = pathSegments[1]; 
        return { id: doc.id, teacherUid, ...doc.data() };
      });
      setAllStudents(list);
      setLoading(false);
    });

    // مراقبة الرسائل
    const unsubMessages = onSnapshot(query(collection(firestore, 'contactMessages'), orderBy('createdAt', 'desc')), (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });

    // مراقبة بروفايلات المستخدمين لجلب الأسماء والايميلات
    const unsubUsers = onSnapshot(collection(firestore, 'users'), (snap) => {
      const profiles: Record<string, any> = {};
      snap.docs.forEach(doc => {
        profiles[doc.id] = doc.data();
      });
      setUsersProfiles(profiles);
    });

    return () => {
      unsubStudents();
      unsubMessages();
      unsubUsers();
    };
  }, [firestore, isAdmin, isUserLoading, router]);

  const handleDeleteStudent = async (studentId: string, teacherUid: string) => {
    if (!firestore || !isAdmin) return;
    try {
      await deleteDoc(doc(firestore, `users/${teacherUid}/students`, studentId));
      toast({ title: "تم الحذف", description: "تم حذف الطالب بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف." });
    }
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-white gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="font-bold">جاري التحقق من الصلاحيات الإدارية...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
                <ShieldCheck className="h-6 w-6" />
             </div>
             <div>
                <PageHeaderTitle className="text-3xl font-black">لوحة التحكم العليا</PageHeaderTitle>
                <PageHeaderDescription>إدارة الطلاب مجمعة حسب حساب المعلم.</PageHeaderDescription>
             </div>
          </div>
        </PageHeader>
        <Button variant="outline" onClick={() => router.push('/')} className="rounded-xl h-12 font-bold px-6 border-primary/20 hover:bg-primary/5 transition-all">
            <ArrowLeft className="ms-2 h-5 w-5" />
            الرئيسية
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
            { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/10' },
            { label: 'إجمالي الحسابات', value: Object.keys(groupedStudents).length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' },
            { label: 'الرسائل الواردة', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-[2rem]">
                <CardContent className="p-6 flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-black">{loading ? '...' : stat.value}</div>
                    <div className="text-xs text-muted-foreground font-bold">{stat.label}</div>
                </CardContent>
            </Card>
        ))}
      </div>

       <Tabs defaultValue="students" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-14 bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger value="students" className="rounded-xl font-bold">قاعدة بيانات الطلاب</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl font-bold">رسائل التواصل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students">
                <div className="space-y-6">
                  <div className="text-right px-4">
                    <h3 className="text-xl font-black">الحسابات المسجلة ({Object.keys(groupedStudents).length})</h3>
                    <p className="text-sm text-muted-foreground">اضغط على المعرف (UID) لعرض الطلاب التابعين له.</p>
                  </div>

                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {Object.keys(groupedStudents).length > 0 ? Object.entries(groupedStudents).map(([teacherUid, students]) => {
                      const profile = usersProfiles[teacherUid];
                      return (
                        <AccordionItem key={teacherUid} value={teacherUid} className="border-0 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
                          <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-all group">
                            <div className="flex items-center gap-4 w-full text-right">
                              <div className="p-3 bg-primary/10 text-primary rounded-2xl group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-colors">
                                <UserCircle className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black text-lg">
                                  {profile?.displayName || 'معلم غير مسمى'}
                                </h4>
                                <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                                  <span className="bg-muted px-2 py-0.5 rounded">UID: {teacherUid}</span>
                                  {profile?.email && <span>• {profile.email}</span>}
                                </p>
                              </div>
                              <div className="bg-primary/5 text-primary text-xs font-bold px-4 py-1.5 rounded-full border border-primary/20 me-4">
                                {students.length} طالب
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-0 border-t">
                            <Table>
                              <TableHeader className="bg-muted/30">
                                <TableRow>
                                  <TableHead className="text-right font-bold px-6">اسم الطالب</TableHead>
                                  <TableHead className="text-right font-bold">المرحلة / الصف</TableHead>
                                  <TableHead className="text-center font-bold px-6">إجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {students.map(student => (
                                  <TableRow key={student.id} className="hover:bg-muted/10 transition-colors">
                                    <TableCell className="font-bold px-6">{student.name}</TableCell>
                                    <TableCell>
                                      <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">
                                        {student.grade}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center px-6">
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 rounded-xl">
                                            <Trash2 className="h-5 w-5" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-2xl font-black text-right">حذف الطالب نهائياً؟</AlertDialogTitle>
                                            <AlertDialogDescription className="text-base text-right">
                                              أنت على وشك حذف الطالب <span className="font-bold text-rose-600">({student.name})</span> من حساب المعلم <span className="font-bold">({profile?.displayName || teacherUid})</span>. لا يمكن التراجع عن هذا الإجراء.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter className="gap-3 flex-row-reverse">
                                            <AlertDialogAction className="rounded-2xl h-12 font-bold bg-rose-600 hover:bg-rose-700 flex-1" onClick={() => handleDeleteStudent(student.id, teacherUid)}>تأكيد الحذف</AlertDialogAction>
                                            <AlertDialogCancel className="rounded-2xl h-12 font-bold flex-1">إلغاء</AlertDialogCancel>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    }) : (
                      <div className="py-20 text-center text-muted-foreground font-bold bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed">
                        لا يوجد طلاب مسجلين في أي حساب حالياً.
                      </div>
                    )}
                  </Accordion>
                </div>
            </TabsContent>

            <TabsContent value="messages">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {messages.length > 0 ? messages.map(msg => (
                        <Card key={msg.id} className="border-0 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 p-8 border-r-4 border-emerald-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="text-right">
                                        <h4 className="font-black text-lg">{msg.name}</h4>
                                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold bg-muted px-3 py-1 rounded-full">
                                    {msg.createdAt ? format(msg.createdAt.toDate(), 'd MMM yyyy', { locale: ar }) : 'تاريخ غير متوفر'}
                                </span>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-2xl text-right">
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{msg.message}"</p>
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center text-muted-foreground font-bold bg-muted/20 rounded-[3rem] border-2 border-dashed">
                            لا توجد رسائل واردة من نموذج التواصل.
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
