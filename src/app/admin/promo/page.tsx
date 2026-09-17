
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Ticket, 
  ArrowLeft, 
  Copy,
  Users,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminPromoCodesPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [newCode, setNewCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const codesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'promoCodes'), orderBy('createdAt', 'desc')) : null,
  [firestore]);
  const { data: codes, isLoading: codesLoading } = useCollection<any>(codesQuery);

  const isAdmin = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const handleGenerateCode = async () => {
    if (!newCode.trim()) {
        const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        setNewCode(randomCode);
        return;
    }

    setIsGenerating(true);
    try {
      const codeRef = doc(firestore!, 'promoCodes', newCode.trim());
      await setDoc(codeRef, {
        code: newCode.trim(),
        isUsed: false,
        createdAt: serverTimestamp()
      });
      toast({ title: "تم إنشاء الكود بنجاح" });
      setNewCode('');
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الإنشاء" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    try {
      await deleteDoc(doc(firestore!, 'promoCodes', id));
      toast({ title: "تم حذف الكود" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ للحافظة" });
  };

  if (isUserLoading || !isAdmin) {
    return <div className="p-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto" /></div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
               <Ticket className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">إدارة الأكواد الترويجية</PageHeaderTitle>
          </div>
          <PageHeaderDescription>أنشئ أكواد إزالة الإعلانات وتابع حالة استخدامها.</PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.push('/admin')} className="rounded-xl">
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Plus className="h-5 w-5 text-emerald-400" />
                    توليد كود جديد
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كود الخصم (أو اتركه فارغاً للعشوائي)</label>
                    <Input 
                        placeholder="CYBE-XXXX" 
                        value={newCode} 
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-center text-xl font-black tracking-widest uppercase"
                    />
                </div>
                <Button 
                    onClick={handleGenerateCode} 
                    disabled={isGenerating}
                    className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black text-lg gap-2"
                >
                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Ticket className="h-5 w-5" />}
                    اعتماد الكود في النظام
                </Button>
            </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 p-8 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black">سجل الأكواد</CardTitle>
                    <Badge variant="outline" className="rounded-full px-4 font-bold">{codes?.length || 0} كود</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {codesLoading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin inline-block h-8 w-8 text-primary" /></div>
                ) : codes && codes.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right px-8 font-black">الكود</TableHead>
                                <TableHead className="text-center font-black">الحالة</TableHead>
                                <TableHead className="text-center px-8 font-black">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {codes.map((c: any) => (
                                <TableRow key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <code className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black text-sm">{c.code}</code>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(c.code)}>
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {c.isUsed ? (
                                            <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 gap-1 rounded-lg font-bold">
                                                <XCircle className="h-3 w-3" /> مستخدم
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 gap-1 rounded-lg font-bold">
                                                <CheckCircle2 className="h-3 w-3" /> متاح
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center px-8">
                                        <Button variant="ghost" size="icon" className="text-rose-500" onClick={() => handleDeleteCode(c.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="py-20 text-center text-slate-300 italic font-bold">لا توجد أكواد مسجلة بعد.</div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
