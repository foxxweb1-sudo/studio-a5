
'use client';

import { useState, useMemo } from 'react';
import { usePaymentSettings } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Calendar, Plus, Trash2, GraduationCap, History, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

  const [isAdding, setIsAdding] = useState(false);
  const [selectedGradeForAdd, setSelectedGradeForAdd] = useState<string | null>(null);

  // نموذج إضافة فترة مؤقت
  const [tempPeriod, setTempPeriod] = useState({
    startYear: new Date().getFullYear().toString(),
    startMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    endYear: new Date().getFullYear().toString(),
    endMonth: '12'
  });

  const handleAddPeriod = async () => {
    if (!selectedGradeForAdd) return;
    setIsAdding(true);
    try {
      const currentGradePeriods = settings?.grades?.[selectedGradeForAdd]?.periods || [];
      const newPeriod = {
        id: Math.random().toString(36).substring(2, 9),
        startMonth: `${tempPeriod.startYear}-${tempPeriod.startMonth}`,
        endMonth: `${tempPeriod.endYear}-${tempPeriod.endMonth}`
      };

      const updatedPeriods = [...currentGradePeriods, newPeriod];
      await updateGradeSettings(selectedGradeForAdd, { periods: updatedPeriods });
      
      toast({ title: "تمت الإضافة", description: `أضيفت فترة جديدة لـ ${selectedGradeForAdd}.` });
      setSelectedGradeForAdd(null); // إغلاق النافذة
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePeriod = async (grade: string, id: string) => {
    try {
      const gradeConfig = settings?.grades?.[grade];
      if (!gradeConfig || !Array.isArray(gradeConfig.periods)) return;

      const updatedPeriods = gradeConfig.periods.filter(p => p.id !== id);
      await updateGradeSettings(grade, { periods: updatedPeriods });
      toast({ title: "تم الحذف", description: "تمت إزالة الفترة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const formatPeriodDates = (period: any) => {
    try {
      const start = format(parse(period.startMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar });
      const end = format(parse(period.endMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ar });
      return { start, end };
    } catch (e) {
      return { start: '...', end: '...' };
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
               <History className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">إدارة الفترات المحاسبية</PageHeaderTitle>
          </div>
          <PageHeaderDescription>
            تحكم في شهور الاستحقاق لكل صف دراسي بشكل مستقل لضمان دقة كشوف المتأخرات.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GRADES.map((grade) => {
            const periods = settings?.grades?.[grade]?.periods || [];
            return (
                <Card key={grade} className="border-0 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 flex flex-col overflow-hidden hover:shadow-md transition-all border-t-4 border-t-primary/20">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-6 pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                <CardTitle className="text-sm font-black">{grade}</CardTitle>
                            </div>
                            <Badge variant="secondary" className="rounded-full px-2 h-6 text-[10px] font-bold">
                                {periods.length} فترات
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-grow flex flex-col gap-4">
                        {periods.length > 0 ? (
                            <div className="space-y-3">
                                {periods.map((p: any) => {
                                    const dates = formatPeriodDates(p);
                                    return (
                                        <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">من</span>
                                                    <span className="text-xs font-bold text-slate-700">{dates.start}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">إلى</span>
                                                    <span className="text-xs font-bold text-slate-700">{dates.end}</span>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute -top-2 -left-2 h-7 w-7 rounded-full bg-white border border-rose-100 text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeletePeriod(grade, p.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center py-6 text-center text-slate-300">
                                <Calendar className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-[10px] font-bold italic">لا توجد فترات مسجلة</p>
                            </div>
                        )}

                        <Dialog open={selectedGradeForAdd === grade} onOpenChange={(open) => !open && setSelectedGradeForAdd(null)}>
                            <DialogTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="w-full h-11 rounded-xl font-bold gap-2 border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 text-slate-500 hover:text-primary transition-all"
                                    onClick={() => setSelectedGradeForAdd(grade)}
                                >
                                    <Plus className="h-4 w-4" />
                                    إضافة فترة
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-right text-xl font-black flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Plus className="h-5 w-5 text-primary" />
                                        </div>
                                        إضافة فترة لـ {grade.split(' ')[1]}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div className="grid grid-cols-1 gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div className="space-y-3">
                                            <Label className="font-bold text-xs text-primary flex items-center gap-2">
                                                <Calendar className="h-3 w-3" /> بداية الفترة
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Select value={tempPeriod.startYear} onValueChange={(val) => setTempPeriod({...tempPeriod, startYear: val})}>
                                                    <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm font-bold text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Select value={tempPeriod.startMonth} onValueChange={(val) => setTempPeriod({...tempPeriod, startMonth: val})}>
                                                    <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm font-bold text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="font-bold text-xs text-emerald-600 flex items-center gap-2">
                                                <Calendar className="h-3 w-3" /> نهاية الفترة
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Select value={tempPeriod.endYear} onValueChange={(val) => setTempPeriod({...tempPeriod, endYear: val})}>
                                                    <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm font-bold text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Select value={tempPeriod.endMonth} onValueChange={(val) => setTempPeriod({...tempPeriod, endMonth: val})}>
                                                    <SelectTrigger className="h-11 rounded-xl bg-white border-0 shadow-sm font-bold text-xs"><SelectValue /></SelectTrigger>
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
                                        className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20"
                                    >
                                        {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                        تأكيد الاعتماد
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
}

