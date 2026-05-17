
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, collectionGroup, onSnapshot, doc, setDoc } from 'firebase/firestore';
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
  UserCircle,
  Fingerprint,
  Settings,
  Database,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  CalendarClock,
  GraduationCap,
  MessageSquareQuote
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_EMAIL } from '@/lib/constants';
import Link from 'next/link';
import { useAllUsers } from '@/hooks/use-app-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';
import { DeletionRequest } from '@/lib/definitions';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  reviewed: { label: 'تمت المراجعة', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info },
  replied: { label: 'تم الرد', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'مرفوض', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [manualUid, setManualUid] = useState('');
  const [isProcessingManual, setIsProcessingManual] = useState(false);

  const { users, isLoading: usersLoading, toggleUserBlock } = useAllUsers();

  // جلب طلبات الحذف من المجموعة المستقلة
  const deletionRequestsQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'deletionRequests') : null,
  [firestore]);
  const { data: deletionRequests, isLoading: deletionLoading } = useCollection<DeletionRequest>(deletionRequestsQuery);

  const isAdmin = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }
    if (!firestore) return;

    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => {
        const pathSegments = doc.ref.path.split('/');
        const teacherUid = pathSegments[1]; 
        return { id: doc.id, teacherUid, ...doc.data() };
      });
      setAllStudents(list);
      setLoadingStudents(false);
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
      const status = action === 'block';
      await setDoc(userRef, { isBlocked: status, updatedAt: new Date() }, { merge: true });
      toast({ title: status ? "تم الحظر" : "تم إلغاء الحظر" });
      setManualUid('');
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في المعرف" });
    } finally {
      setIsProcessingManual(false);
    }
  };

  const calculateRemainingTime = (requestedAt: any) => {
    if (!requestedAt) return "غير معروف";
    try {
        const date = requestedAt.toDate ? requestedAt.toDate() : new Date(requestedAt);
        const executionDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diff = executionDate.getTime() - now.getTime();
        if (diff <= 0) return "بانتظار التنفيذ";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days} يوم و ${hours} ساعة`;
    } catch (e) {
        return "جاري المعالجة...";
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
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="font-bold text-slate-400">تحميل البيانات...</p>
      </div>
    );
  }

  const activeDeletionCount = deletionRequests?.length || 0;

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">لوحة التحكم العليا</PageHeaderTitle>
          <PageHeaderDescription>إدارة المستخدمين والأنظمة المركزية</PageHeaderDescription>
        </PageHeader>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/settings')} className="rounded-xl font-bold gap-2">
              <Settings className="h-4 w-4" />
              إعدادات الهوية
          </Button>
          <Button onClick={() => router.push('/')} className="rounded-xl font-bold gap-2">
              <ArrowLeft className="h-4 w-4" />
              الرئيسية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', loading: loadingStudents },
            { label: 'المستخدمين', value: users.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-50', loading: usersLoading },
            { label: 'الرسائل', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50', loading: false },
            { label: 'طلبات الحذف', value: activeDeletionCount, icon: Trash2, color: 'text-rose-500', bg: 'bg-rose-50', loading: deletionLoading },
        ].map((stat, i) => (
            <Card key={i} className={`border-0 shadow-sm hover-lift`}>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        {stat.loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <stat.icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400">{stat.label}</div>
                      <div className="text-xl font-black">{stat.loading ? '...' : stat.value}</div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

       <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-xl mb-6 w-full flex overflow-x-auto justify-start h-auto">
                <TabsTrigger value="users" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">المستخدمين</TabsTrigger>
                <TabsTrigger value="deletions" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial relative">
                    طلبات الحذف
                    {activeDeletionCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] text-white">
                        {activeDeletionCount}
                      </span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="teacher-uids" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">المعرفات</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">الرسائل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
                <div className="space-y-6">
                  <Card className="border-2 border-rose-500/10 shadow-none rounded-3xl overflow-hidden bg-rose-500/5">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="space-y-2 flex-grow w-full">
                          <label className="text-xs font-bold text-rose-500 px-1 flex items-center gap-2">
                            <Fingerprint className="h-4 w-4" />
                            حظر/فك حظر يدوي بواسطة UID
                          </label>
                          <Input 
                            placeholder="أدخل المعرف (UID) هنا..." 
                            className="h-12 bg-white rounded-xl border-rose-100"
                            value={manualUid}
                            onChange={(e) => setManualUid(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2 w-full lg:w-auto">
                          <Button variant="destructive" className="rounded-xl h-12 font-bold px-8 flex-grow" onClick={() => handleManualBlock('block')} disabled={isProcessingManual || !manualUid.trim()}>
                            {isProcessingManual ? <Loader2 className="h-4 w-4 animate-spin" /> : "حظر المعرف"}
                          </Button>
                          <Button variant="outline" className="rounded-xl h-12 font-bold px-8 bg-white flex-grow" onClick={() => handleManualBlock('unblock')} disabled={isProcessingManual || !manualUid.trim()}>
                            فك الحظر
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {usersLoading ? (
                      <div className="col-span-full py-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : users.map((u) => (
                        <Card key={u.uid} className={`border-0 shadow-sm ${u.isBlocked ? 'bg-rose-50' : 'bg-white'}`}>
                          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={u.photoURL} />
                              <AvatarFallback>{u.displayName?.substring(0, 2) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-sm">{u.displayName || 'مستخدم'}</h4>
                              <p className="text-[10px] text-muted-foreground font-mono truncate w-[140px]">{u.email}</p>
                            </div>
                            <Button variant={u.isBlocked ? "secondary" : "ghost"} onClick={() => toggleUserBlock(u.uid, !!u.isBlocked)} className={`w-full rounded-xl font-bold h-9 text-xs ${u.isBlocked ? 'text-emerald-600' : 'text-rose-600 hover:bg-rose-50'}`}>
                              {u.isBlocked ? "إلغاء الحظر" : "حظر الحساب"}
                            </Button>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                </div>
            </TabsContent>

            <TabsContent value="deletions">
                <div className="space-y-4">
                  {deletionRequests && deletionRequests.length > 0 ? (
                    deletionRequests.map((req) => (
                      <div key={req.uid} className="flex flex-col gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-rose-100 hover:shadow-md transition-all border-r-8 border-r-rose-500">
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            <div className="flex items-center gap-4 flex-1 w-full">
                                <Avatar className="h-14 w-14 border-2 border-rose-50">
                                    <AvatarImage src={req.photoURL} />
                                    <AvatarFallback className="bg-rose-50 text-rose-500 font-bold">{req.displayName?.substring(0, 1)}</AvatarFallback>
                                </Avatar>
                                <div className="text-right overflow-hidden">
                                    <h4 className="font-black text-base text-slate-800 truncate">{req.displayName}</h4>
                                    <div className="flex items-center gap-2 mt-0.5 justify-end">
                                        <Fingerprint className="h-3 w-3 text-slate-400" />
                                        <code className="text-[10px] font-mono text-slate-500 tracking-tighter truncate">{req.uid}</code>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-2">
                                <div className="bg-rose-50/80 px-4 py-2 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                                        <CalendarClock className="h-4 w-4" />
                                        <span>الوقت المتبقي:</span>
                                    </div>
                                    <span className="font-black text-rose-700 text-xs">{calculateRemainingTime(req.requestedAt)}</span>
                                </div>
                                <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                                        <GraduationCap className="h-4 w-4" />
                                        <span>عدد الطلاب:</span>
                                    </div>
                                    <span className="font-black text-blue-700 text-xs">{req.studentCount} طالب</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 pt-3 border-t border-dashed border-rose-100 flex items-start gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                                <MessageSquareQuote className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">سبب الحذف المصرح به:</span>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{req.reason || 'لم يتم ذكر سبب محدد'}"</p>
                            </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[2rem] border border-dashed">
                      {deletionLoading ? <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary/20" /> : <Trash2 className="h-16 w-16 mx-auto text-slate-200" />}
                      <p className="text-slate-400 font-black">{deletionLoading ? 'جاري جلب الطلبات...' : 'لا توجد طلبات حذف حالياً'}</p>
                    </div>
                  )}
                </div>
            </TabsContent>

            <TabsContent value="teacher-uids">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {uidsWithStudents.map((teacher) => (
                        <Card key={teacher.uid} className="border-0 shadow-sm p-6 text-center flex flex-col items-center gap-4 bg-white">
                             <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                <Database className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm">{teacher.displayName}</h4>
                              <p className="text-[10px] text-muted-foreground truncate w-[140px]">{teacher.email}</p>
                            </div>
                            <Badge variant="secondary" className="rounded-full px-4 font-bold">
                                {teacher.count} طلاب
                            </Badge>
                            <Button asChild className="w-full rounded-xl h-9 font-bold text-xs mt-2">
                                <Link href={`/admin/teacher/${teacher.uid}`}>إدارة السجلات</Link>
                            </Button>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="messages">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {messages.map(msg => {
                        const status = msg.status || 'pending';
                        const statusInfo = STATUS_MAP[status] || STATUS_MAP.pending;
                        return (
                          <Card key={msg.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group rounded-[1.5rem] overflow-hidden flex flex-col h-full border-t-4 border-t-primary/10" onClick={() => router.push(`/admin/messages/${msg.id}`)}>
                            <CardContent className="p-6 flex flex-col h-full gap-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                      <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div className="overflow-hidden text-right">
                                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{msg.name}</h4>
                                      <Badge variant="outline" className={`${statusInfo.color} text-[8px] h-4 rounded-md border-transparent`}>
                                        {statusInfo.label}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-grow bg-slate-50 p-4 rounded-2xl text-slate-600 text-xs italic leading-relaxed line-clamp-3 text-right">
                                  "{msg.message}"
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold">
                                    <Clock className="h-3 w-3" />
                                    {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleDateString('ar-EG') : '...'}
                                  </div>
                                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    عرض التفاصيل
                                    <ChevronRight className="h-3 w-3" />
                                  </span>
                                </div>
                            </CardContent>
                          </Card>
                        )
                    })}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
