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
  Smartphone
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
    
    // بدء عملية الحذف (Non-blocking)
    deleteDoc(docRef).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }));
    });

    // التوجيه الفوري لمنع أخطاء "المستند غير موجود"
    toast({ title: "تم طلب حذف الرسالة بنجاح" });
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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">تفاصيل الرسالة الواردة</PageHeaderTitle>
          <PageHeaderDescription>إدارة ومعاينة طلبات التواصل من المستخدمين</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl font-bold gap-2 shadow-lg shadow-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  حذف الرسالة
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-right">حذف هذه الرسالة؟</AlertDialogTitle>
                  <AlertDialogDescription className="text-right">سيتم حذف الرسالة نهائياً من قاعدة البيانات، وسيتم توجيهك فوراً للقائمة السابقة.</AlertDialogDescription>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden h-fit sticky top-24">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              بيانات المرسل
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">الاسم الكامل</span>
                <p className="font-black text-slate-800 dark:text-slate-100 text-lg">{message.name}</p>
             </div>
             
             <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">البريد الإلكتروني</span>
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-sm break-all text-slate-600 dark:text-slate-300">{message.email}</p>
                  <Button variant="secondary" asChild className="w-full rounded-xl gap-2 h-9 text-xs">
                    <a href={`mailto:${message.email}`}>
                      <Mail className="h-3 w-3" />
                      إرسال بريد رد
                    </a>
                  </Button>
                </div>
             </div>

             {message.whatsapp && (
               <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">رقم الواتساب</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-mono text-sm text-slate-600 dark:text-slate-300">
                      <Smartphone className="h-3 w-3 text-emerald-500" />
                      {message.whatsapp}
                    </div>
                    <Button variant="outline" asChild className="w-full rounded-xl gap-2 h-11 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 shadow-sm">
                      <a href={`https://wa.me/${message.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        مراسلة عبر واتساب
                      </a>
                    </Button>
                  </div>
               </div>
             )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
             <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b flex flex-row justify-between items-center p-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-500" />
                  محتوى الرسالة
                </CardTitle>
                <Badge variant="secondary" className="rounded-xl px-3 py-1 font-bold text-[10px] gap-1.5 bg-slate-200/50">
                  <Calendar className="h-3.5 w-3.5" />
                  {message.createdAt?.toDate ? new Date(message.createdAt.toDate()).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '...'}
                </Badge>
             </CardHeader>
             <CardContent className="p-8">
                <div className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 min-h-[300px] text-lg leading-relaxed whitespace-pre-wrap break-words text-slate-700 dark:text-slate-200">
                  {renderMessageWithLinks(message.message)}
                </div>
             </CardContent>
          </Card>

          <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/20 rounded-[2rem] flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-blue-500 shrink-0" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-blue-900 dark:text-blue-400">ملاحظة إدارية</h4>
              <p className="text-sm text-blue-700/70 dark:text-blue-300/60 leading-relaxed">
                هذه الرسالة تم استلامها عبر نموذج التواصل الرسمي. يرجى مراجعة الطلب والرد على المستخدم عبر القنوات المتاحة بالأعلى لضمان تقديم أفضل خدمة دعم فني.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
