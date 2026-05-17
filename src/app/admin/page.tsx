
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
  Database,
  LayoutDashboard
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
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-white gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="font-bold text-lg">التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto">
      {/* رأس الصفحة المحسن */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <ShieldCheck className="h-8 w-8" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">لوحة التحكم العليا</h1>
              <p className="text-slate-500 font-medium text-sm">إدارة المستخدمين والأنظمة المركزية</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/settings')} 
            className="rounded-xl h-12 font-bold px-6 border-slate-200 hover:bg-slate-50 gap-2"
          >
              <Settings className="h-4 w-4" />
              الإعدادات
          </Button>
          <Button 
            onClick={() => router.push('/')} 
            className="rounded-xl h-12 font-bold px-6 gap-2"
          >
              <ArrowLeft className="h-4 w-4" />
              الرئيسية
          </Button>
        </div>
      </div>

      {/* إحصائيات بأسلوب عصري */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'المستخدمين', value: users.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'الرسائل', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { 
              label: 'مزامنة القواعد', 
              value: 'تحديث', 
              icon: RefreshCw, 
              color: 'text-amber-500', 
              bg: 'bg-amber-50',
              onClick: handleUpdateRules,
              loading: isUpdatingRules,
              isAction: true
            },
        ].map((stat, i) => (
            <Card 
              key={i} 
              className={`border border-slate-100 hover-lift ${stat.onClick ? 'cursor-pointer' : ''}`}
              onClick={stat.onClick}
            >
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        {stat.loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <stat.icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{stat.label}</div>
                      <div className="text-xl font-black">{loading ? '...' : stat.value}</div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

       <Tabs defaultValue="users" className="w-full space-y-8">
            <TabsList className="flex w-fit bg-slate-100/50 p-1 rounded-xl mx-auto mb-10 border">
                <TabsTrigger value="users" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">المستخدمين</TabsTrigger>
                <TabsTrigger value="teacher-uids" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">المعرفات</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">الرسائل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
                <div className="space-y-10">
                  {/* قسم الحظر اليدوي الأنيق */}
                  <Card className="border-2 border-rose-500/10 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="bg-rose-500/5 p-6 border-b border-rose-500/10 flex items-center gap-3">
                        <Fingerprint className="h-5 w-5 text-rose-500" />
                        <h3 className="font-black text-rose-900 dark:text-rose-400">نظام التحكم اليدوي بالوصول</h3>
                    </div>
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="space-y-2 flex-grow w-full">
                          <label className="text-xs font-bold text-slate-400 px-1">معرف المستخدم (UID)</label>
                          <Input 
                            placeholder="الصق المعرف هنا للتحكم في وصوله..." 
                            className="h-12 bg-slate-50 border-slate-200 rounded-xl font-mono text-sm"
                            value={manualUid}
                            onChange={(e) => setManualUid(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2 w-full lg:w-auto">
                          <Button 
                            variant="destructive" 
                            className="rounded-xl h-12 font-bold px-8 flex-grow lg:flex-grow-0"
                            onClick={() => handleManualBlock('block')}
                            disabled={isProcessingManual || !manualUid.trim()}
                          >
                            {isProcessingManual ? <Loader2 className="h-4 w-4 animate-spin" /> : "حظر"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="rounded-xl h-12 font-bold px-8 border-slate-200 flex-grow lg:flex-grow-0"
                            onClick={() => handleManualBlock('unblock')}
                            disabled={isProcessingManual || !manualUid.trim()}
                          >
                            فك الحظر
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* شبكة المستخدمين */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {usersLoading ? (
                      <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                      </div>
                    ) : users.length > 0 ? users.map((u) => (
                        <Card 
                          key={u.uid} 
                          className={`group border border-slate-100 rounded-3xl overflow-hidden transition-all hover:border-primary/20 ${u.isBlocked ? 'bg-rose-50/30' : 'bg-white'}`}
                        >
                          <CardContent className="p-6 flex flex-col items-center gap-5 text-center">
                            <Avatar className="h-20 w-20 border-2 border-slate-50 shadow-sm">
                              <AvatarImage src={u.photoURL} className="object-cover" />
                              <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">
                                {u.displayName?.substring(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                              <h4 className="font-black text-base line-clamp-1">{u.displayName || 'مستخدم جديد'}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                            </div>

                            <code 
                              className="text-[10px] bg-slate-100 px-3 py-1 rounded-lg text-slate-500 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                              onClick={() => {
                                setManualUid(u.uid);
                                toast({ title: "تم نسخ المعرف" });
                              }}
                            >
                              {u.uid.substring(0, 12)}...
                            </code>

                            <Button 
                              variant={u.isBlocked ? "secondary" : "ghost"} 
                              onClick={() => toggleUserBlock(u.uid, !!u.isBlocked)}
                              className={`w-full rounded-xl font-bold h-10 text-xs ${u.isBlocked ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-rose-600 hover:bg-rose-50'}`}
                            >
                              {u.isBlocked ? "إلغاء الحظر" : "حظر الدخول"}
                            </Button>
                          </CardContent>
                        </Card>
                    )) : (
                      <div className="col-span-full py-20 text-center opacity-40">لا يوجد مستخدمون.</div>
                    )}
                  </div>
                </div>
            </TabsContent>

            <TabsContent value="teacher-uids">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {uidsWithStudents.length > 0 ? uidsWithStudents.map((teacher) => (
                        <Card key={teacher.uid} className="border border-slate-100 rounded-3xl p-6 text-center flex flex-col items-center gap-4 hover-lift">
                             <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-sm">{teacher.displayName}</h4>
                              <p className="text-[10px] text-slate-400">{teacher.email}</p>
                            </div>
                            <Badge variant="secondary" className="rounded-full px-4 font-bold bg-slate-100 text-slate-600 border-0">
                                {teacher.count} طلاب
                            </Badge>
                            <Button asChild className="w-full rounded-xl h-10 font-bold text-xs mt-2">
                                <Link href={`/admin/teacher/${teacher.uid}`}>
                                  إدارة السجلات
                                </Link>
                            </Button>
                        </Card>
                    )) : (
                      <div className="col-span-full py-20 text-center opacity-40">لا توجد بيانات طلاب حالياً.</div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="messages">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {messages.length > 0 ? messages.map(msg => (
                        <Card key={msg.id} className="border border-slate-100 rounded-3xl p-8 bg-white dark:bg-slate-900 group">
                              <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                  <h4 className="font-black text-lg text-primary">{msg.name}</h4>
                                  <p className="text-xs font-medium text-slate-400">{msg.email}</p>
                                </div>
                                <div className="text-[10px] font-bold text-slate-300">
                                  {new Date(msg.createdAt?.toDate()).toLocaleDateString('ar-EG')}
                                </div>
                              </div>
                              <div className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed italic border border-slate-100">
                                "{msg.message}"
                              </div>
                        </Card>
                    )) : (
                      <div className="col-span-full py-20 text-center opacity-40">صندوق الرسائل فارغ.</div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
