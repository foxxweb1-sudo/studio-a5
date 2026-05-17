
'use client';

import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Save, Copy, User as UserIcon, ExternalLink, LogOut, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { updateProfile, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useMemo } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'الاسم مطلوب.'),
  photoURL: z.string().url('الرجاء إدخال رابط صالح (يبدأ بـ http).').optional().or(z.string().length(0)),
});

export default function AccountManagement() {
  const { user, isUserLoading, reloadUser } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);

  // جلب بيانات الحذف من الفايرستور
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: profile } = useDoc<any>(userRef);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
      displayName: user?.displayName ?? '',
      photoURL: user?.photoURL ?? '',
    },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, {
        displayName: values.displayName,
        photoURL: values.photoURL || null,
      });

      await reloadUser();

      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث معلومات ملفك الشخصي وصورتك.',
      });

      form.reset({ 
        displayName: values.displayName,
        photoURL: values.photoURL 
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingEmail(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: 'تم إرسال الرابط',
        description:
          'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleRequestDeletion = async () => {
    if (!user || !firestore) return;
    setIsRequestingDeletion(true);
    try {
      const uRef = doc(firestore, 'users', user.uid);
      await setDoc(uRef, { 
        deletionRequestedAt: serverTimestamp() 
      }, { merge: true });

      toast({
        title: 'تم جدولة الحذف',
        description: 'سيتم حذف حسابك نهائياً بعد 7 أيام. يمكنك إلغاء الطلب ببساطة عن طريق تسجيل الدخول مرة أخرى في أي وقت قبل انتهاء المدة.',
      });
      
      // تسجيل الخروج بعد طلب الحذف
      setTimeout(() => signOut(auth), 2000);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل طلب حذف الحساب.',
      });
    } finally {
      setIsRequestingDeletion(false);
    }
  };
  
  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid);
    toast({
      title: 'تم نسخ معرف المستخدم',
      description: 'تم نسخ UID بنجاح.',
    });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pb-20">
      <div className="md:col-span-1 flex flex-col items-center gap-6">
         <div className="relative group">
            <Avatar className="h-40 w-40 border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105 duration-300">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} className="object-cover" />
                <AvatarFallback className="text-5xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                    {getInitials(user?.displayName)}
                </AvatarFallback>
            </Avatar>
        </div>
        <div className="text-center space-y-1">
            <h2 className="text-2xl font-black tracking-tight">{user?.displayName || 'مستخدم جديد'}</h2>
            <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
        </div>
      </div>
      <div className="md:col-span-2 space-y-8">
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              تعديل الملف الشخصي
            </CardTitle>
            <CardDescription>
              قم بتحديث اسمك وصورتك الشخصية.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-sm">الأسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسمك هنا" className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photoURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-sm">رابط الصورة الشخصية</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="https://example.com/photo.jpg" 
                              className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-primary flex-grow" 
                              {...field} 
                            />
                            <Button asChild variant="outline" className="h-12 rounded-xl border-dashed border-primary/40 hover:bg-primary/5 shrink-0 px-4">
                              <a href="https://top4top.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                <span className="hidden sm:inline">رفع خارجي</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription className="text-[10px] leading-tight">
                        يمكنك استخدام موقع <span className="font-bold text-primary">top4top</span> لرفع صورتك ولصق "رابط الصورة المباشر" هنا.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isSaving} className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  حفظ التغييرات
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10">
            <CardTitle className="text-xl flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-500" />
              الأمان والخصوصية
            </CardTitle>
            <CardDescription>
              إدارة كلمة المرور والمعلومات التقنية لحسابك.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/30 rounded-2xl gap-4">
              <div className="text-center sm:text-right">
                <h4 className="font-bold">تغيير كلمة المرور</h4>
                <p className="text-xs text-muted-foreground">
                  سيتم إرسال رابط آمن إلى بريدك الإلكتروني.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handlePasswordReset}
                disabled={isSendingEmail}
                className="rounded-xl border-emerald-500/20 hover:bg-emerald-500/5 font-bold"
              >
                {isSendingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="ms-2 h-4 w-4" />
                )}
                طلب رابط التغيير
              </Button>
            </div>
            
            <div className="pt-4 border-t border-dashed">
                 <h4 className="font-bold text-sm mb-2">معرف المستخدم التقني (UID)</h4>
                 <div className="flex items-center gap-2 p-3 bg-slate-900 text-slate-100 rounded-xl">
                   <Input readOnly value={user?.uid ?? ''} className="flex-grow bg-transparent border-0 font-mono text-[10px] sm:text-xs tracking-tighter text-emerald-400 focus-visible:ring-0 h-auto p-0"/>
                   <Button variant="ghost" size="icon" onClick={handleCopyUid} className="h-8 w-8 hover:bg-white/10 text-slate-300">
                    <Copy className="h-4 w-4"/>
                   </Button>
                 </div>
            </div>
          </CardContent>
        </Card>

        {/* التحكم في الحساب */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border-t-4 border-t-rose-500/20">
          <CardHeader className="bg-rose-500/5 border-b border-rose-500/10">
            <CardTitle className="text-xl flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              إجراءات الحساب
            </CardTitle>
            <CardDescription>
              الخروج من النظام أو حذف الحساب نهائياً.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
             {profile?.deletionRequestedAt && (
                <div className="p-4 mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-100">طلب حذف نشط</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
                      لقد طلبت حذف حسابك. سيتم التنفيذ بعد 7 أيام من تاريخ الطلب. تسجيل دخولك التالي سيلغي هذا الطلب تلقائياً.
                    </p>
                  </div>
                </div>
              )}

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full h-12 rounded-xl font-bold gap-2 border-slate-200 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج من الحساب
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg shadow-rose-500/20"
                  disabled={isRequestingDeletion || !!profile?.deletionRequestedAt}
                >
                  {isRequestingDeletion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {profile?.deletionRequestedAt ? "جاري انتظار الحذف..." : "حذف الحساب نهائياً"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-right">تأكيد طلب الحذف</AlertDialogTitle>
                  <AlertDialogDescription className="text-right">
                    سيتم وضع حسابك في حالة "انتظار الحذف" لمدة 7 أيام. إذا لم تقم بتسجيل الدخول خلال هذه المدة، فسيتم مسح بياناتك نهائياً.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                  <AlertDialogAction onClick={handleRequestDeletion} className="bg-rose-600 hover:bg-rose-700 rounded-xl">نعم، ابدأ فترة الـ 7 أيام</AlertDialogAction>
                  <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
