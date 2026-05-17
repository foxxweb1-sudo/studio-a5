
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
  Copy
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
import { Card, CardContent } from '@/components/ui/card';
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

  // قائمة بكافة المعرفات (المستخدمين المسجلين أو من لديهم طلاب)
  const allTeachersUids = useMemo(() => {
    const uids = new Set(Object.keys(usersProfiles));
    // في حال وجود طلاب لمعلم لم يسجل بروفايله بعد (احتياط)
    Object.keys(groupedStudents).forEach(uid => uids.add(uid));
    return Array.from(uids);
  }, [usersProfiles, groupedStudents]);

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
        // المسار: users/{userId}/students/{studentId}
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "تم نسخ المعرف بنجاح." });
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
                <PageHeaderDescription>إدارة الحسابات المسجلة والطلاب التابعين لها.</PageHeaderDescription>
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
            { label: 'إجمالي المعلمين', value: allTeachersUids.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' },
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

       <Tabs defaultValue="teachers" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-14 bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger value="teachers" className="rounded-xl font-bold">المعلمون والطلاب</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl font-bold">رسائل التواصل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers">
                <div className="space-y-6">
                  <div className="text-right px-4">
                    <h3 className="text-xl font-black">الحسابات المسجلة ({allTeachersUids.length})</h3>
                    <p className="text-sm text-muted-foreground">يتم عرض كافة الحسابات التي قامت بالدخول للتطبيق.</p>
                  </div>

                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {allTeachersUids.length > 0 ? allTeachersUids.map((teacherUid) => {
                      const profile = usersProfiles[teacherUid];
                      const students = groupedStudents[teacherUid] || [];
                      const teacherName = profile?.displayName || 'معلم غير مسمى';

                      return (
                        <AccordionItem key={teacherUid} value={teacherUid} className="border-0 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
                          <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-all group">
                            <div className="flex items-center gap-4 w-full text-right">
                              <div className="p-3 bg-primary/10 text-primary rounded-2xl group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-colors">
                                <UserCircle className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black text-lg">
                                  {teacherName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                                    UID: {teacherUid}
                                    <Copy className="h-2 w-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); copyToClipboard(teacherUid); }} />
                                  </span>
                                  {profile?.email && <span className="text-[10px] text-muted-foreground">({profile.email})</span>}
                                </div>
                              </div>
                              <div className={`text-xs font-bold px-4 py-1.5 rounded-full border me-4 transition-colors ${students.length > 0 ? 'bg-primary/5 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-transparent'}`}>
                                {students.length} طالب
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-0 border-t">
                            {students.length > 0 ? (
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
                                                أنت على وشك حذف الطالب <span className="font-bold text-rose-600">({student.name})</span>. لا يمكن التراجع عن هذا الإجراء.
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
                            ) : (
                                <div className="py-12 text-center text-muted-foreground italic bg-muted/5">
                                    هذا المعلم لم يقم بإضافة أي طلاب بعد.
                                </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      )
                    }) : (
                      <div className="py-20 text-center text-muted-foreground font-bold bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed">
                        لا يوجد حسابات مسجلة حالياً.
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
                            لا توجد رسائل واردة حالياً.
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
