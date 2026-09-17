
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
  Ticket
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
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  const { users, isLoading: usersLoading, toggleUserBlock } = useAllUsers();

  const isAdmin = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const promoCodesQuery = useMemoFirebase(() => 
    (firestore && isAdmin) ? collection(firestore, 'promoCodes') : null,
  [firestore, isAdmin]);
  const { data: promoCodes } = useCollection<any>(promoCodesQuery);

  useEffect(() => {
    if (isUserLoading || !isAdmin || !firestore) return;

    const unsubStudents = onSnapshot(collectionGroup(firestore, 'students'), (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  }, [firestore, isAdmin, isUserLoading]);

  if (isUserLoading || !isAdmin) {
    return <div className="p-20 text-center"><Loader2 className="animate-spin inline-block" /></div>;
  }

  const STATS_DATA = [
    { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'المستخدمين', value: users.length, icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'الرسائل', value: messages.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'الأكواد', value: promoCodes?.length || 0, icon: Ticket, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">لوحة التحكم العليا</PageHeaderTitle>
          <PageHeaderDescription>إدارة نظام CybeNode الموحد (Firestore)</PageHeaderDescription>
        </PageHeader>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/promo')} className="rounded-xl font-bold gap-2 bg-indigo-50 border-indigo-200 text-indigo-700">
              <Ticket className="h-4 w-4" />
              أكواد الخصم
          </Button>
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
        {STATS_DATA.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400">{stat.label}</div>
                      <div className="text-xl font-black">{stat.value}</div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

       <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-xl mb-6 w-full flex overflow-x-auto justify-start h-auto">
                <TabsTrigger value="users" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">المستخدمين</TabsTrigger>
                <TabsTrigger value="messages" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">الرسائل</TabsTrigger>
                <TabsTrigger value="teacher-uids" className="rounded-lg px-6 py-2 font-bold flex-1 sm:flex-initial">سجلات المعلمين</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {users.map((u) => (
                        <Card key={u.uid} className={`border-0 shadow-sm ${u.isBlocked ? 'bg-rose-50' : 'bg-white'}`}>
                            <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                              <div className="relative">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={u.photoURL} />
                                  <AvatarFallback>{u.displayName?.substring(0, 1)}</AvatarFallback>
                                </Avatar>
                                {u.isVerified && <div className="absolute -top-1 -right-1 bg-white rounded-full"><BadgeCheck className="h-5 w-5 fill-blue-500 text-white" /></div>}
                              </div>
                              <div className="w-full overflow-hidden">
                                <h4 className="font-bold text-sm truncate">{u.displayName}</h4>
                                <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                                <code className="text-[8px] opacity-40 select-all block mt-1">{u.uid}</code>
                              </div>
                              <Button variant={u.isBlocked ? "secondary" : "ghost"} onClick={() => toggleUserBlock(u.uid, !!u.isBlocked)} className={`w-full rounded-xl font-bold h-9 text-xs ${u.isBlocked ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {u.isBlocked ? "إلغاء الحظر" : "حظر"}
                              </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="messages">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {messages.map(msg => (
                        <Card key={msg.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md" onClick={() => router.push(`/admin/messages/${msg.id}`)}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/5 rounded-xl text-primary"><MessageSquare className="h-5 w-5" /></div>
                                    <h4 className="font-bold text-sm">{msg.name}</h4>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-3 italic">"{msg.message}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="teacher-uids">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from(new Set(allStudents.map(s => s.teacherUid))).map(uid => (
                        <Card key={uid} className="border-0 shadow-sm p-6 text-center">
                            <Database className="h-6 w-6 mx-auto mb-3 text-primary opacity-20" />
                            <code className="text-[10px] block mb-4 truncate">{uid}</code>
                            <Button asChild className="w-full rounded-xl h-9 text-xs"><Link href={`/admin/teacher/${uid}`}>عرض سجلاته</Link></Button>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
