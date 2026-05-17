
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
  LayoutDashboard, 
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Search,
  Trash2,
  Copy,
  ExternalLink
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

    // مراقبة كافة المستخدمين (المعلمين)
    const unsubTeachers = onSnapshot(collection(firestore, 'users'), (snap) => {
      const list = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setTeachers(list);
      setLoading(false);
    });

    // مراقبة كافة الطلاب في النظام عبر collectionGroup
    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => {
        const pathSegments = doc.ref.path.split('/');
        // المسار: users/{userId}/students/{studentId}
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
                <PageHeaderDescription>أنت تطلع الآن على كافة البيانات في قاعدة البيانات.</PageHeaderDescription>
             </div>
          </div>
        </PageHeader>
        <Button variant="outline" onClick={() => router.push('/')} className="rounded-xl h-12 font-bold">
            <ArrowLeft className="ms-2 h-5 w-5" />
            الرئيسية
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'إجمالي المعلمين', value: teachers.length, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'الرسائل الواردة', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'اتصال السيرفر', value: 'مستقر', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
                <TabsTrigger value="teachers" className="rounded-xl font-bold">المعلمون (UID)</TabsTrigger>
                <TabsTrigger value="students" className="rounded-xl font-bold">كافة الطلاب</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl font-bold">الرسائل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-full flex justify-between items-center mb-2">
                         <div className="relative w-full max-w-md">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="بحث بالاسم أو الـ UID..." className="pr-10 rounded-xl h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>
                    
                    {filteredTeachers.map((teacher) => (
                        <Card key={teacher.uid} className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 hover-lift">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-lg">{teacher.displayName || 'معلم جديد'}</CardTitle>
                                        <CardDescription className="text-[10px]">{teacher.email}</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(teacher.uid)}><Copy className="h-4 w-4 text-primary"/></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <span className="text-xs font-bold">المعرف الرقمي:</span>
                                    <code className="text-[10px] font-mono text-primary">{teacher.uid.substring(0, 12)}...</code>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                    <span className="text-xs font-bold">عدد الطلاب:</span>
                                    <span className="bg-emerald-500 text-white px-3 py-0.5 rounded-full text-[10px] font-black">
                                        {allStudents.filter(s => s.teacherUid === teacher.uid).length}
                                    </span>
                                </div>
                                <Button className="w-full rounded-xl gap-2 font-bold" variant="outline" onClick={() => setSelectedTeacher(teacher)}>
                                    <ExternalLink className="h-4 w-4" />
                                    عرض طلاب هذا الحساب
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {filteredTeachers.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground font-bold">
                            لا توجد حسابات مطابقة للبحث.
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="students">
                <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-muted/30">
                        <CardTitle>قائمة الطلاب الشاملة ({allStudents.length})</CardTitle>
                        <CardDescription>هذه القائمة تضم جميع الطلاب من كافة حسابات المعلمين.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">الطالب</TableHead>
                                    <TableHead className="text-right">الصف</TableHead>
                                    <TableHead className="text-right">المعلم المسؤول</TableHead>
                                    <TableHead className="text-center">إجراء</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allStudents.length > 0 ? allStudents.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-bold">{student.name}</TableCell>
                                        <TableCell><span className="text-[10px] bg-muted px-2 py-0.5 rounded-lg">{student.grade}</span></TableCell>
                                        <TableCell className="text-[10px] text-muted-foreground">
                                            {teachers.find(t => t.uid === student.teacherUid)?.displayName || 'جاري التحميل...'}
                                            <br />
                                            <span className="text-[8px] opacity-50 font-mono">{student.teacherUid}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-[2rem]">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>حذف الطالب من النظام؟</AlertDialogTitle>
                                                        <AlertDialogDescription>أنت على وشك حذف الطالب {student.name} نهائياً من حساب المعلم وقاعدة البيانات.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                                                        <AlertDialogAction className="rounded-xl bg-rose-600" onClick={() => handleDeleteStudent(student.id, student.teacherUid)}>تأكيد الحذف</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            لا يوجد طلاب مسجلين حالياً.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="messages">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {messages.length > 0 ? messages.map(msg => (
                        <Card key={msg.id} className="border-0 shadow-sm rounded-3xl bg-white dark:bg-slate-900 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold">{msg.name}</h4>
                                    <p className="text-xs text-muted-foreground">{msg.email}</p>
                                </div>
                                <span className="text-[10px] bg-muted p-1 rounded">{msg.createdAt ? format(msg.createdAt.toDate(), 'd MMM', { locale: ar }) : ''}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{msg.message}</p>
                        </Card>
                    )) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            لا توجد رسائل واردة حالياً.
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>

        {selectedTeacher && (
            <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-8 border-0 shadow-2xl overflow-hidden">
                    <DialogHeader>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary text-white rounded-2xl">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black">طلاب المعلم: {selectedTeacher.displayName || 'مستخدم'}</DialogTitle>
                                <p className="text-xs text-muted-foreground font-mono">UID: {selectedTeacher.uid}</p>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="max-h-[60vh] overflow-auto mt-6 custom-scrollbar pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allStudents.filter(s => s.teacherUid === selectedTeacher.uid).length > 0 ? (
                                allStudents.filter(s => s.teacherUid === selectedTeacher.uid).map(s => (
                                    <div key={s.id} className="p-4 bg-muted/30 rounded-2xl border border-primary/5 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{s.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{s.grade}</span>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-[2rem]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>حذف الطالب؟</AlertDialogTitle>
                                                    <AlertDialogDescription>سيتم حذف {s.name} من حساب هذا المعلم.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">تراجع</AlertDialogCancel>
                                                    <AlertDialogAction className="rounded-xl bg-rose-600" onClick={() => handleDeleteStudent(s.id, selectedTeacher.uid)}>حذف</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 text-center text-muted-foreground font-bold">
                                    هذا المعلم لم يقم بإضافة أي طلاب بعد.
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
