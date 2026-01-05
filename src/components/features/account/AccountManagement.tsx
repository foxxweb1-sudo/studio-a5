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
import { Loader2, KeyRound, Save } from 'lucide-react';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'الاسم مطلوب.'),
});

export default function AccountManagement() {
  const { user, isUserLoading, reloadUser } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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
      <div className="md:col-span-1 flex flex-col items-center gap-4">
         <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarFallback className="text-4xl bg-muted">
                {getInitials(user?.displayName)}
            </AvatarFallback>
        </Avatar>
        <div className="text-center">
            <h2 className="text-2xl font-bold">{user?.displayName}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      <div className="md:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>تعديل الملف الشخصي</CardTitle>
            <CardDescription>
              قم بتغيير اسمك هنا.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الأسم</FormLabel>
                      <FormControl>
                        <Input placeholder="اسمك الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="ms-2 h-4 w-4" />
                  )}
                  حفظ التغييرات
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>الأمان</CardTitle>
            <CardDescription>
              قم بإدارة إعدادات الأمان الخاصة بحسابك.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">كلمة المرور</h4>
                <p className="text-sm text-muted-foreground">
                  أرسل رابطًا إلى بريدك الإلكتروني لتغيير كلمة المرور.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handlePasswordReset}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="ms-2 h-4 w-4" />
                )}
                إرسال رابط التعيين
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
