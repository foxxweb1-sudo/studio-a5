
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
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
  ShieldCheck
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

  const handleDelete = async () => {
    if (!firestore || !messageId) return;
    try {
      await deleteDoc(doc(firestore, 'contactMessages', messageId));
      toast({ title: "تم الحذف بنجاح" });
      router.push('/admin');
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  // وظيفة لاستخراج الروابط من النص للمعاينة البسيطة
  const renderMessageWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1 inline-flex">
            {part} <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      return part;
    });
  };

  if (isUserLoading || messageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">الرسالة غير موجودة</h2>
        <Button onClick={() => router.back()}>رجوع للخلف</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-center">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">تفاصيل الرسالة</PageHeaderTitle>
          <PageHeaderDescription>عرض تفصيلي لطلب التواصل الوارد</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl font-bold gap-2">
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف الرسالة نهائياً؟</AlertDialogTitle>
                  <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">تأكيد الحذف</AlertDialogAction>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold">
                <ArrowLeft className="h-4 w-4 ms-2" />
                رجوع
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-0 shadow-xl rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              صاحب الرسالة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">الاسم</span>
                <p className="font-bold">{message.name}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">البريد الإلكتروني</span>
                <p className="font-mono text-sm break-all">{message.email}</p>
                <Button variant="link" asChild className="p-0 h-auto text-xs">
                  <a href={`mailto:${message.email}`}>إرسال إيميل</a>
                </Button>
             </div>
             {message.whatsapp && (
               <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">واتساب</span>
                  <p className="font-mono text-sm">{message.whatsapp}</p>
                  <Button variant="outline" asChild className="w-full mt-2 rounded-xl gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50">
                    <a href={`https://wa.me/${message.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      مراسلة واتساب
                    </a>
                  </Button>
               </div>
             )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 shadow-xl rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
           <CardHeader className="bg-slate-50 border-b flex flex-row justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-500" />
                نص الرسالة
              </CardTitle>
              <Badge variant="outline" className="rounded-lg gap-1">
                <Calendar className="h-3 w-3" />
                {message.createdAt?.toDate ? new Date(message.createdAt.toDate()).toLocaleDateString('ar-EG') : '...'}
              </Badge>
           </CardHeader>
           <CardContent className="p-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 min-h-[200px] text-lg leading-relaxed whitespace-pre-wrap">
                {renderMessageWithLinks(message.message)}
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-[2rem] flex items-start gap-4">
        <ShieldCheck className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="font-black text-blue-900">توجيهات إدارية</h4>
          <p className="text-sm text-blue-700/80">
            يرجى التأكد من الرد على صاحب الرسالة خلال 24 ساعة لضمان جودة الخدمة. يمكنك استخدام أزرار التواصل السريع بالأعلى لبدء المحادثة فوراً.
          </p>
        </div>
      </div>
    </div>
  );
}
