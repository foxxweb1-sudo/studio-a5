'use client';

import { useUser } from '@/firebase';
import { usePromoCodes } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Key, Plus, Trash2, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminPromoCodesPage() {
  const router = useRouter();
  const { user } = useUser();
  const { codes, isLoading, generateCode, deleteCode } = usePromoCodes();
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم نسخ الكود" });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
               <Key className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">إدارة الأكواد</PageHeaderTitle>
          </div>
          <PageHeaderDescription>توليد ومراقبة أكواد تفعيل المساعد الشخصي (PRO).</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
            <Button onClick={generateCode} className="rounded-xl font-black gap-2 h-12 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/20">
                <Plus className="h-5 w-5" /> توليد كود جديد
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl h-12">
              <ArrowLeft className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
            {isLoading ? (
                <div className="py-20 text-center"><Loader2 className="animate-spin inline-block h-8 w-8 text-amber-500" /></div>
            ) : codes.length > 0 ? (
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="text-right px-8 font-black">الكود</TableHead>
                            <TableHead className="text-center font-black">الحالة</TableHead>
                            <TableHead className="text-right font-black">المستخدم</TableHead>
                            <TableHead className="text-center font-black">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {codes.map(c => (
                            <TableRow key={c.id}>
                                <TableCell className="px-8 font-mono font-black text-amber-700 flex items-center gap-2">
                                    {c.code}
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(c.code)}><Copy className="h-3 w-3" /></Button>
                                </TableCell>
                                <TableCell className="text-center">
                                    {c.isUsed ? (
                                        <Badge className="bg-rose-500 rounded-lg">مستخدم</Badge>
                                    ) : (
                                        <Badge className="bg-emerald-500 rounded-lg">متاح</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-700">{c.usedBy || '---'}</span>
                                        <span className="text-[8px] text-slate-400">{c.usedAt?.toDate ? c.usedAt.toDate().toLocaleString('ar-EG') : ''}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" onClick={() => deleteCode(c.id)} className="text-rose-500">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="py-32 text-center text-slate-400 space-y-4">
                    <Key className="h-12 w-12 mx-auto opacity-20" />
                    <p className="font-black italic">لا توجد أكواد حالياً.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
