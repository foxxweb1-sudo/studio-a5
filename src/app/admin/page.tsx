
'use client';

import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, collectionGroup, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  Fingerprint,
  Settings,
  RefreshCw,
  Database,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Info
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
import { useAppConfig } from '@/hooks/use-app-config';

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
  const { updateConfig } = useAppConfig();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualUid, setManualUid] = useState('');
  const [isProcessingManual, setIsProcessingManual] = useState(false);
  const [isUpdatingRules, setIsUpdatingRules] = useState(false);

  const { users, isLoading: usersLoading, toggleUserBlock } = useAllUsers();

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

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
      const status = action === 'block';
      
      await setDoc(userRef, { 
        isBlocked: status,
        updatedAt: new Date()
      }, { merge: true });

      toast({
        title: status ? "تم الحظر" : "تم إلغاء الحظر",
        description: `تم تحديث حالة المعرف بنجاح.`,
      });
      setManualUid('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "تأكد من صحة الـ UID."
      });
    } finally {
      setIsProcessingManual(false);
    }
  };

  const handleUpdateRules = async () => {
    setIsUpdatingRules(true);
    try {
      await updateConfig({
        lastRulesUpdate: serverTimestamp()
      });
      toast({
        title: "جاري المزامنة",
        description: "تم إرسال طلب تحديث القواعد.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشلت عملية المزامنة."
      });
    } finally {
      setTimeout(() => setIsUpdatingRules(false), 2000);
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
        <p className="font-bold">التحقق من الصلاحيات...</p>
      </div>
    );
  }

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
            { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'المستخدمين', value: users.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'الرسائل', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { 
              label: 'مزامنة القواعد', 
              value: 'تحديث الآن', 
              icon: RefreshCw, 
              color: 'text-amber-500', 
              bg: 'bg-amber-50',
              onClick: handleUpdateRules,
              loading: isUpdatingRules
            },
        ].map((stat, i) => (
            <Card key={i} className={`border-0 shadow-sm hover-lift ${stat.onClick ? 'cursor-pointer' : ''}`} onClick={stat.onClick}>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        {stat.loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <stat.icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400">{stat.label}</div>
                      <div className="text-xl font-black">{loading ? '...' : stat.value}</div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

       <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-xl mb-6 w-full flex overflow-x-auto justify-start h-auto">
                <TabsTrigger value="users" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">المستخدمين</TabsTrigger>
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
                            placeholder="أدخل المعرف (UID) هنا للتحكم اليدوي..." 
                            className="h-12 bg-white rounded-xl border-rose-100"
                            value={manualUid}
                            onChange={(e) => setManualUid(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2 w-full lg:w-auto">
                          <Button 
                            variant="destructive" 
                            className="rounded-xl h-12 font-bold px-8 flex-grow"
                            onClick={() => handleManualBlock('block')}
                            disabled={isProcessingManual || !manualUid.trim()}
                          >
                            {isProcessingManual ? <Loader2 className="h-4 w-4 animate-spin" /> : "حظر المعرف"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="rounded-xl h-12 font-bold px-8 bg-white flex-grow"
                            onClick={() => handleManualBlock('unblock')}
                            disabled={isProcessingManual || !manualUid.trim()}
                          >
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
                              <p className="text-[10px] text-muted-foreground font-mono">{u.email}</p>
                            </div>
                            <code 
                              className="text-[9px] bg-muted px-2 py-1 rounded cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={() => {
                                setManualUid(u.uid);
                                toast({ title: "تم النسخ" });
                              }}
                            >
                              {u.uid}
                            </code>
                            <Button 
                              variant={u.isBlocked ? "secondary" : "ghost"} 
                              onClick={() => toggleUserBlock(u.uid, !!u.isBlocked)}
                              className={`w-full rounded-xl font-bold h-9 text-xs ${u.isBlocked ? 'text-emerald-600' : 'text-rose-600 hover:bg-rose-50'}`}
                            >
                              {u.isBlocked ? "إلغاء الحظر" : "حظر الحساب"}
                            </Button>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
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
                              <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{teacher.email}</p>
                            </div>
                            <Badge variant="secondary" className="rounded-full px-4 font-bold">
                                {teacher.count} طلاب
                            </Badge>
                            <Button asChild className="w-full rounded-xl h-9 font-bold text-xs mt-2">
                                <Link href={`/admin/teacher/${teacher.uid}`}>
                                  إدارة السجلات
                                </Link>
                            </Button>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="messages">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {messages.map(msg => {
                        const status = msg.status || 'pending';
                        const statusInfo = STATUS_MAP[status];
                        return (
                          <Card 
                            key={msg.id} 
                            className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group rounded-[1.5rem] overflow-hidden flex flex-col h-full border-t-4 border-t-primary/10"
                            onClick={() => router.push(`/admin/messages/${msg.id}`)}
                          >
                            <CardContent className="p-6 flex flex-col h-full gap-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                      <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{msg.name}</h4>
                                      <Badge variant="outline" className={`${statusInfo.color} text-[8px] h-4 rounded-md border-transparent`}>
                                        {statusInfo.label}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-grow bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-slate-600 dark:text-slate-300 text-xs italic leading-relaxed line-clamp-3 border border-slate-100 dark:border-slate-800">
                                  "{msg.message}"
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
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
                    {messages.length === 0 && (
                      <div className="col-span-full py-20 text-center text-slate-400">
                         <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-10" />
                         <p className="font-bold text-lg">لا توجد رسائل تواصل حالياً</p>
                      </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
