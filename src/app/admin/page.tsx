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
  UserCheck,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Mail,
  Fingerprint
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
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_UID } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  useEffect(() => {
    if (isUserLoading) return;
    
    if (!isAdmin) {
      router.push('/');
      return;
    }

    if (!firestore) return;

    setLoading(true);

    // مراقبة كافة المستخدمين المسجلين في النظام
    const unsubTeachers = onSnapshot(collection(firestore, 'users'), (snap) => {
      const list = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setTeachers(list);
      setLoading(false);
    });

    // مراقبة كافة الطلاب عبر كافة حسابات المعلمين
    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => {
        const pathSegments = doc.ref.path.split('/');
        const teacherUid = pathSegments[1]; 
        return { id: doc.id, teacherUid, ...doc.data() };
      });
      setAllStudents(list);
    });

    // مراقبة الرسائل
    const unsubMessages = onSnapshot(query(collection(firestore, 'contactMessages'), orderBy('createdAt', 'desc')), (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });

    return () => {
      unsubTeachers();
      unsubStudents();
      unsubMessages();
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
    toast({ title: "تم النسخ", description: "تم نسخ المعرف للحافظة." });
  };

  const filteredTeachers = teachers.filter(t => 
    (t.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (t.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.uid?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                <PageHeaderDescription>أنت تطلع الآن على كافة البيانات المسجلة.</PageHeaderDescription>
             </div>
          </div>
        </PageHeader>
        <Button variant="outline" onClick={() => router.push('/')} className="rounded-xl h-12 font-bold px-6 border-primary/20 hover:bg-primary/5 transition-all">
            <ArrowLeft className="ms-2 h-5 w-5" />
            الرئيسية
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'المعلمون المسجلون', value: teachers.length, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/10' },
            { label: 'الرسائل الواردة', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'الحالة', value: 'نشط', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-14 bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger value="teachers" className="rounded-xl font-bold">قائمة المعلمين</TabsTrigger>
                <TabsTrigger value="students" className="rounded-xl font-bold">قائمة الطلاب</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl font-bold">الرسائل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="بحث بالاسم أو البريد..." className="pr-10 rounded-xl h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map((teacher) => (
                        <Card key={teacher.uid} className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 transition-all hover:shadow-2xl hover:-translate-y-1 border-b-4 border-primary/10">
                            <CardHeader className="bg-primary/5 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl">
                                            {teacher.displayName ? teacher.displayName[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <CardTitle className="text-lg font-black">{teacher.displayName || 'مستخدم جديد'}</CardTitle>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                {teacher.email}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => copyToClipboard(teacher.uid)}>
                                        <Copy className="h-4 w-4 text-primary"/>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="p-3 bg-muted/50 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold flex items-center gap-1">
                                            <Fingerprint className="h-3 w-3 text-primary" />
                                            المعرف UID:
                                        </span>
                                        <code className="text-[10px] font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border">
                                            {teacher.uid.substring(0, 16)}...
                                        </code>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-dashed pt-2 mt-2">
                                        <span className="text-xs font-bold flex items-center gap-1 text-emerald-600">
                                            <Users className="h-3 w-3" />
                                            الطلاب المسجلون:
                                        </span>
                                        <span className="font-black text-lg">
                                            {allStudents.filter(s => s.teacherUid === teacher.uid).length}
                                        </span>
                                    </div>
                                </div>
                                
                                <Button className="w-full rounded-2xl h-12 gap-2 font-bold shadow-sm" variant="outline" onClick={() => setSelectedTeacher(teacher)}>
                                    <ExternalLink className="h-4 w-4" />
                                    عرض سجل طلاب المعلم
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {filteredTeachers.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground font-bold bg-muted/20 rounded-[3rem] border-2 border-dashed">
                            لا توجد حسابات مطابقة لبحثك.
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="students">
                <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-primary/5">
                        <CardTitle>سجل الطلاب الشامل ({allStudents.length})</CardTitle>
                        <CardDescription>قائمة بجميع الطلاب المسجلين عبر كافة حسابات المعلمين.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="text-right font-bold">اسم الطالب</TableHead>
                                    <TableHead className="text-right font-bold">المرحلة / الصف</TableHead>
                                    <TableHead className="text-right font-bold">المعلم المسؤول</TableHead>
                                    <TableHead className="text-center font-bold">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allStudents.length > 0 ? allStudents.map(student => (
                                    <TableRow key={student.id} className="hover:bg-muted/10 transition-colors">
                                        <TableCell className="font-bold">{student.name}</TableCell>
                                        <TableCell>
                                            <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">
                                                {student.grade}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium">
                                            <div className="flex flex-col">
                                                <span>{teachers.find(t => t.uid === student.teacherUid)?.displayName || 'مستخدم غير معروف'}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{student.teacherUid.substring(0, 8)}...</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 rounded-xl">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-2xl font-black">حذف الطالب نهائياً؟</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-base">
                                                            أنت على وشك حذف الطالب <span className="font-bold text-rose-600">({student.name})</span> من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="gap-3">
                                                        <AlertDialogCancel className="rounded-2xl h-12 font-bold">إلغاء</AlertDialogCancel>
                                                        <AlertDialogAction className="rounded-2xl h-12 font-bold bg-rose-600 hover:bg-rose-700" onClick={() => handleDeleteStudent(student.id, student.teacherUid)}>تأكيد الحذف</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-bold">
                                            لا يوجد طلاب مسجلين في النظام حالياً.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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
                                    <div>
                                        <h4 className="font-black text-lg">{msg.name}</h4>
                                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold bg-muted px-3 py-1 rounded-full">
                                    {msg.createdAt ? format(msg.createdAt.toDate(), 'd MMM yyyy', { locale: ar }) : 'تاريخ غير متوفر'}
                                </span>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-2xl">
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

        {selectedTeacher && (
            <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
                <DialogContent className="max-w-3xl rounded-[3rem] p-10 border-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-primary text-white rounded-3xl shadow-lg shadow-primary/20">
                                <UserCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black">طلاب المعلم: {selectedTeacher.displayName || 'مستخدم جديد'}</DialogTitle>
                                <p className="text-xs text-muted-foreground font-mono mt-1 opacity-70">UID: {selectedTeacher.uid}</p>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="max-h-[60vh] overflow-auto mt-6 custom-scrollbar pr-2 pl-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allStudents.filter(s => s.teacherUid === selectedTeacher.uid).length > 0 ? (
                                allStudents.filter(s => s.teacherUid === selectedTeacher.uid).map(s => (
                                    <div key={s.id} className="p-5 bg-muted/30 rounded-3xl border border-primary/5 flex justify-between items-center group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex flex-col">
                                            <span className="font-black text-base">{s.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-bold bg-primary/10 px-2 py-0.5 rounded-full w-fit mt-1">{s.grade}</span>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-rose-50 hover:bg-rose-100">
                                                    <Trash2 className="h-5 w-5"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-[2.5rem]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>حذف الطالب؟</AlertDialogTitle>
                                                    <AlertDialogDescription>أنت على وشك حذف {s.name} بشكل نهائي.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-2xl h-11">إلغاء</AlertDialogCancel>
                                                    <AlertDialogAction className="rounded-2xl h-11 bg-rose-600" onClick={() => handleDeleteStudent(s.id, selectedTeacher.uid)}>تأكيد الحذف</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center text-muted-foreground font-bold bg-muted/20 rounded-[2rem] border-2 border-dashed">
                                    هذا المعلم لم يقم بإضافة أي طلاب إلى حسابه حتى الآن.
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
}
