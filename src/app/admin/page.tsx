
'use client';

import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, collectionGroup, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
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
  Mail,
  Ban,
  ShieldAlert,
  UserX,
  Fingerprint,
  Search,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_UID } from '@/lib/constants';
import Link from 'next/link';
import { useAllUsers } from '@/hooks/use-app-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualUid, setManualUid] = useState('');
  const [isProcessingManual, setIsProcessingManual] = useState(false);

  const { users, isLoading: usersLoading, toggleUserBlock } = useAllUsers();

  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

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

  const handleManualBlock = async (action: 'block' | 'unblock') => {
    if (!manualUid.trim() || !firestore) return;
    
    setIsProcessingManual(true);
    try {
      const userRef = doc(firestore, 'users', manualUid.trim());
      const userSnap = await getDoc(userRef);
      
      const status = action === 'block';
      
      await setDoc(userRef, { 
        isBlocked: status,
        updatedAt: new Date()
      }, { merge: true });

      toast({
        title: status ? "تم الحظر" : "تم إلغاء الحظر",
        description: `تم تحديث حالة المعرف ${manualUid} بنجاح.`,
      });
      setManualUid('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "تعذر تحديث حالة الحظر. تأكد من صحة الـ UID."
      });
    } finally {
      setIsProcessingManual(false);
    }
  };

  const uidsWithStudents = useMemo(() => {
    const uids = Array.from(new Set(allStudents.map(s => s.teacherUid)));
    return uids.map(uid => {
      const teacherInfo = users.find(u => u.uid === uid);
      return {
        uid,
        displayName: teacherInfo?.displayName || 'معلم غير مسمى',
        email: teacherInfo?.email || 'لا يوجد بريد',
        photoURL: teacherInfo?.photoURL,
        count: allStudents.filter(s => s.teacherUid === uid).length
      };
    });
  }, [allStudents, users]);

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
                <PageHeaderDescription>إدارة المستخدمين والطلاب والرسائل.</PageHeaderDescription>
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
            { label: 'إجمالي المستخدمين', value: users.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' },
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

       <Tabs defaultValue="users" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-14 bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger value="users" className="rounded-xl font-bold text-sm sm:text-base">المستخدمين والحظر</TabsTrigger>
                <TabsTrigger value="teacher-uids" className="rounded-xl font-bold text-sm sm:text-base">معرفات الطلاب</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-xl font-bold text-sm sm:text-base">الرسائل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
                <div className="space-y-8">
                  {/* قسم الحظر اليدوي */}
                  <Card className="border-0 shadow-lg rounded-[2rem] bg-slate-900 text-white overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Ban className="h-5 w-5 text-rose-500" />
                        حظر يدوي بواسطة المعرف (UID)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                          <Fingerprint className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                          <Input 
                            placeholder="أدخل الـ UID المراد حظره..." 
                            className="bg-slate-800 border-slate-700 h-12 pr-10 rounded-xl text-white placeholder:text-slate-500 focus-visible:ring-primary"
                            value={manualUid}
                            onChange={(e) => setManualUid(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            className="rounded-xl h-12 font-bold px-6 flex-grow sm:flex-grow-0"
                            onClick={() => handleManualBlock('block')}
                            disabled={isProcessingManual || !manualUid.trim()}
                          >
                            {isProcessingManual ? <Loader2 className="h-4 w-4 animate-spin" /> : "حظر الآن"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="rounded-xl h-12 font-bold px-6 border-slate-700 hover:bg-slate-800 text-white flex-grow sm:flex-grow-0"
                            onClick={() => handleManualBlock('unblock')}
                            disabled={isProcessingManual || !manualUid.trim()}
                          >
                            إلغاء الحظر
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">
                        * ملاحظة: يمكنك حظر أي UID حتى لو لم يكن مسجلاً في القائمة أدناه؛ سيتم منعه بمجرد محاولته دخول الموقع.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <div className="text-right px-4 flex justify-between items-end">
                      <div>
                        <h3 className="text-xl font-black">إدارة مستخدمي الموقع ({users.length})</h3>
                        <p className="text-sm text-muted-foreground">عرض كافة الحسابات المسجلة وإمكانية حظرها.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {usersLoading ? (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                          <span className="font-bold">جاري جلب المستخدمين...</span>
                        </div>
                      ) : users.length > 0 ? users.map((u) => (
                          <Card 
                            key={u.uid} 
                            className={`group border-0 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-xl ${u.isBlocked ? 'border-2 border-rose-500/50 grayscale opacity-75 shadow-rose-500/5' : ''}`}
                          >
                            <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
                              <div className="relative">
                                <Avatar className="h-20 w-20 border-4 border-primary/10">
                                  <AvatarImage src={u.photoURL} />
                                  <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                                    {u.displayName?.substring(0, 2).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                {u.isBlocked && (
                                  <div className="absolute -top-1 -right-1 bg-rose-500 text-white p-1 rounded-full border-2 border-white shadow-lg">
                                    <Ban className="h-4 w-4" />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-black text-lg">{u.displayName || 'مستخدم جديد'}</h4>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                <div className="bg-muted/50 p-2 rounded-lg mt-2 font-mono text-[10px] break-all border border-dashed text-primary/70 cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => {
                                  setManualUid(u.uid);
                                  toast({ title: "تم نسخ الـ UID", description: "يمكنك الآن تعديله في حقل الحظر اليدوي." });
                                }}>
                                  UID: {u.uid}
                                </div>
                              </div>

                              <div className="flex flex-col w-full gap-2 mt-4 pt-4 border-t border-dashed">
                                <Button 
                                  variant={u.isBlocked ? "outline" : "destructive"} 
                                  onClick={() => toggleUserBlock(u.id, !!u.isBlocked)}
                                  className="w-full rounded-xl font-bold gap-2 h-11 transition-all"
                                >
                                  {u.isBlocked ? (
                                    <>
                                      <UserCheck className="h-4 w-4" />
                                      إلغاء حظر المستخدم
                                    </>
                                  ) : (
                                    <>
                                      <ShieldAlert className="h-4 w-4" />
                                      حظر من الوصول
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                      )) : (
                        <div className="col-span-full py-20 text-center text-muted-foreground font-bold bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed">
                          لا يوجد مستخدمون مسجلون حالياً.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </TabsContent>

            <TabsContent value="teacher-uids">
                <div className="space-y-6">
                  <div className="text-right px-4">
                    <h3 className="text-xl font-black">معرفات المعلمين والطلاب ({uidsWithStudents.length})</h3>
                    <p className="text-sm text-muted-foreground">عرض المعرفات التي قامت بتسجيل طلاب وإدارة بياناتهم.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                       <div className="col-span-full py-20 flex flex-col items-center gap-4">
                         <Loader2 className="h-10 w-10 animate-spin text-primary" />
                         <span className="font-bold">جاري تحليل البيانات...</span>
                       </div>
                    ) : uidsWithStudents.length > 0 ? uidsWithStudents.map((teacher) => (
                        <Card 
                          key={teacher.uid} 
                          className="group border-0 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-xl"
                        >
                          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
                            <div className="p-4 bg-primary/5 rounded-3xl text-primary">
                                <Fingerprint className="h-10 w-10" />
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-black text-lg">{teacher.displayName}</h4>
                              <div className="bg-muted/50 p-2 rounded-lg mt-2 font-mono text-[10px] break-all border border-dashed text-primary/70">
                                {teacher.uid}
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-bold bg-primary/10 text-primary border-0">
                                  <Users className="h-4 w-4 ms-2" />
                                  {teacher.count} طالب مسجل
                                </Badge>
                            </div>

                            <div className="flex flex-col w-full gap-2 mt-4 pt-4 border-t border-dashed">
                              <Button asChild variant="default" className="w-full rounded-xl h-12 font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                <Link href={`/admin/teacher/${teacher.uid}`}>
                                  <Search className="h-4 w-4 ms-2" />
                                  إدارة طلاب هذا المعرف
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    )) : (
                      <div className="col-span-full py-20 text-center text-muted-foreground font-bold bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed">
                        لا توجد معرفات مسجلة لطلاب حالياً.
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
