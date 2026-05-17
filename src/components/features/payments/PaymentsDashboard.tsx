
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, AlertCircle, Settings, Save, Loader2, Calendar, ArrowRightLeft } from 'lucide-react';
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

const YEARS = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 1 + i).toString());
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, '0'),
  label: format(new Date(2000, i), "MMMM", { locale: ar }),
}));

export default function PaymentsDashboard({ gradeFilter }: PaymentsDashboardProps) {
  const { settings, updateSettings, isLoading } = usePaymentSettings();
  const { toast } = useToast();
  
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [startMonth, setStartMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());
  const [endMonth, setEndMonth] = useState('12');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.startMonth) {
      const [y, m] = settings.startMonth.split('-');
      setStartYear(y);
      setStartMonth(m);
    }
    if (settings?.endMonth) {
      const [y, m] = settings.endMonth.split('-');
      setEndYear(y);
      setEndMonth(m);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        startMonth: `${startYear}-${startMonth}`,
        endMonth: `${endYear}-${endMonth}`
      });
      toast({ 
        title: "تم حفظ الإعدادات", 
        description: "تم تحديث الفترة المحاسبية النشطة بنجاح." 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        <Tabs defaultValue="tracker" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-2xl mb-6 w-full flex h-auto overflow-x-auto justify-start">
                <TabsTrigger value="tracker" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap">
                <CreditCard className="h-4 w-4" />
                تسجيل دفعة
                </TabsTrigger>
                <TabsTrigger value="outstanding" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap">
                <AlertCircle className="h-4 w-4" />
                المتأخرات
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-xl py-3 font-black flex-1 gap-2 whitespace-nowrap">
                <Settings className="h-4 w-4" />
                الفترة المحاسبية
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
                            كشف المتأخرات المالية الذكي
                        </CardTitle>
                        <CardDescription>عرض الطلاب الذين لم يسددوا الرسوم ضمن الفترة المحددة فقط.</CardDescription>
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
                            <ArrowRightLeft className="h-5 w-5 text-amber-600" />
                            ضبط الفترة المحاسبية
                        </CardTitle>
                        <CardDescription>حدد متى يبدأ العام الدراسي ومتى ينتهي لحساب المتأخرات بدقة.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {/* قسم البداية */}
                           <div className="space-y-4 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                              <h4 className="font-black text-sm text-primary flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> بداية الفترة
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 px-1">السنة</label>
                                    <Select value={startYear} onValueChange={setStartYear}>
                                        <SelectTrigger className="h-11 rounded-xl bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 px-1">الشهر</label>
                                    <Select value={startMonth} onValueChange={setStartMonth}>
                                        <SelectTrigger className="h-11 rounded-xl bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                              </div>
                           </div>

                           {/* قسم النهاية */}
                           <div className="space-y-4 p-5 rounded-3xl bg-emerald-50/30 border border-emerald-100">
                              <h4 className="font-black text-sm text-emerald-600 flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> نهاية الفترة
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 px-1">السنة</label>
                                    <Select value={endYear} onValueChange={setEndYear}>
                                        <SelectTrigger className="h-11 rounded-xl bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 px-1">الشهر</label>
                                    <Select value={endMonth} onValueChange={setEndMonth}>
                                        <SelectTrigger className="h-11 rounded-xl bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                            <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h5 className="font-black text-blue-900 text-sm">كيف يعمل النظام الذكي؟</h5>
                                <p className="text-[11px] text-blue-700 leading-relaxed font-bold">
                                    سيقوم النظام بحساب الشهور المطلوبة من الطلاب بدءاً من "تاريخ البداية". ولن يطالبهم بأي مبالغ بعد "تاريخ النهاية". 
                                    كما سيتم تجاهل الشهور التي لم تأتِ بعد داخل هذا النطاق، مما يضمن تقارير مالية دقيقة دائماً.
                                </p>
                            </div>
                        </div>

                        <Button 
                            onClick={handleSaveSettings} 
                            disabled={isSaving || isLoading}
                            className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            تفعيل الفترة المحاسبية
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
