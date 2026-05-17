
"use client";

import { useState, useEffect } from 'react';
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
import { UserPlus, Search, QrCode, Loader2, Trash2, Edit, Share2, GraduationCap } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      addStudent(values);
      toast({
        title: 'تم تسجيل الطالب',
        description: `تم إضافة الطالب ${values.name} بنجاح.`,
      });
    }
    form.reset({ name: '', grade: gradeFromUrl || '', parentPhone: '' });
  };
  
  const handleDelete = (studentId: string) => {
    deleteStudent(studentId);
    toast({
        variant: "destructive",
        title: "تم الحذف",
        description: "تم حذف الطالب بنجاح."
    });
  }

  const handleShareParentLink = (student: Student) => {
    if (!user) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/p/${user.uid}/${student.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `متابعة الطالب: ${student.name}`,
        text: `ولي أمر الطالب/ة: ${student.name}\nيمكنكم متابعة الحضور والمدفوعات عبر الرابط التالي:`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "تم نسخ الرابط",
        description: "يمكنك الآن إرساله لولي الأمر عبر واتساب.",
      });
    }
  };

  const filteredStudents = students.filter(student => 
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!gradeFromUrl || student.grade === gradeFromUrl)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2">
                {editingStudent ? <Edit className="h-5 w-5 text-blue-500" /> : <UserPlus className="h-5 w-5 text-primary" />}
                {editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد'}
            </CardTitle>
             {gradeFromUrl && !editingStudent ? (
                 <CardDescription>إضافة إلى: {gradeFromUrl}</CardDescription>
             ) : (
                 <CardDescription>أدخل بيانات الطالب والصف الدراسي أدناه.</CardDescription>
             )}
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
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>قائمة الطلاب {gradeFromUrl ? `(${filteredStudents.length})` : `(${students.length})`}</CardTitle>
            <CardDescription>{gradeFromUrl ? `عرض طلاب صف: ${gradeFromUrl}` : 'عرض وبحث في جميع الطلاب المسجلين بكافة الصفوف.'}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative mb-6">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو الصف..."
                className="pr-10 h-12 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-[30rem] overflow-auto">
               {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
               ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-right font-bold">الاسم</TableHead>
                      {!gradeFromUrl && <TableHead className="text-right font-bold">الفصل</TableHead>}
                      <TableHead className="text-center font-bold">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        return (
                        <TableRow key={student.id} className="group hover:bg-primary/5 transition-colors">
                          <TableCell className="font-bold py-4">
                             <Link href={`/students/${student.id}`} className="hover:underline text-primary flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 opacity-50" />
                              {student.name}
                            </Link>
                          </TableCell>
                           {!gradeFromUrl && <TableCell className="text-[10px] font-bold text-slate-500">{student.grade}</TableCell>}
                          <TableCell className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" title="رابط ولي الأمر" className="rounded-xl text-emerald-600 hover:bg-emerald-50" onClick={() => handleShareParentLink(student)}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="QR Code" className="rounded-xl" onClick={() => setSelectedStudentForQR(student)}>
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="تعديل" className="rounded-xl text-blue-500" onClick={() => setEditingStudent(student)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="حذف" className="rounded-xl text-destructive hover:bg-rose-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2rem]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-right">هل أنت متأكد؟</AlertDialogTitle>
                                  <AlertDialogDescription className="text-right">
                                    هذا الإجراء سيحذف الطالب ({student.name}) نهائياً بكافة سجلاته.
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
                          </TableCell>
                        </TableRow>
                      )})
                    ) : (
                      <TableRow>
                        <TableCell colSpan={gradeFromUrl ? 3 : 3} className="h-24 text-center text-muted-foreground font-bold italic">
                          {students.length === 0 ? "لم تقم بإضافة أي طلاب بعد." : "لم يتم العثور على نتائج للبحث."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
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
