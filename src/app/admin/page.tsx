'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, collectionGroup, onSnapshot, doc, setDoc, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore';
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
  MessageSquareQuote,
  Star,
  Plus,
  ShieldAlert,
  BadgeCheck,
  ZapOff,
  Key,
  Copy
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
import { Info } from 'lucide-react';
import { DeletionRequest, Review, ActivationCode } from '@/lib/definitions';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  const [verifyUid, setVerifyUid] = useState('');
  const [reviewUid, setReviewUid] = useState('');
  const [activationTarget, setActivationTarget] = useState('');
  const [isProcessingManual, setIsProcessingManual] = useState(false);
  const [isProcessingVerify, setIsProcessingVerify] = useState(false);
  const [isGrantingReview, setIsProcessingReview] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const { users, isLoading: usersLoading, toggleUserBlock } = useAllUsers();

  const deletionRequestsQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'deletionRequests') : null,
  [firestore]);
  const { data: deletionRequests, isLoading: deletionLoading } = useCollection<DeletionRequest>(deletionRequestsQuery);

  const reviewsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc')) : null,
  [firestore]);
  const { data: reviews, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);

  const activationCodesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'activationCodes'), orderBy('createdAt', 'desc')) : null,
  [firestore]);
  const { data: activationCodes, isLoading: codesLoading } = useCollection<ActivationCode>(activationCodesQuery);

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
    
    const adminUser = users.find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (action === 'block' && adminUser && manualUid.trim() === adminUser.uid) {
        toast({ variant: "destructive", title: "إجراء غير مسموح", description: "لا يمكن حظر حساب المسؤول الرئيسي للنظام." });
        return;
    }

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

  const handleManualVerify = async (action: 'verify' | 'unverify') => {
    if (!verifyUid.trim() || !firestore) return;
    
    setIsProcessingVerify(true);
    try {
      const userRef = doc(firestore, 'users', verifyUid.trim());
      const status = action === 'verify';
      await setDoc(userRef, { isVerified: status, verifiedAt: status ? serverTimestamp() : null }, { merge: true });
      toast({ title: status ? "تم توثيق الحساب" : "تم إلغاء التوثيق" });
      setVerifyUid('');
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في المعرف" });
    } finally {
      setIsProcessingVerify(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!activationTarget.trim() || !firestore) return;
    setIsGeneratingCode(true);
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await addDoc(collection(firestore, 'activationCodes'), {
        code,
        targetId: activationTarget.trim(),
        isUsed: false,
        createdAt: serverTimestamp()
      });
      toast({ title: "تم توليد كود بنجاح", description: `الكود: ${code}` });
      setActivationTarget('');
    } catch (error) {
      toast({ variant: "destructive", title: "فشل توليد الكود" });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'activationCodes', id));
      toast({ title: "تم حذف الكود بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "تم نسخ الكود", description: code });
  };

  const handleGrantReview = async () => {
    if (!reviewUid.trim() || !firestore) return;
    setIsProcessingReview(true);
    try {
      const permRef = doc(firestore, 'reviewPermissions', reviewUid.trim());
      await setDoc(permRef, { canReview: true, grantedAt: serverTimestamp() });
      toast({ title: "تم منح الإذن بنجاح", description: "سيظهر نموذج التقييم للمستخدم الآن." });
      setReviewUid('');
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في منح الإذن" });
    } finally {
      setIsProcessingReview(false);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'reviews', reviewId));
    toast({ title: "تم حذف التقييم" });
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

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="font-bold text-slate-400">تحميل البيانات...</p>
      </div>
    );
  }

  const activeDeletionCount = deletionRequests?.length || 0;

  const STATS_DATA = [
    { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', loading: loadingStudents },
    { label: 'المستخدمين', value: users.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-50', loading: usersLoading },
    { label: 'الرسائل', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50', loading: false },
    { label: 'التقييمات', value: reviews?.length || 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-100', loading: reviewsLoading },
    { label: 'طلبات الحذف', value: activeDeletionCount, icon: Trash2, color: 'text-rose-500', bg: 'bg-rose-50', loading: deletionLoading },
  ];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS_DATA.map((stat) => (
            <Card key={stat.label} className={`border-0 shadow-sm hover:shadow-md transition-all`}>
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
                <TabsTrigger value="ads" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">أكواد التفعيل</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">التقييمات</TabsTrigger>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-2 border-rose-500/10 shadow-none rounded-3xl overflow-hidden bg-rose-500/5">
                        <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2 w-full">
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
                            <div className="flex gap-2 w-full">
                            <Button variant="destructive" className="rounded-xl h-12 font-bold px-8 flex-1" onClick={() => handleManualBlock('block')} disabled={isProcessingManual || !manualUid.trim()}>
                                {isProcessingManual ? <Loader2 className="h-4 w-4 animate-spin" /> : "حظر المعرف"}
                            </Button>
                            <Button variant="outline" className="rounded-xl h-12 font-bold px-8 bg-white flex-1" onClick={() => handleManualBlock('unblock')} disabled={isProcessingManual || !manualUid.trim()}>
                                فك الحظر
                            </Button>
                            </div>
                        </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-500/10 shadow-none rounded-3xl overflow-hidden bg-blue-500/5">
                        <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2 w-full">
                            <label className="text-xs font-bold text-blue-600 px-1 flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4" />
                                توثيق حساب يدوي بواسطة UID
                            </label>
                            <Input 
                                placeholder="أدخل المعرف (UID) للتوثيق..." 
                                className="h-12 bg-white rounded-xl border-blue-100"
                                value={verifyUid}
                                onChange={(e) => setVerifyUid(e.target.value)}
                            />
                            </div>
                            <div className="flex gap-2 w-full">
                            <Button className="rounded-xl h-12 font-bold px-8 bg-blue-600 hover:bg-blue-700 text-white flex-1" onClick={() => handleManualVerify('verify')} disabled={isProcessingVerify || !verifyUid.trim()}>
                                {isProcessingVerify ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                                توثيق الحساب
                            </Button>
                            <Button variant="outline" className="rounded-xl h-12 font-bold px-8 bg-white flex-1 border-blue-100 text-blue-600" onClick={() => handleManualVerify('unverify')} disabled={isProcessingVerify || !verifyUid.trim()}>
                                سحب التوثيق
                            </Button>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {usersLoading ? (
                      <div className="col-span-full py-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : users.map((u) => {
                        const isAccountAdmin = u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                        const uDisplayName = u.displayName || 'مستخدم';
                        const showBadgeBefore = isArabic(uDisplayName); 
                        
                        return (
                          <Card key={u.id} className={`border-0 shadow-sm ${u.isBlocked ? 'bg-rose-50' : 'bg-white'} ${isAccountAdmin ? 'border-2 border-primary/20' : ''}`}>
                            <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                              <div className="relative">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={u.photoURL} />
                                  <AvatarFallback>{uDisplayName.substring(0, 2) || 'U'}</AvatarFallback>
                                </Avatar>
                                {isAccountAdmin ? (
                                    <div className="absolute -top-1 -right-1 bg-primary text-white p-1 rounded-full shadow-lg border-2 border-white">
                                        <ShieldAlert className="h-3 w-3" />
                                    </div>
                                ) : u.isVerified && (
                                    <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0 shadow-md z-10">
                                        <BadgeCheck className="h-5 w-5 fill-blue-500 text-white" />
                                    </div>
                                )}
                              </div>
                              <div className="w-full overflow-hidden">
                                <h4 className="font-bold text-sm truncate flex items-center justify-center gap-1">
                                    {u.isVerified && showBadgeBefore && <BadgeCheck className="h-3.5 w-3.5 fill-blue-500 text-white" />}
                                    {uDisplayName}
                                    {u.isVerified && !showBadgeBefore && <BadgeCheck className="h-3.5 w-3.5 fill-blue-500 text-white" />}
                                </h4>
                                <p className="text-[10px] text-muted-foreground font-mono truncate w-full">{u.email}</p>
                                <code className="text-[8px] opacity-40 select-all block mt-1">{u.uid}</code>
                              </div>
                              
                              {isAccountAdmin ? (
                                  <Badge variant="outline" className="w-full rounded-xl py-2 border-primary/30 text-primary font-black bg-primary/5">
                                      المسؤول الرئيسي
                                  </Badge>
                              ) : (
                                  <div className="w-full space-y-2">
                                    <Button variant={u.isBlocked ? "secondary" : "ghost"} onClick={() => toggleUserBlock(u.uid, !!u.isBlocked)} className={`w-full rounded-xl font-bold h-9 text-xs ${u.isBlocked ? 'text-emerald-600' : 'text-rose-600 hover:bg-rose-50'}`}>
                                        {u.isBlocked ? "إلغاء الحظر" : "حظر الحساب"}
                                    </Button>
                                  </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                    })}
                  </div>
                </div>
            </TabsContent>

            <TabsContent value="ads">
                <div className="space-y-6">
                    <Card className="border-2 border-indigo-500/10 shadow-none rounded-3xl overflow-hidden bg-indigo-500/5">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4 items-end">
                                <div className="space-y-2 flex-grow w-full">
                                    <label className="text-xs font-bold text-indigo-600 px-1 flex items-center gap-2">
                                        <ZapOff className="h-4 w-4" />
                                        توليد كود إلغاء إعلانات (UID أو بريد)
                                    </label>
                                    <Input 
                                        placeholder="أدخل البريد أو الـ UID للمستلم..." 
                                        className="h-12 bg-white rounded-xl border-indigo-100"
                                        value={activationTarget}
                                        onChange={(e) => setActivationTarget(e.target.value)}
                                    />
                                </div>
                                <Button className="rounded-xl h-12 font-bold px-8 bg-indigo-600 hover:bg-indigo-700 w-full lg:w-auto" onClick={handleGenerateCode} disabled={isGeneratingCode || !activationTarget.trim()}>
                                    {isGeneratingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    توليد كود
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50 p-6 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Key className="h-5 w-5 text-indigo-500" />
                                سجل الأكواد المولدة
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right px-6">الكود</TableHead>
                                            <TableHead className="text-right">المستهدف</TableHead>
                                            <TableHead className="text-center">الحالة</TableHead>
                                            <TableHead className="text-right px-6">تاريخ الإنشاء</TableHead>
                                            <TableHead className="text-center px-6">إجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activationCodes?.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell className="px-6 font-mono font-bold text-indigo-600 select-all">{c.code}</TableCell>
                                                <TableCell className="text-xs text-slate-500">{c.targetId}</TableCell>
                                                <TableCell className="text-center">
                                                    {c.isUsed ? (
                                                        <Badge className="bg-rose-50 text-rose-600 border-rose-100 rounded-lg">تم الاستخدام</Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg">نشط</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 text-[10px] text-slate-400">
                                                    {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleString('ar-EG') : '...'}
                                                </TableCell>
                                                <TableCell className="text-center px-6">
                                                  <div className="flex items-center justify-center gap-1">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" 
                                                      onClick={() => handleCopyCode(c.code)}
                                                    >
                                                      <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-8 w-8 text-rose-500 hover:bg-rose-50" 
                                                      onClick={() => handleDeleteCode(c.id)}
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="reviews">
                <div className="space-y-6">
                  <Card className="border-2 border-amber-500/10 shadow-none rounded-3xl overflow-hidden bg-amber-500/5">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="space-y-2 flex-grow w-full">
                          <label className="text-xs font-bold text-amber-600 px-1 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            منح إذن تقييم للمستخدم (UID)
                          </label>
                          <Input 
                            placeholder="أدخل الـ UID لإظهار نموذج التقييم للمستخدم..." 
                            className="h-12 bg-white rounded-xl border-amber-100"
                            value={reviewUid}
                            onChange={(e) => setReviewUid(e.target.value)}
                          />
                        </div>
                        <Button className="rounded-xl h-12 font-bold px-8 bg-amber-600 hover:bg-amber-700 w-full lg:w-auto" onClick={handleGrantReview} disabled={isGrantingReview || !reviewUid.trim()}>
                           {isGrantingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                           منح الإذن
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews?.map((rev) => (
                      <Card key={rev.id} className="border-0 shadow-sm bg-white overflow-hidden rounded-[2rem]">
                        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={rev.userPhoto} />
                                <AvatarFallback className="bg-amber-100 text-amber-600 font-bold">{rev.userName?.substring(0,1)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-xs">{rev.userName}</h4>
                                <div className="flex text-amber-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" className="text-rose-500 rounded-full" onClick={() => handleDeleteReview(rev.id)}>
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                           <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed min-h-[60px]">
                              "{rev.comment}"
                           </div>
                           <p className="text-[9px] text-slate-400 mt-2 font-mono">UID: {rev.userId}</p>
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
                      <div key={req.id} className="flex flex-col gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-rose-100 border-r-8 border-r-rose-500">
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
                            </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[2rem] border border-dashed">
                      <Trash2 className="h-16 w-16 mx-auto text-slate-200" />
                      <p className="text-slate-400 font-black">لا توجد طلبات حذف حالياً</p>
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
