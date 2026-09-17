
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
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
  Wand2,
  RefreshCw,
  Sparkles
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

  const isAdmin = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const codesQuery = useMemoFirebase(() => 
    (firestore && isAdmin) ? query(collection(firestore, 'promoCodes'), orderBy('createdAt', 'desc')) : null,
  [firestore, isAdmin]);

  const { data: codes, isLoading: isLoadingCodes } = useCollection<any>(codesQuery);

  // دالة لتوليد كود عشوائي
  const generateRandomId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CYBE-${result}`;
  };

  const handleQuickGenerate = () => {
    setNewCode(generateRandomId());
  };

  const handleSaveCode = async () => {
    if (!firestore || !isAdmin) return;

    // إذا كان الحقل فارغاً، نولد كوداً فورياً
    const codeToUse = newCode.trim().toUpperCase() || generateRandomId();

    setIsGenerating(true);
    try {
      const codeRef = doc(firestore, 'promoCodes', codeToUse);
      await setDoc(codeRef, {
        code: codeToUse,
        isUsed: false,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });
      toast({ title: "تم إنشاء الكود بنجاح", description: `الكود ${codeToUse} جاهز للاستخدام في Firestore.` });
      setNewCode('');
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الإنشاء", description: "تأكد من صلاحيات المدير." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'promoCodes', id));
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
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
            <p className="font-bold text-slate-400">جاري التحقق من الهوية الإدارية...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="p-3 bg-indigo-500/10 rounded-2xl shadow-inner">
               <Ticket className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">إدارة الأكواد (Firestore)</PageHeaderTitle>
          </div>
          <PageHeaderDescription>توليد وإدارة أكواد تفعيل باقة الـ PRO في قاعدة البيانات الرئيسية.</PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.push('/admin')} className="rounded-xl h-12 px-6 font-bold border-indigo-100 hover:bg-indigo-50">
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع للوحة التحكم
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_50%)]" />
            <CardHeader className="p-8 pb-4 relative z-10">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    توليد كود جديد
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كود التفعيل</label>
                        <button onClick={handleQuickGenerate} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                            <Wand2 className="h-3 w-3" /> توليد عشوائي
                        </button>
                    </div>
                    <Input 
                        placeholder="CYBE-XXXXXX" 
                        value={newCode} 
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-center text-2xl font-black tracking-widest uppercase focus:bg-white/10 transition-all border-2 focus:border-indigo-500/50"
                    />
                </div>
                <Button 
                    onClick={handleSaveCode} 
                    disabled={isGenerating}
                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black text-lg gap-3 shadow-2xl shadow-indigo-600/20 group transition-all active:scale-[0.98]"
                >
                    {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />}
                    اعتماد وحفظ الكود
                </Button>
                <p className="text-[9px] text-center text-slate-500 font-bold">عند الضغط، سيتم إنشاء الكود فوراً في Firestore ليصبح متاحاً للمستخدمين.</p>
            </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 p-8 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <RefreshCw className="h-5 w-5 text-indigo-500" />
                        </div>
                        <CardTitle className="text-xl font-black">سجل الأكواد</CardTitle>
                    </div>
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 font-black bg-white border-indigo-100 text-indigo-600">{codes?.length || 0} كود مسجل</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoadingCodes ? (
                    <div className="py-24 text-center">
                        <Loader2 className="animate-spin inline-block h-10 w-10 text-indigo-200" />
                        <p className="text-slate-400 font-bold mt-4">جاري تحميل البيانات...</p>
                    </div>
                ) : (codes && codes.length > 0) ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b-2">
                                    <TableHead className="text-right px-8 py-5 font-black text-slate-400">الكود</TableHead>
                                    <TableHead className="text-center py-5 font-black text-slate-400">الحالة</TableHead>
                                    <TableHead className="text-center px-8 py-5 font-black text-slate-400">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {codes.map((c: any) => (
                                    <TableRow key={c.id} className="hover:bg-slate-50/80 transition-colors border-b last:border-0 group">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <code className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-black text-base shadow-sm border border-indigo-100">{c.code}</code>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(c.code)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {c.isUsed ? (
                                                <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 gap-1.5 rounded-xl px-4 py-1.5 font-black">
                                                    <XCircle className="h-3.5 w-3.5" /> مستخدم
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 gap-1.5 rounded-xl px-4 py-1.5 font-black">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> متاح
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center px-8">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                                                onClick={() => handleDeleteCode(c.id)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="py-32 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-100">
                            <Ticket className="h-8 w-8 text-slate-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-400 font-black">لا توجد أكواد مسجلة حالياً</p>
                            <p className="text-[10px] text-slate-300 font-bold">ابدأ بتوليد كود جديد من اللوحة الجانبية.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
