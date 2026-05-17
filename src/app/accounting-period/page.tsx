
'use client';

import { useState, useMemo } from 'react';
import { usePaymentSettings } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Calendar, Plus, Trash2, Info, ArrowRight, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

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
  const [isAdding, setIsAdding] = useState(false);

  // استخراج الفترات الحالية للصف المختار
  const currentPeriods = useMemo(() => {
    const gradeConfig = settings?.grades?.[selectedGrade];
    if (!gradeConfig) return [];
    // توافق مع البيانات القديمة أو الهيكل الجديد
    return Array.isArray(gradeConfig.periods) ? gradeConfig.periods : [];
  }, [selectedGrade, settings]);

  const handleAddPeriod = async () => {
    setIsAdding(true);
    try {
      const newPeriod = {
        id: Math.random().toString(36).substring(2, 9),
        startMonth: `${startYear}-${startMonth}`,
        endMonth: `${endYear}-${endMonth}`
      };

      const updatedPeriods = [...currentPeriods, newPeriod];
      await updateGradeSettings(selectedGrade, { periods: updatedPeriods });
      
      toast({ title: "تمت الإضافة", description: "تمت إضافة فترة محاسبية جديدة." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePeriod = async (id: string) => {
    try {
      const updatedPeriods = currentPeriods.filter(p => p.id !== id);
      await updateGradeSettings(selectedGrade, { periods: updatedPeriods });
      toast({ title: "تم الحذف", description: "تمت إزالة الفترة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const formatPeriodName = (period: any) => {
    try {
      const start = format(parse(period.startMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar });
      const end = format(parse(period.endMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar });
      return { start, end };
    } catch (e) {
      return { start: '...', end: '...' };
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
               <History className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">إدارة الفترات المحاسبية</PageHeaderTitle>
          </div>
          <PageHeaderDescription>
            حدد فترات العمل لكل صف (مثلاً: الترم الأول، الكورس الصيفي).
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 h-12 px-6 font-bold"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* الجانب الأيمن: إضافة فترة جديدة */}
          <div className="lg:col-span-5 space-y-6">
              <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6">
                      <CardTitle className="text-lg flex items-center gap-2">
                          <Plus className="h-5 w-5 text-primary" />
                          إضافة فترة جديدة
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                      <div className="space-y-3">
                          <Label className="font-bold text-xs text-slate-400 px-1">اختر الصف الدراسي</Label>
                          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 font-bold">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                  {GRADES.map(g => <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>

                      <div className="grid grid-cols-1 gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                          <div className="space-y-3">
                              <Label className="font-bold text-[10px] text-primary flex items-center gap-2">
                                  <Calendar className="h-3 w-3" /> بداية الفترة
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                  <Select value={startYear} onValueChange={setStartYear}>
                                      <SelectTrigger className="h-10 rounded-lg bg-white border-0 shadow-sm text-xs"><SelectValue /></SelectTrigger>
                                      <SelectContent className="rounded-xl">
                                          {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                                  <Select value={startMonth} onValueChange={setStartMonth}>
                                      <SelectTrigger className="h-10 rounded-lg bg-white border-0 shadow-sm text-xs"><SelectValue /></SelectTrigger>
                                      <SelectContent className="rounded-xl">
                                          {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                              </div>
                          </div>

                          <div className="space-y-3">
                              <Label className="font-bold text-[10px] text-emerald-600 flex items-center gap-2">
                                  <Calendar className="h-3 w-3" /> نهاية الفترة
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                  <Select value={endYear} onValueChange={setEndYear}>
                                      <SelectTrigger className="h-10 rounded-lg bg-white border-0 shadow-sm text-xs"><SelectValue /></SelectTrigger>
                                      <SelectContent className="rounded-xl">
                                          {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                                  <Select value={endMonth} onValueChange={setEndMonth}>
                                      <SelectTrigger className="h-10 rounded-lg bg-white border-0 shadow-sm text-xs"><SelectValue /></SelectTrigger>
                                      <SelectContent className="rounded-xl">
                                          {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                              </div>
                          </div>
                      </div>

                      <Button 
                        onClick={handleAddPeriod} 
                        disabled={isAdding || settingsLoading}
                        className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                      >
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        اعتماد هذه الفترة لـ {selectedGrade.split(' ')[1]}
                      </Button>
                  </CardContent>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
                    يمكنك إضافة أكثر من فترة لنفس الصف، وسيقوم النظام بجمع كافة الشهور المستحقة من جميع الفترات تلقائياً.
                </p>
              </div>
          </div>

          {/* الجانب الأيسر: عرض الفترات الحالية */}
          <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-2">
                  <h3 className="font-black text-slate-500 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      الفترات المسجلة لـ ({selectedGrade})
                  </h3>
                  <Badge variant="secondary" className="rounded-full px-4 font-bold bg-slate-100">{currentPeriods.length} فترات</Badge>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-auto pr-1">
                  {currentPeriods.length > 0 ? currentPeriods.map((period) => {
                      const names = formatPeriodName(period);
                      return (
                        <Card key={period.id} className="border-0 shadow-sm rounded-3xl bg-white dark:bg-slate-900 border-r-4 border-r-amber-500 group hover:shadow-md transition-all">
                            <CardContent className="p-6 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">من</span>
                                            <p className="text-sm font-black text-slate-700">{names.start}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block rotate-180" />
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">إلى</span>
                                            <p className="text-sm font-black text-slate-700">{names.end}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-rose-500 hover:bg-rose-50 rounded-full"
                                    onClick={() => handleDeletePeriod(period.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                      );
                  }) : (
                    <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <History className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold">لا توجد فترات محاسبية مسجلة لهذا الصف حتى الآن.</p>
                    </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
