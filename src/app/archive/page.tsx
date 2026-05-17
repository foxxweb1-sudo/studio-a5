'use client';

import { useState, useMemo } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function GlobalArchivePage() {
  const router = useRouter();
  const { students, isLoading, updateStudent, deleteStudent } = useStudents();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const archivedStudents = useMemo(() => 
    students.filter(s => s.isArchived), 
  [students]);

  const filtered = archivedStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = (studentId: string, name: string) => {
    updateStudent(studentId, { isArchived: false });
    toast({ title: 'تمت الاستعادة', description: `تم نقل الطالب ${name} إلى القائمة النشطة.` });
  };

  const handleDelete = (studentId: string) => {
    deleteStudent(studentId);
    toast({ variant: 'destructive', title: 'تم الحذف النهائي', description: 'تم مسح بيانات الطالب تماماً من النظام.' });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
               <Archive className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">أرشيف الطلاب العام</PageHeaderTitle>
          </div>
          <PageHeaderDescription>إدارة كافة الطلاب غير النشطين المستبعدين من القوائم اليومية.</PageHeaderDescription>
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

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="ابحث في الأرشيف..." 
                    className="pr-10 rounded-xl h-11 bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-bold bg-amber-50 text-amber-700 border-amber-100">
                {archivedStudents.length} طالب في الأرشيف
            </Badge>
        </div>

        <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                        <p className="text-slate-400 font-bold">جاري تحميل الأرشيف...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-right px-8 font-black">اسم الطالب</TableHead>
                                <TableHead className="text-right font-black">الصف الدراسي</TableHead>
                                <TableHead className="text-center font-black">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((student) => (
                                <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-8 py-5 font-bold text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-slate-300" />
                                            {student.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs font-bold text-slate-500">{student.grade}</TableCell>
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
                                                            هل أنت متأكد من حذف الطالب ({student.name}) نهائياً؟ سيتم مسح كافة سجلات حضوره ومدفوعاته ولا يمكن التراجع عن هذا الإجراء.
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
                ) : (
                    <div className="py-24 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed">
                            <Archive className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold">لا يوجد طلاب في الأرشيف حالياً.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}