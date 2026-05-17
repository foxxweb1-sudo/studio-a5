'use client';

import { useUser, useFirestore } from '@/firebase';
import { collection, getDocs, query, orderBy, collectionGroup, doc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState, useMemo, useCallback } from 'react';
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
  Mail, 
  LayoutDashboard, 
  TrendingUp, 
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Clock,
  UserCheck,
  Search,
  School,
  Trash2,
  AlertTriangle,
  Fingerprint,
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
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_UID } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

function StatsOverview({ totalStudents, totalMessages, totalTeachers }: { totalStudents: number, totalMessages: number, totalTeachers: number }) {
  const stats = [
    { label: 'إجمالي الطلاب', value: totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'المعلمون', value: totalTeachers, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'الرسائل الواردة', value: totalMessages, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'حالة النظام', value: 'نشط', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="border-0 shadow-sm hover-lift bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center lg:items-end gap-2">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-bold">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TeacherStudentsModal({ teacher, onClose, onDeleteStudent }: { teacher: any, onClose: () => void, onDeleteStudent: (sId: string, tId: string) => void }) {
    const firestore = useFirestore();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTeacherStudents = useCallback(async () => {
        if (!firestore || !teacher) return;
        setLoading(true);
        try {
            const studentsRef = collection(firestore, `users/${teacher.uid}/students`);
            const snapshot = await getDocs(studentsRef);
            const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(studentsData);
        } catch (error) {
            console.error("Error fetching teacher students:", error);
        } finally {
            setLoading(false);
        }
    }, [firestore, teacher]);

    useEffect(() => {
        fetchTeacherStudents();
    }, [fetchTeacherStudents]);

    return (
        <Dialog open={!!teacher} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col rounded-[2rem]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <School className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle>طلاب المعلم: {teacher?.displayName || 'بدون اسم'}</DialogTitle>
                            <DialogDescription>عرض وإدارة قائمة الطلاب المسجلين بواسطة هذا المعلم.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="flex-grow overflow-auto mt-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : students.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">اسم الطالب</TableHead>
                                    <TableHead className="text-right">الصف</TableHead>
                                    <TableHead className="text-center">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-bold">{student.name}</TableCell>
                                        <TableCell>
                                            <span className="bg-muted px-2 py-1 rounded text-xs">{student.grade}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                                    <Link href={`/students/${student.id}`}>
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2rem]">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>حذف الطالب؟</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                هل أنت متأكد من حذف الطالب ({student.name})؟ سيتم إزالة كافة بياناته نهائياً.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                className="rounded-xl bg-rose-600 hover:bg-rose-700"
                                                                onClick={() => {
                                                                    onDeleteStudent(student.id, teacher.uid);
                                                                    setStudents(prev => prev.filter(s => s.id !== student.id));
                                                                }}
                                                            >
                                                                تأكيد الحذف
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            لم يقم هذا المعلم بإضافة أي طلاب بعد.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function TeachersList({ onDeleteStudent }: { onDeleteStudent: (sId: string, tId: string) => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

    useEffect(() => {
        const fetchTeachers = async () => {
            if (!firestore) return;
            setLoading(true);
            try {
                const snapshot = await getDocs(collection(firestore, 'users'));
                const teachersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
                
                // ترتيب في المتصفح
                teachersData.sort((a, b) => (a.displayName || 'مجهول').localeCompare(b.displayName || 'مجهول', 'ar'));
                
                setTeachers(teachersData);
            } catch (error) {
                console.error("Error fetching teachers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, [firestore]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "تم النسخ",
            description: "تم نسخ UID إلى الحافظة.",
        });
    };

    const filteredTeachers = teachers.filter(t => 
        (t.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (t.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.uid?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="flex justify-center h-48 items-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="bg-muted/30">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <CardTitle>قائمة الحسابات المسجلة</CardTitle>
                        <CardDescription>إدارة جميع المعلمين والوصول إلى بياناتهم ومعرفاتهم التقنية.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="بحث بالاسم أو UID..." 
                            className="pr-10 rounded-xl bg-white" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[60vh] overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="text-right">المعلم</TableHead>
                                <TableHead className="text-right">UID (معرف المستخدم)</TableHead>
                                <TableHead className="text-center">الطلاب</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTeachers.length > 0 ? (
                                filteredTeachers.map(teacher => (
                                    <TableRow key={teacher.uid} className="hover:bg-muted/20">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{teacher.displayName || 'بدون اسم'}</span>
                                                <span className="text-[10px] text-muted-foreground">{teacher.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 group">
                                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-2 border">
                                                    <Fingerprint className="h-3 w-3 text-primary" />
                                                    <code className="text-[10px] font-mono tracking-tighter text-emerald-600 dark:text-emerald-400">
                                                        {teacher.uid}
                                                    </code>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => copyToClipboard(teacher.uid)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="rounded-xl hover:bg-primary/10 hover:text-primary gap-1 border-primary/20 text-xs font-bold"
                                                onClick={() => setSelectedTeacher(teacher)}
                                            >
                                                إدارة الطلاب
                                                <ChevronRight className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-48 text-center text-muted-foreground">
                                        لم يتم العثور على أي حسابات.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            {selectedTeacher && <TeacherStudentsModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} onDeleteStudent={onDeleteStudent} />}
        </Card>
    );
}

function AllStudentsList({ onDeleteStudent }: { onDeleteStudent: (sId: string, tId: string) => void }) {
  const firestore = useFirestore();
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const teachersSnapshot = await getDocs(collection(firestore!, 'users'));
        const tMap: Record<string, string> = {};
        teachersSnapshot.forEach(doc => {
            tMap[doc.id] = doc.data().displayName || doc.data().email || 'مجهول';
        });

        const studentsQuery = query(collectionGroup(firestore!, 'students'));
        const studentsSnapshot = await getDocs(studentsQuery);
        
        const studentsData = studentsSnapshot.docs.map(studentDoc => {
          const pathSegments = studentDoc.ref.path.split('/');
          const teacherUid = pathSegments[1];
          const data = studentDoc.data();
          
          return {
            id: studentDoc.id,
            ...data,
            teacherUid,
            ownerName: tMap[teacherUid] || `معلم (${teacherUid.substring(0,5)})`,
          };
        });

        studentsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setAllStudents(studentsData);
      } catch (error) {
        console.error('Error fetching all students:', error);
      } finally {
        setLoading(false);
      }
    };

    if(firestore) {
      fetchAllData();
    }
  }, [firestore]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>سجل الطلاب الكامل</CardTitle>
                <CardDescription>عرض جميع الطلاب المسجلين عبر كافة الحسابات مع إمكانية الحذف.</CardDescription>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl font-bold text-sm">
                {allStudents.length} طالب
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="text-right">اسم الطالب</TableHead>
                <TableHead className="text-right">الصف</TableHead>
                <TableHead className="text-right">المعلم المسؤول</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStudents.length > 0 ? (
                allStudents.map(student => (
                  <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold">{student.name}</TableCell>
                    <TableCell>
                        <span className="bg-muted px-3 py-1 rounded-lg text-xs font-medium">{student.grade}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">{student.ownerName}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button asChild variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary h-8 w-8 p-0">
                            <Link href={`/students/${student.id}`}>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem]">
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3 text-rose-600 mb-2">
                                        <AlertTriangle className="h-6 w-6" />
                                        <AlertDialogTitle>حذف نهائي للبيانات</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription>
                                        أنت على وشك حذف الطالب ({student.name}) المسجل بواسطة ({student.ownerName}). هذا الإجراء سيحذف كافة سجلات الحضور والمدفوعات الخاصة به ولا يمكن التراجع عنه.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">تراجع</AlertDialogCancel>
                                    <AlertDialogAction 
                                        className="rounded-xl bg-rose-600 hover:bg-rose-700"
                                        onClick={() => {
                                            onDeleteStudent(student.id, student.teacherUid);
                                            setAllStudents(prev => prev.filter(s => s.id !== student.id));
                                        }}
                                    >
                                        نعم، حذف الطالب
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 opacity-20" />
                        لم يتم العثور على طلاب مسجلين.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactMessagesList() {
    const firestore = useFirestore();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const messagesQuery = query(collection(firestore!, 'contactMessages'), orderBy('createdAt', 'desc'));
                const messagesSnapshot = await getDocs(messagesQuery);
                const messagesData = messagesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesData);
            } catch (error) {
                console.error("Error fetching contact messages:", error);
            } finally {
                setLoading(false);
            }
        };

        if(firestore) {
            fetchMessages();
        }

    }, [firestore]);
    
    if (loading) {
        return (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.length > 0 ? (
                messages.map(msg => (
                    <Card key={msg.id} className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 group hover:shadow-primary/5 transition-all">
                        <CardHeader className="bg-primary/5 group-hover:bg-primary/10 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-black">{msg.name}</CardTitle>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {msg.email}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="bg-white/50 dark:bg-slate-800 px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold">
                                        <Clock className="h-3 w-3" />
                                        {msg.createdAt ? format(msg.createdAt.toDate(), 'd MMM, hh:mm a', { locale: ar }) : ''}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                                {msg.message}
                            </p>
                        </CardContent>
                    </Card>
                ))
            ) : (
                 <Card className="col-span-full border-dashed border-2 bg-transparent h-48 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>لا توجد رسائل واردة حالياً.</p>
                    </div>
                 </Card>
            )}
        </div>
    )
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [totalMessagesCount, setTotalMessagesCount] = useState(0);
  const [totalTeachersCount, setTotalTeachersCount] = useState(0);

  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  const handleDeleteStudent = async (studentId: string, teacherUid: string) => {
    if (!firestore || !isAdmin) return;
    try {
        await deleteDoc(doc(firestore, `users/${teacherUid}/students`, studentId));
        setTotalStudentsCount(prev => prev - 1);
        toast({
            title: "تم الحذف",
            description: "تم حذف الطالب بنجاح من قاعدة البيانات.",
        });
    } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "خطأ في الحذف",
            description: "فشل حذف الطالب. يرجى المحاولة مرة أخرى.",
        });
    }
  };

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, isUserLoading, isAdmin, router]);

  useEffect(() => {
      const fetchTotals = async () => {
          if (!firestore || !isAdmin) return;
          try {
              const studentsSnapshot = await getDocs(collectionGroup(firestore, 'students'));
              setTotalStudentsCount(studentsSnapshot.size);

              const teachersSnapshot = await getDocs(collection(firestore, 'users'));
              setTotalTeachersCount(teachersSnapshot.size);

              const mSnap = await getDocs(collection(firestore, 'contactMessages'));
              setTotalMessagesCount(mSnap.size);
          } catch (e) {
              console.error(e);
          }
      }
      fetchTotals();
  }, [firestore, isAdmin]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-white gap-6">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
        </div>
        <p className="font-bold text-lg animate-pulse">جاري التحقق من صلاحيات المشرف...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                <LayoutDashboard className="h-6 w-6" />
             </div>
             <div>
                <PageHeaderTitle className="text-3xl font-black">لوحة التحكم</PageHeaderTitle>
                <PageHeaderDescription>إدارة النظام الشاملة والاطلاع على كافة البيانات.</PageHeaderDescription>
             </div>
          </div>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          className="rounded-2xl border-primary/20 hover:bg-primary/5 transition-all px-6 h-12 font-bold"
        >
          <ArrowLeft className="ms-2 h-5 w-5" />
          رجوع للرئيسية
        </Button>
      </div>

      <StatsOverview 
        totalStudents={totalStudentsCount} 
        totalMessages={totalMessagesCount} 
        totalTeachers={totalTeachersCount}
      />

       <Tabs defaultValue="teachers" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-14 bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger value="teachers" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">
                    <UserCheck className="ms-2 h-4 w-4" />
                    المعلمون
                </TabsTrigger>
                <TabsTrigger value="students" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">
                    <Users className="ms-2 h-4 w-4" />
                    كل الطلاب
                </TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">
                    <Mail className="ms-2 h-4 w-4" />
                    الرسائل
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers" className="mt-0 focus-visible:outline-none">
                <TeachersList onDeleteStudent={handleDeleteStudent} />
            </TabsContent>

            <TabsContent value="students" className="mt-0 focus-visible:outline-none">
                <AllStudentsList onDeleteStudent={handleDeleteStudent} />
            </TabsContent>
            
            <TabsContent value="messages" className="mt-0 focus-visible:outline-none">
                <ContactMessagesList />
            </TabsContent>
        </Tabs>

        <Card className="border-0 bg-slate-900 text-white rounded-[2.5rem] p-8 mt-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black">حماية المشرف نشطة</h4>
                        <p className="text-sm text-slate-400">أنت تتصفح النظام بصلاحيات الإدارة الكاملة. يتم تسجيل كافة العمليات للأمان.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-left md:text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">إصدار النظام</div>
                        <div className="text-lg font-mono font-bold text-primary">v3.77.0</div>
                    </div>
                </div>
            </div>
        </Card>
    </div>
  );
}
