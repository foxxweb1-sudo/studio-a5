'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

function AuthActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mode || !oobCode) {
      setError('الرابط غير صالح أو منتهي الصلاحية.');
      setIsLoading(false);
      return;
    }

    if (mode === 'resetPassword') {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => setIsLoading(false))
        .catch((err) => {
          setError('كود إعادة التعيين غير صالح أو تم استخدامه مسبقاً.');
          setIsLoading(false);
        });
    } else {
      setError('نوع الطلب غير مدعوم حالياً.');
      setIsLoading(false);
    }
  }, [mode, oobCode, auth]);

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'كلمة المرور قصيرة جداً' });
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setIsSuccess(true);
      toast({ title: 'تم تغيير كلمة المرور بنجاح' });
    } catch (err: any) {
      setError('حدث خطأ أثناء تغيير كلمة المرور. حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-bold text-slate-400">جاري التحقق من الرابط...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-0 shadow-2xl rounded-[2rem]">
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black">عذراً، حدث خطأ</h2>
          <p className="text-slate-500 font-bold">{error}</p>
          <Button onClick={() => router.push('/login')} className="w-full h-12 rounded-xl font-bold">العودة لتسجيل الدخول</Button>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-0 shadow-2xl rounded-[2rem]">
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black">تم بنجاح!</h2>
          <p className="text-slate-500 font-bold">لقد تم تحديث كلمة مرورك بنجاح. يمكنك الآن الدخول باستخدام كلمة المرور الجديدة.</p>
          <Button onClick={() => router.push('/login')} className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700">دخول الآن</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-20 border-0 shadow-2xl rounded-[2rem]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-black">كلمة مرور جديدة</CardTitle>
        <CardDescription className="font-bold">يرجى إدخال كلمة المرور الجديدة لحسابك.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 text-right">
          <label className="text-sm font-bold px-1">كلمة المرور الجديدة</label>
          <div className="relative">
            <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="pr-10 h-12 rounded-xl"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        <Button 
          onClick={handleResetPassword} 
          disabled={isSubmitting || newPassword.length < 6}
          className="w-full h-14 rounded-xl font-black text-lg gap-2"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          تأكيد التغيير
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10" /></div>}>
      <AuthActionContent />
    </Suspense>
  );
}
