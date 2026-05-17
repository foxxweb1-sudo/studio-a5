
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useStudents } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Search, 
  Loader2, 
  GraduationCap,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const GRADES = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي', 'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
];

function ArchiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gradeFilter = searchParams.get('grade') || '';
  
  const { students, isLoading, updateStudent, deleteStudent } = useStudents();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const archivedStudents = useMemo(() => 
    students.filter(s => s.isArchived && (!gradeFilter || s.grade === gradeFilter)), 
  [students, gradeFilter]);

  const filtered = archivedStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تجميع الطلاب المؤرشفين حسب الصف الدراسي
  const groupedStudents = useMemo(() => {
    const groups: Record<string, any[]> = {};
    GRADES.forEach(g => {
        const list = filtered.filter(s => s.grade === g);
        if (list.length > 0) groups[g] = list;
    });
    return groups;
  }, [filtered]);

  const handleRestore = (studentId: string, name: string) => {
    updateStudent(studentId, { isArchived: false });
    toast({ title: 'تمت الاستعادة', description: `تم نقل الطالب ${name} إلى القائمة النشطة.` });
  };

  const handleDelete = (studentId: string) => {
    deleteStudent(studentId);
    toast({ variant: 'destructive', title: 'تم الحذف النهائي', description: 'تم مسح بيانات الطالب تماماً من النظام.' });
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
               <Archive className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">
                {gradeFilter ? `أرشيف ${gradeFilter}` : 'أرشيف الطلاب العام'}
            </PageHeaderTitle>
          </div>
          <PageHeaderDescription>
              {gradeFilter ? 'هنا تجد كافة الطلاب الذين تم استبعادهم من القوائم النشطة لهذا الصف.' : 'كافة الطلاب غير النشطين في المنظومة منظمين حسب الصف الدراسي.'}
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

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="ابحث بالاسم في الأرشيف..." 
                    className="pr-10 rounded-xl h-11 bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-bold bg-rose-50 text-rose-700 border-rose-100">
                {archivedStudents.length} طلاب مؤرشفين
            </Badge>
        </div>

        {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
                <p className="text-slate-400 font-bold">جاري تحميل البيانات...</p>
            </div>
        ) : Object.keys(groupedStudents).length > 0 ? (
            <div className="space-y-10">
                {Object.entries(groupedStudents).map(([grade, list]) => (
                    <div key={grade} className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                                <FolderOpen className="h-4 w-4" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">{grade}</h3>
                            <Badge variant="outline" className="rounded-full font-bold text-[10px]">{list.length} طالب</Badge>
                        </div>

                        <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50/80">
                                        <TableRow>
                                            <TableHead className="text-right px-8 font-black">اسم الطالب</TableHead>
                                            <TableHead className="text-center font-black">إجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {list.map((student) => (
                                            <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors border-b">
                                                <TableCell className="px-8 py-5 font-bold text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="h-4 w-4 text-slate-300" />
                                                        {student.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center px-8">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold gap-2"
                                                            onClick={() => handleRestore(student.id, student.name)}
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                            <span className="hidden sm:inline">استعادة</span>
                                                        </Button>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 rounded-full h-9 w-9">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="rounded-[2.5rem]">
                                                                <AlertDialogHeader>
                                                                    <div className="flex items-center gap-3 text-rose-600 mb-2">
                                                                        <AlertTriangle className="h-6 w-6" />
                                                                        <AlertDialogTitle className="text-right font-black">حذف نهائي للطالب</AlertDialogTitle>
                                                                    </div>
                                                                    <AlertDialogDescription className="text-right font-bold leading-relaxed">
                                                                        هل أنت متأكد من حذف الطالب ({student.name}) نهائياً؟ سيتم مسح كافة السجلات ولا يمكن التراجع.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter className="flex-row-reverse gap-2">
                                                                    <AlertDialogAction 
                                                                        onClick={() => handleDelete(student.id)} 
                                                                        className="bg-destructive hover:bg-destructive/90 rounded-xl px-8"
                                                                    >
                                                                        حذف نهائي
                                                                    </AlertDialogAction>
                                                                    <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        ) : (
            <div className="py-24 text-center space-y-4 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto border-2 border-dashed shadow-sm">
                    <Archive className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-black">لا توجد سجلات مؤرشفة لهذا العرض حالياً.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default function GlobalArchivePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto" /></div>}>
        <ArchiveContent />
    </Suspense>
  );
}
