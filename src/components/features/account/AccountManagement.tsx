'use client';

import { useUser, useAuth } from '@/firebase';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Save, Copy, Camera, User as UserIcon } from 'lucide-react';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useRef } from 'react';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'الاسم مطلوب.'),
});

export default function AccountManagement() {
  const { user, isUserLoading, reloadUser } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
      displayName: user?.displayName ?? '',
    },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, {
        displayName: values.displayName,
      });

      await reloadUser();

      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث معلومات ملفك الشخصي.',
      });

      form.reset({ displayName: values.displayName });

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // التحقق من حجم الملف (أقل من 1 ميجا للتوافق مع التحديث السريع)
    if (file.size > 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'الملف كبير جداً',
        description: 'يرجى اختيار صورة بحجم أقل من 1 ميجابايت.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        await updateProfile(user, {
          photoURL: base64Image,
        });
        await reloadUser();
        toast({
          title: 'تم تحديث الصورة',
          description: 'تم تغيير صورتك الشخصية بنجاح.',
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل رفع الصورة. يرجى المحاولة مرة أخرى.',
      });
      setIsUploading(false);
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <div className="md:col-span-1 flex flex-col items-center gap-6">
         <div className="relative group">
            <Avatar className="h-40 w-40 border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105 duration-300">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} className="object-cover" />
                <AvatarFallback className="text-5xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                    {getInitials(user?.displayName)}
                </AvatarFallback>
            </Avatar>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:bg-primary/90 transition-all transform active:scale-95 disabled:opacity-50"
              title="تغيير الصورة"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
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
              قم بتحديث اسمك الذي يظهر للجميع.
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
                
                <Button type="submit" disabled={isSaving} className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
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
      </div>
    </div>
  );
}
