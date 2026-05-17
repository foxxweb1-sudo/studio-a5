
'use client';

import { useState, useEffect } from 'react';
import { useSchedule } from '@/hooks/use-app-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, Save, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DAYS = [
  { id: 'Saturday', label: 'السبت' },
  { id: 'Sunday', label: 'الأحد' },
  { id: 'Monday', label: 'الأثنين' },
  { id: 'Tuesday', label: 'الثلاثاء' },
  { id: 'Wednesday', label: 'الأربعاء' },
  { id: 'Thursday', label: 'الخميس' },
  { id: 'Friday', label: 'الجمعة' },
];

export default function ScheduleSettings() {
  const { schedule, isLoading, updateSchedule } = useSchedule();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    workingDays: [] as string[],
    startTime: '08:00',
    endTime: '16:00',
    isActive: false,
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        workingDays: schedule.workingDays || [],
        startTime: schedule.startTime || '08:00',
        endTime: schedule.endTime || '16:00',
        isActive: schedule.isActive || false,
      });
    }
  }, [schedule]);

  const handleDayToggle = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayId)
        ? prev.workingDays.filter(d => d !== dayId)
        : [...prev.workingDays, dayId]
    }));
  };

  const handleSave = () => {
    updateSchedule(formData);
    toast({
      title: "تم حفظ المواعيد",
      description: "سيتم تطبيق هذه المواعيد على نظام الحضور الخاص بك."
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        ضبط مواعيد العمل
                    </CardTitle>
                    <CardDescription>حدد الأيام والساعات المتاحة لتسجيل الحضور.</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border shadow-sm">
                    <Label htmlFor="active-schedule" className="font-bold text-xs">تفعيل النظام</Label>
                    <Switch 
                        id="active-schedule" 
                        checked={formData.isActive} 
                        onCheckedChange={(val) => setFormData({...formData, isActive: val})}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="space-y-4">
            <h4 className="font-black text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-500" />
                أيام العمل في الأسبوع
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {DAYS.map((day) => (
                <div 
                    key={day.id} 
                    onClick={() => handleDayToggle(day.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        formData.workingDays.includes(day.id) 
                        ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
                        : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                    }`}
                >
                    <Checkbox 
                        checked={formData.workingDays.includes(day.id)} 
                        className="hidden"
                    />
                    <span className="font-black text-sm">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-dashed">
            <div className="space-y-3">
                <Label className="font-black text-sm">وقت بداية اليوم الدراسي</Label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        type="time" 
                        className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-center font-black text-lg"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    />
                </div>
            </div>
            <div className="space-y-3">
                <Label className="font-black text-sm">وقت نهاية اليوم الدراسي</Label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        type="time" 
                        className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-center font-black text-lg"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    />
                </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed font-bold">
                * ملاحظة: تفعيل مواعيد العمل يساعدك على تنظيم التقارير وضمان عدم تسجيل حضور في غير أوقات العمل الرسمية.
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20"
          >
            <Save className="h-5 w-5" />
            حفظ إعدادات المواعيد
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
