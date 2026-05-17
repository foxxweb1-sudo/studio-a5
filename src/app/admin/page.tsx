
'use client';

import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, collectionGroup, onSnapshot } from 'firebase/firestore';
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
  UserCircle,
  ExternalLink,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_UID } from '@/lib/constants';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  // تجميع الطلاب حسب المعلم (UID)
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

  const teacherUids = useMemo(() => Object.keys(groupedStudents), [groupedStudents]);

  useEffect(() => {
    if (isUserLoading) return;
    
    if (!isAdmin) {
      router.push('/');
      return;
    }

    if (!firestore) return;

    setLoading(true);

    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => {
        const pathSegments = doc.ref.path.split('/');
        const teacherUid = pathSegments[1]; 
        return { id: doc.id, teacherUid, ...doc.data() };
      });
      setAllStudents(list);
      setLoading(false);
    });

    const unsubMessages = onSnapshot(query(collection(firestore, 'contactMessages'), orderBy('createdAt', 'desc')), (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });

    return () => {
      unsubStudents();
      unsubMessages();
    };
  }, [firestore, isAdmin, isUserLoading, router]);

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
            { label: 'إجمالي الحسابات', value: teacherUids.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' },
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
                <TabsTrigger value="teachers" className="rounded-xl font-bold">المعرفات UID</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl font-bold">رسائل التواصل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers">
                <div className="space-y-6">
                  <div className="text-right px-4">
                    <h3 className="text-xl font-black">المعرفات المسجلة ({teacherUids.length})</h3>
                    <p className="text-sm text-muted-foreground">اضغط على أي معرف لعرض الطلاب المسجلين به في صفحة مستقلة.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherUids.length > 0 ? teacherUids.map((teacherUid) => {
                      const students = groupedStudents[teacherUid] || [];

                      return (
                        <Card 
                          key={teacherUid} 
                          className="group border-0 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
                            <div className="p-4 bg-primary/10 text-primary rounded-3xl group-hover:bg-primary group-hover:text-white transition-colors">
                              <UserCircle className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-bold text-xs font-mono break-all opacity-70">
                                UID: {teacherUid.substring(0, 12)}...
                              </h4>
                              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary text-xs font-black px-4 py-2 rounded-full border border-primary/20">
                                <Users className="h-3 w-3" />
                                {students.length} طالب
                              </div>
                            </div>
                            <Button asChild variant="ghost" className="w-full rounded-xl gap-2 text-primary font-bold">
                              <Link href={`/admin/teacher/${teacherUid}`}>
                                عرض الطلاب
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    }) : (
                      <div className="col-span-full py-20 text-center text-muted-foreground font-bold bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed">
                        لا توجد حسابات مسجلة لديها طلاب حالياً.
                      </div>
                    )}
                  </div>
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
