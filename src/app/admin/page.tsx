
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
  Ban,
  Fingerprint,
  Settings,
  RefreshCw,
  Database
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_EMAIL } from '@/lib/constants';
import Link from 'next/link';
import { useAllUsers } from '@/hooks/use-app-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppConfig } from '@/hooks/use-app-config';

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

  const handleUpdateRules = async () => {
    setIsUpdatingRules(true);
    try {
      await updateConfig({
        lastRulesUpdate: serverTimestamp()
      });
      toast({
        title: "جاري المزامنة",
        description: "تم إرسال طلب تحديث قواعد البيانات بنجاح.",
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
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-white gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="font-bold text-lg">جاري التحقق من الصلاحيات الإدارية...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-primary text-white rounded-[1.5rem] shadow-xl shadow-primary/20 rotate-3">
                <ShieldCheck className="h-8 w-8" />
             </div>
             <div>
                <PageHeaderTitle className="text-4xl font-black">لوحة التحكم العليا</PageHeaderTitle>
                <PageHeaderDescription className="text-lg font-medium opacity-70">إدارة المستخدمين، الطلاب، والرسائل.</PageHeaderDescription>
             </div>
          </div>
        </PageHeader>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/settings')} 
            className="rounded-2xl h-14 font-black px-8 border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20 gap-3"
          >
              <Settings className="h-5 w-5" />
              إعدادات النظام
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')} 
            className="rounded-2xl h-14 font-black px-8 border-slate-300 hover:bg-slate-100 transition-all gap-3"
          >
              <ArrowLeft className="h-5 w-5" />
              الرئيسية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'إجمالي المستخدمين', value: users.length, icon: UserCircle, color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { label: 'الرسائل الواردة', value: messages.length, icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { 
              label: 'تحديث القواعد', 
              value: 'مزامنة الآن', 
              icon: RefreshCw, 
              color: 'text-amber-600', 
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/40',
              onClick: handleUpdateRules,
              loading: isUpdatingRules,
              isAction: true
            },
        ].map((stat, i) => (
            <Card 
              key={i} 
              className={`border-2 ${stat.border} shadow-lg rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 ${stat.onClick ? 'hover:scale-105 cursor-pointer ring-offset-4 ring-amber-500/10' : ''}`}
              onClick={stat.onClick}
            >
                <CardContent className={`p-8 flex flex-col items-center gap-4 text-center ${stat.isAction ? 'bg-gradient-to-b from-amber-500/5 to-transparent' : ''}`}>
                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                        {stat.loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <stat.icon className="w-8 h-8" />}
                    </div>
                    <div className="space-y-1">
                      <div className={`text-3xl font-black ${stat.isAction ? 'text-amber-600' : ''}`}>{loading ? '...' : stat.value}</div>
                      <div className="text-xs text-muted-foreground font-black uppercase tracking-widest">{stat.label}</div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

       <Tabs defaultValue="users" className="w-full space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-16 bg-white border-2 p-1.5 rounded-3xl shadow-sm">
                <TabsTrigger value="users" className="rounded-2xl font-black text-sm sm:text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">المستخدمين</TabsTrigger>
                <TabsTrigger value="teacher-uids" className="rounded-2xl font-black text-sm sm:text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">المعرفات</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-2xl font-black text-sm sm:text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">الرسائل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
                <div className="space-y-10">
                  <Card className="border-0 shadow-2xl rounded-[3rem] bg-slate-950 text-white overflow-hidden ring-4 ring-primary/10">
                    <CardHeader className="bg-gradient-to-r from-rose-600/20 to-transparent p-8">
                      <CardTitle className="text-2xl font-black flex items-center gap-3">
                        <Ban className="h-7 w-7 text-rose-500" />
                        نظام الحظر الفوري (Manual Block)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-grow">
                          <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500" />
                          <Input 
                            placeholder="أدخل الـ UID المراد التحكم في وصوله..." 
                            className="bg-slate-900/50 border-slate-700 h-16 pr-12 rounded-2xl text-xl font-mono text-emerald-400 placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary transition-all"
                            value={manualUid}
                            onChange={(e) => setManualUid(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            variant="destructive" 
                            className="rounded-2xl h-16 font-black px-10 text-lg shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all flex-grow lg:flex-grow-0"
                            onClick={() => handleManualBlock('block')}
                            disabled={isProcessingManual || !manualUid.trim()}
                          >
                            {isProcessingManual ? <Loader2 className="h-6 w-6 animate-spin" /> : "حظر الدخول"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="rounded-2xl h-16 font-black px-10 text-lg border-slate-700 hover:bg-slate-800 text-white transition-all flex-grow lg:flex-grow-0"
                            onClick={() => handleManualBlock('unblock')}
                            disabled={isProcessingManual || !manualUid.trim()}
                          >
                            فك الحظر
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-6 border-r-4 border-primary">
                        <h3 className="text-2xl font-black">إدارة مستخدمي المنصة ({users.length})</h3>
                        <Badge variant="outline" className="rounded-full px-4 py-1 font-bold">نشطين الآن</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {usersLoading ? (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4">
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                          <span className="font-bold text-xl">جاري جلب القائمة...</span>
                        </div>
                      ) : users.length > 0 ? users.map((u) => (
                          <Card 
                            key={u.uid} 
                            className={`group border-2 shadow-lg rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-2xl ${u.isBlocked ? 'border-rose-500/50 grayscale opacity-80' : 'border-transparent'}`}
                          >
                            <CardContent className="p-8 flex flex-col items-center gap-6 text-center">
                              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <AvatarImage src={u.photoURL} className="object-cover" />
                                <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                                  {u.displayName?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>

                              <div className="space-y-2">
                                <h4 className="font-black text-xl line-clamp-1">{u.displayName || 'مستخدم جديد'}</h4>
                                <p className="text-xs text-muted-foreground font-medium opacity-60">{u.email}</p>
                                <div 
                                  className="bg-muted/50 p-2.5 rounded-xl mt-3 font-mono text-[10px] sm:text-xs break-all border-2 border-dashed border-primary/20 text-primary/80 cursor-pointer hover:bg-primary/5 transition-colors" 
                                  onClick={() => {
                                    setManualUid(u.uid);
                                    toast({ title: "تم نسخ الـ UID للتحكم اليدوي" });
                                  }}
                                >
                                  UID: {u.uid}
                                </div>
                              </div>

                              <Button 
                                variant={u.isBlocked ? "outline" : "destructive"} 
                                onClick={() => toggleUserBlock(u.uid, !!u.isBlocked)}
                                className="w-full rounded-2xl font-black h-12 text-sm shadow-md"
                              >
                                {u.isBlocked ? "إلغاء الحظر" : "حظر المستخدم"}
                              </Button>
                            </CardContent>
                          </Card>
                      )) : (
                        <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-muted">
                           <UserCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                          <p className="text-xl text-muted-foreground font-black">لا يوجد مستخدمون مسجلون حتى الآن.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </TabsContent>

            <TabsContent value="teacher-uids">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {uidsWithStudents.length > 0 ? uidsWithStudents.map((teacher) => (
                        <Card key={teacher.uid} className="border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 text-center flex flex-col items-center gap-6 group hover:shadow-primary/5 transition-all">
                             <div className="p-5 bg-primary/5 rounded-[2rem] text-primary group-hover:rotate-12 transition-transform shadow-inner">
                                <Database className="h-10 w-10" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-black text-xl">{teacher.displayName}</h4>
                              <p className="text-xs text-muted-foreground">{teacher.email}</p>
                            </div>
                            <Badge className="rounded-full px-6 py-2 font-black bg-primary text-white border-0 shadow-lg shadow-primary/20">
                                {teacher.count} طالباً
                            </Badge>
                            <Button asChild className="w-full rounded-2xl h-14 font-black text-lg gap-2 shadow-lg hover:scale-105 transition-all">
                                <Link href={`/admin/teacher/${teacher.uid}`}>
                                  إدارة السجلات
                                </Link>
                            </Button>
                        </Card>
                    )) : (
                      <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-muted">
                         <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                         <p className="text-xl text-muted-foreground font-black">لا توجد سجلات طلاب مرتبطة بمعرفات حتى الآن.</p>
                      </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="messages">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {messages.length > 0 ? messages.map(msg => (
                        <Card key={msg.id} className="border-0 shadow-xl rounded-[3rem] bg-white dark:bg-slate-900 p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-6">
                                <div>
                                  <h4 className="font-black text-2xl text-primary">{msg.name}</h4>
                                  <p className="text-sm font-bold text-muted-foreground">{msg.email}</p>
                                </div>
                                <div className="p-3 bg-muted rounded-2xl">
                                  <MessageSquare className="h-6 w-6 text-slate-400" />
                                </div>
                              </div>
                              <div className="bg-muted/40 p-6 rounded-[2rem] border-2 border-dashed border-muted italic text-lg leading-relaxed">
                                "{msg.message}"
                              </div>
                              <div className="mt-6 flex justify-end">
                                <Badge variant="secondary" className="rounded-xl font-bold px-4">{new Date(msg.createdAt?.toDate()).toLocaleDateString('ar-EG')}</Badge>
                              </div>
                            </div>
                        </Card>
                    )) : (
                      <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-muted">
                        <p className="text-xl text-muted-foreground font-black">لا توجد رسائل واردة حالياً.</p>
                      </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
