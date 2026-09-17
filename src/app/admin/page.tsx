
'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, onSnapshot, query, where, collectionGroup } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Users, UserCircle, Database, Settings, BadgeCheck, ShieldCheck, Zap, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADMIN_EMAIL } from '@/lib/constants';
import Link from 'next/link';
import { useAllUsers } from '@/hooks/use-app-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [allStudentsCount, setAllStudentsCount] = useState(0);
  const { users, isLoading: usersLoading, toggleUserBlock, toggleUserVerify } = useAllUsers();

  const isAdmin = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  useEffect(() => {
    if (isUserLoading || !isAdmin || !firestore) return;
    
    // جلب إجمالي الطلاب عبر Collection Group
    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      setAllStudentsCount(snap.size);
    });
    
    return () => unsubStudents();
  }, [firestore, isAdmin, isUserLoading]);

  if (isUserLoading || !isAdmin) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  const verifiedCount = users.filter(u => u.isVerified).length;
  const assistantsCount = users.filter(u => u.isAssistant).length;

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
          <PageHeaderDescription>إدارة نظام المساعدين والأكواد الموحد.</PageHeaderDescription>
        </PageHeader>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/promo')} className="rounded-xl font-bold gap-2 h-11 border-amber-200 text-amber-600">
              <Key className="h-4 w-4" /> الأكواد
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/settings')} className="rounded-xl font-bold gap-2 h-11 border-primary/20">
              <Settings className="h-4 w-4" /> الإعدادات
          </Button>
          <Button onClick={() => router.push('/')} className="rounded-xl font-bold gap-2 h-11">
              <ArrowLeft className="h-4 w-4" /> الرئيسية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="المعلمين" value={users.filter(u => !u.isAssistant).length} icon={UserCircle} color="text-purple-500" bg="bg-purple-50" />
        <StatCard label="المساعدين النشطين" value={assistantsCount} icon={Zap} color="text-amber-500" bg="bg-amber-50" />
        <StatCard label="حسابات موثقة" value={verifiedCount} icon={BadgeCheck} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard label="إجمالي الطلاب" value={allStudentsCount} icon={Users} color="text-blue-500" bg="bg-blue-50" />
      </div>

       <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-slate-100 p-1.5 rounded-2xl mb-8 w-full flex overflow-x-auto justify-start h-auto gap-1">
                <TabsTrigger value="users" className="rounded-xl px-8 py-3 font-black flex-1 sm:flex-initial">إدارة المعلمين</TabsTrigger>
                <TabsTrigger value="assistants" className="rounded-xl px-8 py-3 font-black flex-1 sm:flex-initial">سجلات المساعدين</TabsTrigger>
                <TabsTrigger value="teacher-uids" className="rounded-xl px-8 py-3 font-black flex-1 sm:flex-initial">سجلات البيانات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {users.filter(u => !u.isAssistant).map((u) => (
                        <UserCard key={u.id} user={u} toggleBlock={toggleUserBlock} toggleVerify={toggleUserVerify} />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="assistants">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {users.filter(u => u.isAssistant).map((u) => (
                        <AssistantCard key={u.id} assistant={u} teacherName={users.find(t => t.uid === u.assignedTeacherId)?.displayName || '...'} />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="teacher-uids">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {users.filter(u => !u.isAssistant).map(u => (
                        <Card key={u.id} className="border-0 shadow-sm p-6 text-center rounded-3xl group hover:shadow-lg transition-all bg-white">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-all">
                                <Database className="h-6 w-6 text-primary/40 group-hover:text-primary transition-all" />
                            </div>
                            <h4 className="text-xs font-black mb-1 truncate">{u.displayName}</h4>
                            <code className="text-[8px] block mb-4 truncate font-mono text-slate-400">{u.uid}</code>
                            <Button asChild className="w-full rounded-xl h-10 font-bold text-[10px]"><Link href={`/admin/teacher/${u.uid}`}>عرض السجلات</Link></Button>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
    return (
        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
                  <div className="text-2xl font-black tabular-nums">{value}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function UserCard({ user, toggleBlock, toggleVerify }: any) {
    return (
        <Card className={`border-0 shadow-sm rounded-3xl ${user.isBlocked ? 'bg-rose-50 border border-rose-100' : 'bg-white'}`}>
            <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback className="bg-slate-100 font-bold">{user.displayName?.substring(0, 1)}</AvatarFallback>
                </Avatar>
                {user.isVerified && <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"><BadgeCheck className="h-6 w-6 fill-blue-500 text-white" /></div>}
                </div>
                <div className="w-full overflow-hidden">
                <h4 className="font-black text-slate-800 truncate">{user.displayName}</h4>
                <p className="text-[10px] text-muted-foreground truncate font-medium">{user.email}</p>
                </div>
                <div className="flex flex-col gap-2 w-full pt-2 border-t border-dashed">
                <Button variant="outline" onClick={() => toggleVerify(user.id, !!user.isVerified)} className="w-full rounded-xl font-black h-9 text-[10px]">
                    {user.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}
                </Button>
                <Button variant="outline" onClick={() => toggleBlock(user.id, !!user.isBlocked)} className="w-full rounded-xl font-black h-9 text-[10px]">
                    {user.isBlocked ? "إلغاء الحظر" : "حظر المستخدم"}
                </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function AssistantCard({ assistant, teacherName }: any) {
    return (
        <Card className="border-0 shadow-sm rounded-3xl bg-white border-r-4 border-amber-500 overflow-hidden">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div className="text-right overflow-hidden">
                        <h4 className="font-black text-sm truncate">{assistant.email}</h4>
                        <p className="text-[9px] font-bold text-slate-400">يدير حساب: {teacherName}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase">كلمة السر</span>
                    <p className="font-mono text-xs font-bold text-slate-700">{assistant.assistantPassword || '••••••••'}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">ينتهي في:</span>
                    <span className="text-rose-500">{assistant.assistantExpiresAt?.toDate ? assistant.assistantExpiresAt.toDate().toLocaleDateString('ar-EG') : '...'}</span>
                </div>
            </CardContent>
        </Card>
    );
}
