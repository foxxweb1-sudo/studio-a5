
'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStudents, useExams } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2, User, Trophy, Calendar } from 'lucide-react';

const examFormSchema = z.object({
  studentId: z.string().min(1, 'يرجى اختيار طالب.'),
  score: z.coerce.number().min(0, 'الدرجة مطلوبة.'),
  totalScore: z.coerce.number().min(1, 'يجب أن تكون الدرجة النهائية 1 على الأقل.'),
  date: z.string().min(1, 'التاريخ مطلوب.'),
});

interface ExamRecorderProps {
  gradeFilter?: string;
}

export default function ExamRecorder({ gradeFilter }: ExamRecorderProps) {
  const { students: allStudents, isLoading: studentsLoading } = useStudents();
  const { addExamResult, isLoading: examsLoading } = useExams();
  const { toast } = useToast();

  const activeStudents = useMemo(() => 
    allStudents.filter(s => !s.isArchived && (!gradeFilter || s.grade === gradeFilter)),
  [allStudents, gradeFilter]);

  const form = useForm<z.infer<typeof examFormSchema>>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      studentId: '',
      score: 0,
      totalScore: 100,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (values: z.infer<typeof examFormSchema>) => {
    if (values.score > values.totalScore) {
        toast({ variant: "destructive", title: "خطأ في الدرجة", description: "درجة الطالب لا يمكن أن تتجاوز الدرجة النهائية." });
        return;
    }

    addExamResult(values);
    toast({ title: "تم الحفظ", description: "تم تسجيل درجة الطالب بنجاح." });
    
    // إعادة تعيين فقط حقل الطالب والدرجة
    form.setValue('studentId', '');
    form.setValue('score', 0);
  };

  const isLoading = studentsLoading || examsLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-bold flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-500" />
                            اسم الطالب
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || activeStudents.length === 0}>
                            <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-indigo-500">
                                    <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر طالباً..."} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl">
                                {activeStudents.map((student) => (
                                    <SelectItem key={student.id} value={student.id} className="font-bold">
                                        {student.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-bold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            تاريخ الإمتحان
                        </FormLabel>
                        <FormControl>
                            <Input type="date" className="h-14 rounded-2xl bg-slate-50 border-0 text-center font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <FormField
                control={form.control}
                name="totalScore"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-black text-xs text-slate-500 uppercase tracking-widest text-center block mb-2">
                            الدرجة النهائية للإمتحان
                        </FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    placeholder="100" 
                                    className="h-16 rounded-2xl bg-white border-2 border-slate-100 text-center text-3xl font-black text-indigo-600 focus:border-indigo-400" 
                                    {...field} 
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-20">MAX</div>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-black text-xs text-indigo-600 uppercase tracking-widest text-center block mb-2">
                            درجة الطالب المحققة
                        </FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    placeholder="0" 
                                    className="h-16 rounded-2xl bg-white border-2 border-indigo-100 text-center text-3xl font-black text-indigo-700 shadow-inner" 
                                    {...field} 
                                />
                                <Trophy className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-amber-400 opacity-30" />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black gap-3 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 transition-all" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
            اعتماد وحفظ النتيجة
        </Button>
      </form>
    </Form>
  );
}
