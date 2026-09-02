
'use client';

import { useState, useEffect } from 'react';
import { useSchedule } from '@/hooks/use-app-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, Save, Loader2, Info, Plus, Trash2, GraduationCap, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScheduleSession } from '@/lib/definitions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DAYS = [
  { id: 'Saturday', label: 'السبت' },
  { id: 'Sunday', label: 'الأحد' },
  { id: 'Monday', label: 'الأثنين' },
  { id: 'Tuesday', label: 'الثلاثاء' },
  { id: 'Wednesday', label: 'الأربعاء' },
  { id: 'Thursday', label: 'الخميس' },
  { id: 'Friday', label: 'الجمعة' },
];

const GRADES = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي', 'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
];

export default function ScheduleSettings() {
  const { schedule, isLoading, updateSchedule } = useSchedule();
  const { toast } = useToast();
  
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);

  useEffect(() => {
    if (schedule) {
      setIsActive(schedule.isActive || false);
      setSessions(schedule.sessions || []);
    }
  }, [schedule]);

  const addSession = () => {
    const newSession: ScheduleSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: `مجموعة جديدة ${sessions.length + 1}`,
      grade: GRADES[0],
      days: ['Saturday'],
      startTime: '08:00',
      endTime: '10:00'
    };
    setSessions([...sessions, newSession]);
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const updateSession = (id: string, data: Partial<ScheduleSession>) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const toggleDayInSession = (sessionId: string, dayId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const newDays = session.days.includes(dayId)
      ? session.days.filter(d => d !== dayId)
      : [...session.days, dayId];
    
    updateSession(sessionId, { days: newDays });
  };

  const handleSave = () => {
    updateSchedule({
      isActive,
      sessions
    });
    toast({
      title: "تم حفظ المجموعات",
      description: "تم تحديث جدول المجموعات بنجاح."
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
                    <CardTitle className="text-xl flex items-center gap-2 text-primary">
                        <Users className="h-6 w-6" />
                        إدارة المجموعات الدراسية
                    </CardTitle>
                    <CardDescription>قم بتعريف المجموعات وتحديد مواعيدها لربط الطلاب بها.</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border shadow-sm">
                    <Label htmlFor="active-schedule" className="font-bold text-xs">تفعيل النظام</Label>
                    <Switch 
                        id="active-schedule" 
                        checked={isActive} 
                        onCheckedChange={setIsActive}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          <div className="space-y-6">
            {sessions.map((session, index) => (
              <div key={session.id} className="relative p-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 space-y-6 group animate-in fade-in slide-in-from-right-4 duration-300">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeSession(session.id)}
                    className="absolute -top-3 -left-3 bg-white shadow-md rounded-full text-rose-500 hover:bg-rose-50 border border-rose-100 h-9 w-9"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs text-slate-500">اسم المجموعة</Label>
                        <Input 
                            placeholder="مثال: مجموعة الأحد 10 ص"
                            className="h-12 rounded-xl bg-white font-bold"
                            value={session.name}
                            onChange={(e) => updateSession(session.id, { name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold text-xs flex items-center gap-2 text-slate-500">
                            <GraduationCap className="h-3 w-3" /> الصف الدراسي
                        </Label>
                        <Select value={session.grade} onValueChange={(val) => updateSession(session.id, { grade: val })}>
                            <SelectTrigger className="rounded-xl h-12 bg-white font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {GRADES.map(g => (
                                    <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs text-slate-500">بداية الحصة</Label>
                            <Input 
                                type="time" 
                                className="h-12 rounded-xl bg-white text-center font-black"
                                value={session.startTime}
                                onChange={(e) => updateSession(session.id, { startTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs text-slate-500">نهاية الحصة</Label>
                            <Input 
                                type="time" 
                                className="h-12 rounded-xl bg-white text-center font-black"
                                value={session.endTime}
                                onChange={(e) => updateSession(session.id, { endTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="font-bold text-xs text-slate-500 flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> أيام المحاضرات لهذه المجموعة
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => (
                            <button
                                key={day.id}
                                onClick={() => toggleDayInSession(session.id, day.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${
                                    session.days.includes(day.id)
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-primary/30'
                                }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            ))}

            <Button 
                variant="outline" 
                onClick={addSession}
                className="w-full h-16 rounded-[1.5rem] border-dashed border-2 text-slate-400 hover:text-primary hover:border-primary/50 transition-all bg-slate-50/30 font-black gap-2"
            >
                <Plus className="h-5 w-5" />
                إضافة مجموعة دراسية جديدة
            </Button>
          </div>

          <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
            <Info className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
                <h4 className="font-black text-blue-900 text-sm">كيفية العمل:</h4>
                <p className="text-xs text-blue-700/80 leading-relaxed font-bold">
                    بعد إضافة المجموعات، اذهب لصفحة "الطلاب" وقم بتعديل بيانات الطالب لتختار مجموعته. سيقوم النظام تلقائياً بمنع تسجيل حضوره إلا في موعد مجموعته المخصص.
                </p>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full h-16 rounded-[1.5rem] font-black text-xl gap-3 shadow-xl shadow-primary/20 bg-primary hover:bg-indigo-700"
          >
            <Save className="h-6 w-6" />
            حفظ كافة المجموعات
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
