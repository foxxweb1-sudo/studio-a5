
'use client';

import { useMemo } from 'react';
import { useStudents, useExams } from '@/hooks/use-app-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2, Trash2, Trophy, GraduationCap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExamHistoryProps {
  gradeFilter?: string;
}

export default function ExamHistory({ gradeFilter }: ExamHistoryProps) {
  const { students, isLoading: studentsLoading } = useStudents();
  const { exams, deleteExamResult, isLoading: examsLoading } = useExams();
  const { toast } = useToast();

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const student = students.find((s) => s.id === exam.studentId);
      if (!student) return false;
      return !gradeFilter || student.grade === gradeFilter;
    });
  }, [exams, students, gradeFilter]);

  const isLoading = studentsLoading || examsLoading;

  const handleDelete = (id: string) => {
    deleteExamResult(id);
    toast({ title: "تم الحذف", description: "تم مسح سجل الدرجة بنجاح." });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-300" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {filteredExams.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right px-8 py-5 font-black text-slate-400">الطالب</TableHead>
                <TableHead className="text-center py-5 font-black text-slate-400">الدرجة</TableHead>
                <TableHead className="text-center py-5 font-black text-slate-400">النسبة</TableHead>
                <TableHead className="text-right py-5 font-black text-slate-400">تاريخ الإمتحان</TableHead>
                <TableHead className="text-center py-5 font-black text-slate-400">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => {
                const student = students.find((s) => s.id === exam.studentId);
                const percentage = Math.round((exam.score / exam.totalScore) * 100);
                
                return (
                  <TableRow key={exam.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <GraduationCap className="h-4 w-4" />
                            </div>
                            <span className="font-black text-slate-800">{student?.name || 'طالب غير متوفر'}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <span className="font-black text-indigo-600 text-lg">{exam.score}</span>
                            <span className="text-[10px] font-bold text-slate-400">/ {exam.totalScore}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant="outline" className={`rounded-full px-3 py-1 font-black text-[10px] ${
                            percentage >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            percentage >= 75 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            percentage >= 50 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                            {percentage}%
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Calendar className="h-3.5 w-3.5 opacity-40" />
                            {format(new Date(exam.date), 'd MMMM yyyy', { locale: ar })}
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2.5rem]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-right font-black">حذف سجل الدرجة؟</AlertDialogTitle>
                                    <AlertDialogDescription className="text-right font-bold">
                                        سيتم مسح درجة هذا الامتحان للطالب نهائياً. هل أنت متأكد؟
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-row-reverse gap-2">
                                    <AlertDialogAction onClick={() => handleDelete(exam.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl">نعم، حذف</AlertDialogAction>
                                    <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-indigo-100">
                <Trophy className="h-10 w-10 text-indigo-300 opacity-30" />
            </div>
            <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-400">لا توجد درجات مسجلة</h4>
                <p className="text-xs text-slate-400 font-bold">ابدأ بتسجيل أول درجة لطلابك من تبويب "تسجيل درجات جديدة".</p>
            </div>
        </div>
      )}
    </div>
  );
}
