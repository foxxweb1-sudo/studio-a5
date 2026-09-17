'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDatabase } from '@/firebase';
import { collection, query, orderBy, collectionGroup, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
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
  UserCircle,
  Fingerprint,
  Settings,
  Database,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  CalendarClock,
  Star,
  ShieldAlert,
  BadgeCheck,
  Info,
  Plus,
  Ticket,
  Code
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_EMAIL } from '@/lib/constants';
import Link from 'next/link';
import { useAllUsers } from '@/hooks/use-app-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const database = useDatabase();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [promoCodesCount, setPromoCodesCount] = useState(0);
  
  const { users, isLoading: usersLoading, toggleUserBlock } = useAllUsers();

  const isAdmin = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  useEffect(() => {
    if (isUserLoading || !isAdmin || !firestore || !database) return;

    // جلب الطلاب من Firestore مع استخراج معرف المعلم من المسار
    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => {
        const data = doc.data();
        const teacherUid = doc.ref.parent.parent?.id; // استخراج UID المعلم من المسار
        return { id: doc.id, ...data, teacherUid };
      });
      setAllStudents(list);
      setLoadingStudents(false);
    });

    // جلب عدد الأكواد من Realtime Database
    const codesRef = ref(database, 'promoCodes');
    const unsubCodes = onValue(codesRef, (snapshot) => {
      const data = snapshot.val();
      setPromoCodesCount(data ? Object.keys(data).length : 0);
    });

    return () => {
      unsubStudents();
      unsubCodes();
    };
  }, [firestore, database, isAdmin, isUserLoading]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-bold text-slate-400">جاري التحقق من صلاحيات المدير...</p>
      </div>
    );
  }

  const STATS_DATA = [
    { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'المستخدمين', value: users.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'الأكواد (RTDB)', value: promoCodesCount, icon: Ticket, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">لوحة التحكم العليا</PageHeaderTitle>
          <PageHeaderDescription>إدارة نظام CybeNode الموحد بالكامل</PageHeaderDescription>
        </PageHeader>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/promo')} className="rounded-xl font-bold gap-2 bg-indigo-50 border-indigo-200 text-indigo-700 h-11">
              <Ticket className="h-4 w-4" />
              إدارة الأكواد
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/settings?tab=ads')} className="rounded-xl font-bold gap-2 bg-emerald-50 border-emerald-200 text-emerald-700 h-11">
              <Code className="h-4 w-4" />
              إدارة الإعلانات
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/settings')} className="rounded-xl font-bold gap-2 h-11">
              <Settings className="h-4 w-4" />
              إعدادات الهوية
          </Button>
          <Button onClick={() => router.push('/')} className="rounded-xl font-bold gap-2 h-11">
              <ArrowLeft className="h-4 w-4" />
              الرئيسية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS_DATA.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-2xl font-black tabular-nums">{stat.value}</div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

       <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-slate-100 p-1.5 rounded-2xl mb-8 w-full flex overflow-x-auto justify-start h-auto gap-1">
                <TabsTrigger value="users" className="rounded-xl px-8 py-3 font-black flex-1 sm:flex-initial data-[state=active]:bg-white data-[state=active]:shadow-sm">المستخدمين</TabsTrigger>
                <TabsTrigger value="teacher-uids" className="rounded-xl px-8 py-3 font-black flex-1 sm:flex-initial data-[state=active]:bg-white data-[state=active]:shadow-sm">سجلات المعلمين</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {users.map((u) => (
                        <Card key={u.id} className={`border-0 shadow-sm rounded-3xl ${u.isBlocked ? 'bg-rose-50 border border-rose-100' : 'bg-white'}`}>
                            <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                              <div className="relative">
                                <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                                  <AvatarImage src={u.photoURL} />
                                  <AvatarFallback className="bg-slate-100 font-bold">{u.displayName?.substring(0, 1)}</AvatarFallback>
                                </Avatar>
                                {u.isVerified && <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"><BadgeCheck className="h-6 w-6 fill-blue-500 text-white" /></div>}
                              </div>
                              <div className="w-full overflow-hidden">
                                <h4 className="font-black text-slate-800 truncate">{u.displayName}</h4>
                                <p className="text-[10px] text-muted-foreground truncate font-medium">{u.email}</p>
                                <div className="mt-2 pt-2 border-t border-dashed border-slate-200">
                                    <code className="text-[8px] opacity-40 select-all block font-mono">{u.uid || u.id}</code>
                                </div>
                              </div>
                              <Button 
                                variant={u.isBlocked ? "default" : "outline"} 
                                onClick={() => toggleUserBlock(u.uid || u.id, !!u.isBlocked)} 
                                className={`w-full rounded-xl font-black h-10 text-xs ${u.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-rose-600 hover:bg-rose-50 border-rose-100'}`}
                              >
                                  {u.isBlocked ? "إلغاء الحظر" : "حظر المستخدم"}
                              </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="teacher-uids">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from(new Set(allStudents.map(s => s.teacherUid))).filter(Boolean).map(uid => (
                        <Card key={uid as string} className="border-0 shadow-sm p-6 text-center rounded-3xl group hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-all">
                                <Database className="h-6 w-6 text-primary/40 group-hover:text-primary transition-all" />
                            </div>
                            <code className="text-[10px] block mb-4 truncate font-mono text-slate-400">{uid as string}</code>
                            <Button asChild className="w-full rounded-xl h-10 font-bold text-xs"><Link href={`/admin/teacher/${uid}`}>عرض كافة السجلات</Link></Button>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
