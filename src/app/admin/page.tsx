'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
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
  Database,
  Settings,
  BadgeCheck,
  ShieldCheck,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_EMAIL } from '@/lib/constants';
import Link from 'next/link';
import { useAllUsers } from '@/hooks/use-app-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  const { users, isLoading: usersLoading, toggleUserBlock, toggleUserVerify } = useAllUsers();

  const isAdmin = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  useEffect(() => {
    if (isUserLoading || !isAdmin || !firestore) return;

    // مراقبة كافة الطلاب في النظام
    const unsubStudents = onSnapshot(collection(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllStudents(list);
      setLoadingStudents(false);
    });

    return () => unsubStudents();
  }, [firestore, isAdmin, isUserLoading]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-bold text-slate-400">جاري التحقق من صلاحيات المدير...</p>
      </div>
    );
  }

  const verifiedCount = users.filter(u => u.isVerified).length;

  const STATS_DATA = [
    { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'المعلمين المسجلين', value: users.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'حسابات موثقة', value: verifiedCount, icon: BadgeCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
               <ShieldCheck className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">لوحة التحكم العليا</PageHeaderTitle>
          </div>
          <PageHeaderDescription>إدارة نظام CybeNode الموحد بالكامل وبصلاحيات مطلقة.</PageHeaderDescription>
        </PageHeader>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/settings')} className="rounded-xl font-bold gap-2 h-11 border-primary/20">
              <Settings className="h-4 w-4" />
              إعدادات المنصة
          </Button>
          <Button onClick={() => router.push('/')} className="rounded-xl font-bold gap-2 h-11">
              <ArrowLeft className="h-4 w-4" />
              الرئيسية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS_DATA.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
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
                <TabsTrigger value="users" className="rounded-xl px-8 py-3 font-black flex-1 sm:flex-initial data-[state=active]:bg-white data-[state=active]:shadow-sm">إدارة المعلمين</TabsTrigger>
                <TabsTrigger value="teacher-uids" className="rounded-xl px-8 py-3 font-black flex-1 sm:flex-initial data-[state=active]:bg-white data-[state=active]:shadow-sm">سجلات البيانات</TabsTrigger>
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
                              </div>
                              
                              <div className="flex flex-col gap-2 w-full pt-2 border-t border-dashed">
                                <Button 
                                    variant={u.isVerified ? "default" : "outline"} 
                                    onClick={() => toggleUserVerify(u.uid || u.id, !!u.isVerified)} 
                                    className={`w-full rounded-xl font-black h-9 text-[10px] ${u.isVerified ? 'bg-blue-600 hover:bg-blue-700' : 'text-blue-600 border-blue-100'}`}
                                >
                                    {u.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}
                                </Button>
                                <Button 
                                    variant={u.isBlocked ? "default" : "outline"} 
                                    onClick={() => toggleUserBlock(u.uid || u.id, !!u.isBlocked)} 
                                    className={`w-full rounded-xl font-black h-9 text-[10px] ${u.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-rose-600 border-rose-100'}`}
                                >
                                    {u.isBlocked ? "إلغاء الحظر" : "حظر المستخدم"}
                                </Button>
                              </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="teacher-uids">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {users.map(u => (
                        <Card key={u.id} className="border-0 shadow-sm p-6 text-center rounded-3xl group hover:shadow-lg transition-all bg-white">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-all">
                                <Database className="h-6 w-6 text-primary/40 group-hover:text-primary transition-all" />
                            </div>
                            <h4 className="text-xs font-black mb-1 truncate">{u.displayName}</h4>
                            <code className="text-[8px] block mb-4 truncate font-mono text-slate-400">{u.uid}</code>
                            <Button asChild className="w-full rounded-xl h-10 font-bold text-[10px]"><Link href={`/admin/teacher/${u.uid}`}>عرض كافة السجلات</Link></Button>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
