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
import { UserPlus, Search, QrCode, Loader2, Trash2, Edit, GraduationCap, Archive, RotateCcw, Filter, MoreVertical } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [activeTab, setActiveTab] = useState('active');

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
    toast({
        variant: "destructive",
        title: "تم الحذف",
        description: "تم حذف الطالب بنجاح."
    });
  }

  const handleArchive = (student: Student) => {
    updateStudent(student.id, { isArchived: !student.isArchived });
    toast({
      title: student.isArchived ? "تمت الاستعادة" : "تمت الأرشفة",
      description: student.isArchived ? `تم نقل ${student.name} للطلاب النشطين.` : `تم نقل ${student.name} للأرشيف.`
    });
  }

  const activeStudents = useMemo(() => students.filter(s => !s.isArchived), [students]);
  const archivedStudents = useMemo(() => students.filter(s => s.isArchived), [students]);

  const renderStudentTable = (list: Student[]) => {
    const filtered = list.filter(student => 
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!gradeFromUrl || student.grade === gradeFromUrl)
    );

    return (
        <div className="max-h-[30rem] overflow-auto">
            <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow>
                    <TableHead className="text-right font-black">الاسم</TableHead>
                    {!gradeFromUrl && <TableHead className="text-right font-black">الفصل</TableHead>}
                    <TableHead className="text-center font-black">إجراءات</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filtered.length > 0 ? (
                    filtered.map((student) => (
                    <TableRow key={student.id} className="group hover:bg-primary/5 transition-colors">
                        <TableCell className="font-bold py-4">
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
                                    className={`rounded-lg gap-2 font-bold focus:bg-primary/5 ${student.isArchived ? 'text-emerald-600' : 'text-amber-600'}`}
                                    onClick={() => handleArchive(student)}
                                >
                                    {student.isArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                                    {student.isArchived ? "استعادة الطالب" : "أرشفة الطالب"}
                                </DropdownMenuItem>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                            onSelect={(e) => e.preventDefault()}
                                            className="rounded-lg gap-2 font-bold text-destructive focus:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            حذف نهائي
                                        </DropdownMenuItem>
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
                        {list.length === 0 ? "لا يوجد طلاب هنا حالياً." : "لا توجد نتائج بحث مطابقة."}
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden sticky top-20">
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
          <CardHeader className="bg-slate-50 border-b pb-0">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-1">
                <div>
                    <CardTitle>{activeTab === 'archived' ? 'سجل الأرشيف' : 'كشف الطلاب'}</CardTitle>
                    <CardDescription>
                        {gradeFromUrl 
                          ? `عرض ${activeTab === 'archived' ? 'أرشيف' : 'طلاب'} صف: ${gradeFromUrl}` 
                          : `إدارة كافة الطلاب النشطين حالياً.`
                        }
                    </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث بالاسم..."
                        className="pr-10 h-10 rounded-xl bg-white border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
             </div>

             {/* التبويبات تظهر فقط إذا كان هناك فلتر لصف دراسي معين لضمان تجربة مستخدم منظمة */}
             {gradeFromUrl ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-slate-100/50 p-1 rounded-t-xl rounded-b-none border-b-0 w-full flex justify-start">
                        <TabsTrigger value="active" className="rounded-t-lg rounded-b-none font-bold px-6 py-2.5 data-[state=active]:bg-white border-b-2 data-[state=active]:border-primary border-transparent">
                            الطلاب النشطين
                            <Badge variant="secondary" className="mr-2 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">{activeStudents.filter(s => s.grade === gradeFromUrl).length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="archived" className="rounded-t-lg rounded-b-none font-bold px-6 py-2.5 data-[state=active]:bg-white border-b-2 data-[state=active]:border-amber-500 border-transparent">
                            أرشيف الصف
                            <Badge variant="secondary" className="mr-2 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">{archivedStudents.filter(s => s.grade === gradeFromUrl).length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                    
                    <CardContent className="pt-6 p-0">
                        <TabsContent value="active" className="m-0">
                            {isLoading ? <div className="py-20 text-center"><Loader2 className="animate-spin inline-block h-8 w-8 text-primary" /></div> : renderStudentTable(activeStudents)}
                        </TabsContent>
                        
                        <TabsContent value="archived" className="m-0">
                            {isLoading ? <div className="py-20 text-center"><Loader2 className="animate-spin inline-block h-8 w-8 text-primary" /></div> : renderStudentTable(archivedStudents)}
                        </TabsContent>
                    </CardContent>
                </Tabs>
             ) : (
                <div className="pt-6 pb-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : renderStudentTable(activeStudents)}
                </div>
             )}
          </CardHeader>
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