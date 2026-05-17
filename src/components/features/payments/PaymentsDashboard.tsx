
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, AlertCircle, Settings, Save, Loader2, Calendar } from 'lucide-react';
import PaymentTracker from "./PaymentTracker";
import OutstandingPayments from "./OutstandingPayments";
import { usePaymentSettings } from '@/hooks/use-app-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PaymentsDashboardProps {
  gradeFilter?: string;
}

const YEARS = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 1 + i).toString());
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, '0'),
  label: format(new Date(2000, i), "MMMM", { locale: ar }),
}));

export default function PaymentsDashboard({ gradeFilter }: PaymentsDashboardProps) {
  const { settings, updateSettings, isLoading } = usePaymentSettings();
  const { toast } = useToast();
  
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [startMonth, setStartMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.startMonth) {
      const [y, m] = settings.startMonth.split('-');
      setStartYear(y);
      setStartMonth(m);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        startMonth: `${startYear}-${startMonth}`
      });
      toast({ title: "تم حفظ الإعدادات", description: "سيتم الآن حساب المتأخرات بناءً على التاريخ الجديد." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        <Tabs defaultValue="tracker" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-2xl mb-6 w-full flex h-auto">
                <TabsTrigger value="tracker" className="rounded-xl py-3 font-black flex-1 gap-2">
                <CreditCard className="h-4 w-4" />
                تسجيل دفعة
                </TabsTrigger>
                <TabsTrigger value="outstanding" className="rounded-xl py-3 font-black flex-1 gap-2">
                <AlertCircle className="h-4 w-4" />
                المتأخرات
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-xl py-3 font-black flex-1 gap-2">
                <Settings className="h-4 w-4" />
                ضبط البدء
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracker">
                <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="text-xl">تسجيل استلام مبلغ</CardTitle>
                        <CardDescription>اختر الطالب والشهر المستحق لتسجيل السداد.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <PaymentTracker gradeFilter={gradeFilter} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="outstanding">
                <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden">
                     <CardHeader className="bg-rose-50/50 border-b">
                        <CardTitle className="text-xl flex items-center gap-2 text-rose-700">
                            <AlertCircle className="h-5 w-5" />
                            كشف المتأخرات المالية
                        </CardTitle>
                        <CardDescription>عرض الطلاب الذين لم يسددوا الرسوم عن الشهور المطلوبة.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <OutstandingPayments gradeFilter={gradeFilter} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="settings">
                <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-amber-50 border-b">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-amber-600" />
                            تاريخ بدء المحاسبة
                        </CardTitle>
                        <CardDescription>حدد متى بدأت العمل بالتطبيق ليقوم النظام بحساب المتأخرات من هذا التاريخ فقط.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 px-1">سنة البدء</label>
                                <Select value={startYear} onValueChange={setStartYear}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 px-1">شهر البدء</label>
                                <Select value={startMonth} onValueChange={setStartMonth}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                            <Settings className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed font-bold">
                                مثال: إذا اخترت "سبتمبر 2025"، فإن النظام لن يطالب الطلاب بأي مبالغ عن شهور أغسطس أو يوليو من نفس السنة، وسيبدأ بمطالبتهم من سبتمبر فصاعداً.
                            </p>
                        </div>

                        <Button 
                            onClick={handleSaveSettings} 
                            disabled={isSaving || isLoading}
                            className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            حفظ تاريخ البدء
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
