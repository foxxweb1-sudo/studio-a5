
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

    // مراقبة فورية لقائمة المعلمين (المستخدمين) من Firestore
    const unsubTeachers = onSnapshot(collection(firestore, 'users'), (snap) => {
      const list = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setTeachers(list);
      setLoading(false);
    }, (error) => {
        console.error("Teachers listener error:", error);
        setLoading(false);
    });

    // مراقبة فورية لكافة الطلاب عبر المجموعات
    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => {
        const pathSegments = doc.ref.path.split('/');
        // المسار عادة يكون users/{userId}/students/{studentId}
        const teacherUid = pathSegments[1]; 
        return { id: doc.id, teacherUid, ...doc.data() };
      });
      setAllStudents(list);
    });

    // مراقبة فورية للرسائل
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
    toast({ title: "تم النسخ", description: "تم نسخ UID للحافظة." });
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
        <p className="font-bold">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
                <LayoutDashboard className="h-6 w-6" />
             </div>
             <div>
                <PageHeaderTitle className="text-3xl font-black">لوحة التحكم</PageHeaderTitle>
                <PageHeaderDescription>إدارة {teachers.length} حساب مسجل و {allStudents.length} طالب.</PageHeaderDescription>
             </div>
          </div>
        </PageHeader>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/')} className="rounded-xl h-12 font-bold">
                <ArrowLeft className="ms-2 h-5 w-5" />
                رجوع
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'المعلمون', value: teachers.length, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'الرسائل', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'حالة النظام', value: 'نشط', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
                <TabsTrigger value="teachers" className="rounded-xl font-bold">المعلمون</TabsTrigger>
                <TabsTrigger value="students" className="rounded-xl font-bold">كل الطلاب</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl font-bold">الرسائل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers">
                <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-muted/30">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <CardTitle>الحسابات المسجلة ({teachers.length})</CardTitle>
                                <CardDescription>يتم عرض كافة المستخدمين الذين قاموا بتسجيل الدخول للتطبيق.</CardDescription>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="بحث بالاسم أو UID..." className="pr-10 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="text-right">المعلم</TableHead>
                                    <TableHead className="text-right">معرف UID</TableHead>
                                    <TableHead className="text-center">الطلاب</TableHead>
                                    <TableHead className="text-center">إجراء</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.length > 0 ? filteredTeachers.map(t => (
                                    <TableRow key={t.uid}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{t.displayName || 'مستخدم جديد'}</span>
                                                <span className="text-[10px] text-muted-foreground">{t.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 group">
                                                <code className="text-[10px] bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border font-mono">{t.uid}</code>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(t.uid)}><Copy className="h-3 w-3"/></Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                                {allStudents.filter(s => s.teacherUid === t.uid).length} طالب
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setSelectedTeacher(t)}>عرض الطلاب</Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            {loading ? 'جاري التحميل...' : 'لا توجد حسابات مسجلة حالياً في Firestore.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="students">
                <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-muted/30">
                        <CardTitle>كل الطلاب في النظام ({allStudents.length})</CardTitle>
                        <CardDescription>عرض وحذف الطلاب من أي حساب للمعلمين.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">اسم الطالب</TableHead>
                                    <TableHead className="text-right">الصف</TableHead>
                                    <TableHead className="text-right">المعلم</TableHead>
                                    <TableHead className="text-center">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allStudents.length > 0 ? allStudents.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-bold">{student.name}</TableCell>
                                        <TableCell><span className="text-xs bg-muted p-1 rounded">{student.grade}</span></TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {teachers.find(t => t.uid === student.teacherUid)?.displayName || student.teacherUid || 'غير معروف'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-rose-500"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-[2rem]">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>حذف الطالب نهائياً؟</AlertDialogTitle>
                                                        <AlertDialogDescription>سيتم حذف بيانات الطالب {student.name} من حساب المعلم.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                                                        <AlertDialogAction className="rounded-xl bg-rose-600" onClick={() => handleDeleteStudent(student.id, student.teacherUid)}>حذف</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            لا يوجد طلاب مسجلين في النظام.
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
                            <p className="text-sm text-slate-600">{msg.message}</p>
                        </Card>
                    )) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            لا توجد رسائل واردة.
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>

        {selectedTeacher && (
            <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
                <DialogContent className="max-w-3xl rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle>طلاب المعلم: {selectedTeacher.displayName || selectedTeacher.uid}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-auto mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">الاسم</TableHead>
                                    <TableHead className="text-right">الصف</TableHead>
                                    <TableHead className="text-center">حذف</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allStudents.filter(s => s.teacherUid === selectedTeacher.uid).length > 0 ? (
                                    allStudents.filter(s => s.teacherUid === selectedTeacher.uid).map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.name}</TableCell>
                                            <TableCell>{s.grade}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(s.id, selectedTeacher.uid)} className="text-rose-500"><Trash2 className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            هذا المعلم لم يقم بإضافة طلاب بعد.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
}
