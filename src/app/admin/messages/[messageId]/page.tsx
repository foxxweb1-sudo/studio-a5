'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Calendar, 
  User, 
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ADMIN_EMAIL } from '@/lib/constants';
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
import { Badge } from '@/components/ui/badge';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params.messageId as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  const messageRef = useMemoFirebase(() => 
    (firestore && messageId) ? doc(firestore, 'contactMessages', messageId) : null,
  [firestore, messageId]);

  const { data: message, isLoading: messageLoading } = useDoc<any>(messageRef);

  useEffect(() => {
    if (isUserLoading) return;
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isUserLoading, router]);

  const handleDelete = () => {
    if (!firestore || !messageId) return;
    
    const docRef = doc(firestore, 'contactMessages', messageId);
    
    deleteDoc(docRef).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }));
    });

    toast({ title: "تم حذف الرسالة بنجاح" });
    router.push('/admin');
  };

  const renderMessageWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline font-bold inline-flex items-center gap-1 break-all bg-primary/5 px-2 py-0.5 rounded-md"
          >
            {part} <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      return part;
    });
  };

  if (isUserLoading || messageLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-bold text-slate-400">جاري تحميل الرسالة...</p>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">الرسالة غير موجودة</h2>
        <Button onClick={() => router.push('/admin')} className="rounded-xl">العودة للوحة التحكم</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">معاينة الرسالة</PageHeaderTitle>
          <PageHeaderDescription>عرض تفصيلي لطلب التواصل الوارد</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl font-bold gap-2 shadow-lg shadow-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription className="text-right">هل أنت متأكد من حذف هذه الرسالة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">تأكيد الحذف</AlertDialogAction>
                  <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold gap-2">
                <ArrowLeft className="h-4 w-4 ms-1" />
                رجوع
            </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* قسم بيانات المرسل - أفقي ومنظم */}
        <Card className="border-0 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              بيانات المرسل
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">الاسم</span>
                <p className="font-black text-slate-800 dark:text-slate-100">{message.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">البريد</span>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate">{message.email}</p>
                <Button variant="link" asChild className="p-0 h-auto text-primary text-[10px] font-bold">
                  <a href={`mailto:${message.email}`}>إرسال بريد رد</a>
                </Button>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">تاريخ الإرسال</span>
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {message.createdAt?.toDate ? new Date(message.createdAt.toDate()).toLocaleString('ar-EG') : '...'}
                </div>
              </div>
            </div>
            
            {message.whatsapp && (
              <div className="mt-6 pt-6 border-t border-dashed flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase">واتساب</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{message.whatsapp}</span>
                  </div>
                </div>
                <Button variant="outline" asChild className="rounded-xl gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 w-full sm:w-auto">
                  <a href={`https://wa.me/${message.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    مراسلة عبر واتساب
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* قسم محتوى الرسالة - عمودي وواسع */}
        <Card className="border-0 shadow-lg rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
             <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-500" />
                  نص الرسالة
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 md:p-10">
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 md:p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 min-h-[200px] text-lg leading-relaxed whitespace-pre-wrap break-words text-slate-700 dark:text-slate-200">
                  {renderMessageWithLinks(message.message)}
                </div>
             </CardContent>
        </Card>

        {/* ملاحظة إدارية في الأسفل */}
        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700/70 dark:text-blue-300/60 leading-relaxed font-medium">
            يرجى مراجعة محتوى الرسالة بعناية. يمكنك استخدام أزرار التواصل أعلاه للرد السريع على المستخدم.
          </p>
        </div>
      </div>
    </div>
  );
}
