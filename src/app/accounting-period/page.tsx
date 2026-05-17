
'use client';

import { useState, useEffect } from 'react';
import { usePaymentSettings } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Calendar, ArrowRightLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const GRADES = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي', 'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
];

const YEARS = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 1 + i).toString());
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, '0'),
  label: format(new Date(2000, i), "MMMM", { locale: ar }),
}));

export default function AccountingPeriodPage() {
  const router = useRouter();
  const { settings, updateGradeSettings, isLoading: settingsLoading } = usePaymentSettings();
  const { toast } = useToast();

  const [selectedGrade, setSelectedGrade] = useState(GRADES[0]);
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [startMonth, setStartMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());
  const [endMonth, setEndMonth] = useState('12');
  const [isSaving, setIsSaving] = useState(false);

  // تحديث الحقول عند تغيير الصف المختار أو تحميل الإعدادات
  useEffect(() => {
    if (settings?.grades?.[selectedGrade]) {
      const gConfig = settings.grades[selectedGrade];
      const [sy, sm] = gConfig.startMonth.split('-');
      setStartYear(sy);
      setStartMonth(sm);
      if (gConfig.endMonth) {
        const [ey, em] = gConfig.endMonth.split('-');
        setEndYear(ey);
        setEndMonth(em);
      }
    }
  }, [selectedGrade, settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateGradeSettings(selectedGrade, {
        startMonth: `${startYear}-${startMonth}`,
        endMonth: `${endYear}-${endMonth}`
      });
      toast({ 
        title: "تم الحفظ", 
        description: `تم تحديث الفترة المحاسبية لـ (${selectedGrade}) بنجاح.` 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
               <ArrowRightLeft className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">الفترات المحاسبية</PageHeaderTitle>
          </div>
          <PageHeaderDescription>
            حدد نطاق المتأخرات المالية لكل صف دراسي على حدة.
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all h-12 px-6 font-bold"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b p-8">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                      <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                      <CardTitle className="text-2xl font-black">تخصيص الصفوف</CardTitle>
                      <CardDescription className="text-amber-700/60 dark:text-amber-200/40 font-bold">يتم حساب المتأخرات تلقائياً ضمن هذا النطاق.</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* اختيار الصف */}
                  <div className="space-y-4">
                      <Label className="font-black text-slate-400 uppercase text-[10px] tracking-widest px-1">1. اختر الصف الدراسي</Label>
                      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 font-black text-lg">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                              {GRADES.map(g => <SelectItem key={g} value={g} className="font-bold py-3">{g}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>

                  {/* نطاق البداية والنهاية */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                          <Label className="font-black text-primary text-sm flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> 2. بداية الفترة
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                              <Select value={startYear} onValueChange={setStartYear}>
                                  <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              <Select value={startMonth} onValueChange={setStartMonth}>
                                  <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>

                      <div className="space-y-4 p-6 rounded-[2rem] bg-emerald-50/50 border border-emerald-100">
                          <Label className="font-black text-emerald-600 text-sm flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> 3. نهاية الفترة
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                              <Select value={endYear} onValueChange={setEndYear}>
                                  <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              <Select value={endMonth} onValueChange={setEndMonth}>
                                  <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-dashed">
                  <div className="flex items-start gap-3 flex-1">
                      <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                          النظام سيقوم بحساب الشهور المتأخرة لطلاب <span className="text-primary">({selectedGrade})</span> فقط ضمن هذا النطاق، ولن يطالبهم بأي مبالغ خارج هذه التواريخ.
                      </p>
                  </div>
                  <Button 
                      onClick={handleSaveSettings} 
                      disabled={isSaving || settingsLoading}
                      className="w-full md:w-auto h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 px-12 bg-primary hover:bg-primary/90"
                  >
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      حفظ إعدادات الصف
                  </Button>
              </div>
          </CardContent>
      </Card>
      
      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="p-2 bg-blue-500 rounded-xl text-white shrink-0">
            <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
            <h4 className="font-black text-blue-900 dark:text-blue-100 text-sm">لماذا تضبط الفترات؟</h4>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/60 leading-relaxed">
              تسمح لك الفترات المحاسبية بالتحكم الدقيق في متى يبدأ العام الدراسي ومتى ينتهي لكل مرحلة، مما يضمن ظهور تقارير مالية دقيقة لا تظلم الطالب ولا تضيع حق المعلم.
            </p>
        </div>
      </div>
    </div>
  );
}
