
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStudents } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Search, QrCode, Loader2, Trash2, Edit } from 'lucide-react';
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

const formSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب.'),
  parentPhone: z.string().optional(),
});

export default function StudentManagement() {
  const searchParams = useSearchParams();
  const gradeFromUrl = searchParams.get('grade') || '';
  
  const { students, addStudent, isLoading, deleteStudent, updateStudent } = useStudents();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForQR, setSelectedStudentForQR] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      parentPhone: '',
    },
  });

  useEffect(() => {
    if(gradeFromUrl){
      // @ts-ignore
      form.setValue('grade', gradeFromUrl, { shouldValidate: true });
    }
  }, [gradeFromUrl, form])

  useEffect(() => {
    if (editingStudent) {
      form.reset({
        name: editingStudent.name,
        parentPhone: editingStudent.parentPhone,
      });
    } else {
      form.reset({
        name: '',
        parentPhone: '',
      });
    }
  }, [editingStudent, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if(!gradeFromUrl && !editingStudent) {
        toast({
            variant: "destructive",
            title: 'خطأ',
            description: 'لم يتم تحديد الصف الدراسي. يرجى الوصول لهذه الصفحة من خلال لوحة التحكم الخاصة بالصف.',
        });
        return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, { ...editingStudent, ...values });
      toast({ title: 'تم التعديل', description: `تم تعديل بيانات الطالب ${values.name}.` });
      setEditingStudent(null);
    } else {
      const studentData = {
          ...values,
          grade: gradeFromUrl,
      }
      addStudent(studentData);
      toast({
        title: 'تم تسجيل الطالب',
        description: `تم إضافة الطالب ${values.name} بنجاح.`,
      });
    }
    form.reset({ name: '', parentPhone: '' });
  };
  
  const handleDelete = (studentId: string) => {
    deleteStudent(studentId);
    toast({
        variant: "destructive",
        title: "تم الحذف",
        description: "تم حذف الطالب بنجاح."
    });
  }

  const filteredStudents = students.filter(student => 
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!gradeFromUrl || student.grade === gradeFromUrl)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{editingStudent ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد'}</CardTitle>
             {gradeFromUrl && !editingStudent && <CardDescription>الصف: {gradeFromUrl}</CardDescription>}
             {editingStudent && <CardDescription>تعديل بيانات: {editingStudent.name}</CardDescription>}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الطالب</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>هاتف ولي الأمر (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم هاتف ولي الأمر" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={(!gradeFromUrl && !editingStudent) || isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="ms-2 h-4 w-4" />}
                  {editingStudent ? 'حفظ التعديلات' : 'إضافة طالب'}
                </Button>
                 {editingStudent && <Button variant="ghost" className="w-full" onClick={() => setEditingStudent(null)}>إلغاء التعديل</Button>}
                 {!gradeFromUrl && !editingStudent && <p className="text-xs text-destructive text-center">الرجاء اختيار صف دراسي أولاً.</p>}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلاب {gradeFromUrl ? `(${filteredStudents.length})` : `(${students.length})`}</CardTitle>
            <CardDescription>{gradeFromUrl ? `عرض طلاب صف: ${gradeFromUrl}` : 'عرض وبحث الطلاب المسجلين.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-[30rem] overflow-auto">
               {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
               ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الكود</TableHead>
                      <TableHead>الاسم</TableHead>
                      {!gradeFromUrl && <TableHead>الفصل</TableHead>}
                      <TableHead>رقم ولي الامر</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        return (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-sm">{(students.findIndex(s => s.id === student.id) + 1)}</TableCell>
                          <TableCell className="font-medium">
                             <Link href={`/students/${student.id}`} className="hover:underline text-primary">
                              {student.name}
                            </Link>
                          </TableCell>
                           {!gradeFromUrl && <TableCell>{student.grade}</TableCell>}
                          <TableCell>{student.parentPhone || 'لا يوجد'}</TableCell>
                          <TableCell className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedStudentForQR(student)}>
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)}>
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هذا الإجراء سيحذف الطالب ({student.name}) نهائياً. لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-destructive hover:bg-destructive/90">
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      )})
                    ) : (
                      <TableRow>
                        <TableCell colSpan={gradeFromUrl ? 5 : 5} className="h-24 text-center">
                          {students.length === 0 ? "لم تقم بإضافة أي طلاب بعد." : "لم يتم العثور على طلاب."}
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
