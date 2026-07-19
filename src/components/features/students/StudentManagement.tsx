
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStudents } from '@/hooks/use-app-data';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Search, QrCode, Loader2, Trash2, Edit, GraduationCap, Archive, Filter, MoreVertical, Share2, Info } from 'lucide-react';
import { Student } from '@/lib/definitions';
import StudentQRCodeDialog from './StudentQRCodeDialog';
import { useSearchParams } from 'next/navigation';
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
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GRADES = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي', 'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
];

const formSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب.'),
  grade: z.string().min(1, 'يرجى اختيار الصف الدراسي.'),
  parentPhone: z.string().optional(),
});

export default function StudentManagement() {
  const searchParams = useSearchParams();
  const gradeFromUrl = searchParams.get('grade') || '';
  const { user } = useUser();
  
  const { students, addStudent, isLoading, deleteStudent, updateStudent } = useStudents();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForQR, setSelectedStudentForQR] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      grade: gradeFromUrl || '',
      parentPhone: '',
    },
  });

  useEffect(() => {
    if (gradeFromUrl && !editingStudent) {
      form.setValue('grade', gradeFromUrl, { shouldValidate: true });
    }
  }, [gradeFromUrl, form, editingStudent]);

  useEffect(() => {
    if (editingStudent) {
      form.reset({
        name: editingStudent.name,
        grade: editingStudent.grade,
        parentPhone: editingStudent.parentPhone || '',
      });
    } else {
      form.reset({
        name: '',
        grade: gradeFromUrl || '',
        parentPhone: '',
      });
    }
  }, [editingStudent, form, gradeFromUrl]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, { ...editingStudent, ...values });
      toast({ title: 'تم التعديل', description: `تم تعديل بيانات الطالب ${values.name}.` });
      setEditingStudent(null);
    } else {
      addStudent({ ...values, isArchived: false });
      toast({
        title: 'تم تسجيل الطالب',
        description: `تم إضافة الطالب ${values.name} بنجاح.`,
      });
    }
    form.reset({ name: '', grade: gradeFromUrl || '', parentPhone: '' });
  };
  
  const handleDelete = (studentId: string) => {
    deleteStudent(studentId);
    toast({ variant: "destructive", title: "تم الحذف", description: "تم مسح بيانات الطالب." });
  };

  const handleArchive = (student: Student) => {
    updateStudent(student.id, { isArchived: !student.isArchived });
    toast({
      title: student.isArchived ? "تمت الاستعادة" : "تمت الأرشفة",
      description: student.isArchived ? `تم نقل ${student.name} للطلاب النشطين.` : `تم نقل ${student.name} للأرشيف.`
    });
  };

  const handleShareLink = (studentId: string, studentName: string) => {
    // إظهار رسالة الـ Beta
    toast({
      variant: "default",
      title: "النظام في وضع Beta",
      description: "ميزة روابط المتابعة للأهل قيد التطوير حالياً، سيتم توفيرها بكافة إمكانياتها قريباً.",
    });

    if (!user) return;
    const shareUrl = `${window.location.origin}/p/${user.uid}/${studentId}`;
    
    if (navigator.share) {
        navigator.share({
            title: `رابط متابعة الطالب: ${studentName}`,
            text: `يمكنكم متابعة حالة الطالب ${studentName} عبر هذا الرابط:`,
            url: shareUrl
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "تم نسخ رابط المتابعة", description: "يمكنك الآن إرساله لولي الأمر." });
    }
  };

  const activeStudents = useMemo(() => students.filter(s => !s.isArchived), [students]);

  const renderStudentTable = (list: Student[], emptyMessage: string = "لا يوجد طلاب هنا حالياً.") => {
    const filtered = list.filter(student => 
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!gradeFromUrl || student.grade === gradeFromUrl)
    );

    return (
        <div className="max-h-[40rem] overflow-auto">
            <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow>
                    <TableHead className="text-right font-black px-6">الاسم</TableHead>
                    {!gradeFromUrl && <TableHead className="text-right font-black">الفصل</TableHead>}
                    <TableHead className="text-center font-black">إجراءات</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filtered.length > 0 ? (
                    filtered.map((student) => (
                    <TableRow key={student.id} className="group hover:bg-primary/5 transition-colors">
                        <TableCell className="font-bold py-4 px-6">
                            <div className="flex flex-col gap-1">
                            <Link href={`/students/${student.id}`} className="hover:underline text-primary flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 opacity-50" />
                                {student.name}
                            </Link>
                            </div>
                        </TableCell>
                        {!gradeFromUrl && <TableCell className="text-[10px] font-bold text-slate-500">{student.grade}</TableCell>}
                        <TableCell className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" title="QR Code" className="rounded-xl h-8 w-8" onClick={() => setSelectedStudentForQR(student)}>
                            <QrCode className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="مشاركة الرابط للأهل" className="rounded-xl h-8 w-8 text-emerald-600" onClick={() => handleShareLink(student.id, student.name)}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="تعديل" className="rounded-xl text-blue-500 h-8 w-8" onClick={() => setEditingStudent(student)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-1 w-40">
                                <DropdownMenuItem 
                                    className="rounded-lg gap-2 font-bold text-amber-600 focus:bg-amber-50"
                                    onClick={() => handleArchive(student)}
                                >
                                    <Archive className="h-4 w-4" />
                                    أرشفة الطالب
                                </DropdownMenuItem>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 font-bold text-destructive hover:bg-rose-50">
                                            <Trash2 className="h-4 w-4" />
                                            حذف نهائي
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-[2rem]">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-right">هل أنت متأكد؟</AlertDialogTitle>
                                            <AlertDialogDescription className="text-right">
                                            هذا الإجراء سيحذف الطالب ({student.name}) نهائياً بكافة سجلاته. لا يمكن التراجع.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex-row-reverse gap-2">
                                            <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                                            حذف
                                            </AlertDialogAction>
                                            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground font-bold italic">
                        {list.length === 0 ? emptyMessage : "لا توجد نتائج بحث مطابقة."}
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden sticky top-20">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2">
                {editingStudent ? <Edit className="h-5 w-5 text-blue-500" /> : <UserPlus className="h-5 w-5 text-primary" />}
                {editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد'}
            </CardTitle>
             <CardDescription>
                 {gradeFromUrl && !editingStudent ? `إضافة إلى: ${gradeFromUrl}` : 'أدخل بيانات الطالب والصف الدراسي أدناه.'}
             </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">اسم الطالب</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم الكامل" className="rounded-xl h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">الصف الدراسي</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!!gradeFromUrl && !editingStudent}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-white font-bold">
                            <SelectValue placeholder="اختر الصف..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {GRADES.map(g => (
                            <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">هاتف ولي الأمر (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم هاتف ولي الأمر" className="rounded-xl h-12" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : editingStudent ? <Edit className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {editingStudent ? 'حفظ التعديلات' : 'إضافة طالب للمنظومة'}
                </Button>
                 {editingStudent && <Button variant="ghost" className="w-full rounded-xl" onClick={() => setEditingStudent(null)}>إلغاء التعديل</Button>}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-black text-lg">فرز وتصفية</h3>
                    <p className="text-[10px] text-muted-foreground font-bold">ابحث في قائمة طلابك النشطين</p>
                </div>
            </div>
            <div className="relative w-full sm:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="ابحث بالاسم هنا..."
                    className="pr-10 h-11 rounded-xl bg-slate-50 border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl">الطلاب النشطين</CardTitle>
                    <CardDescription>اضغط على <Share2 className="inline h-3 w-3" /> لمشاركة رابط المتابعة مع الأهل.</CardDescription>
                </div>
                <Badge className="bg-primary hover:bg-primary rounded-xl h-10 px-4 font-black">
                    {activeStudents.filter(s => !gradeFromUrl || s.grade === gradeFromUrl).length} طالب
                </Badge>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin inline-block h-8 w-8 text-primary/20" /></div>
                ) : renderStudentTable(activeStudents, "لا يوجد طلاب نشطون حالياً في هذا العرض.")}
            </CardContent>
        </Card>
      </div>
      
      {selectedStudentForQR && (
        <StudentQRCodeDialog 
          student={selectedStudentForQR} 
          open={!!selectedStudentForQR} 
          onOpenChange={(isOpen) => !isOpen && setSelectedStudentForQR(null)}
        />
      )}
    </div>
  );
}
