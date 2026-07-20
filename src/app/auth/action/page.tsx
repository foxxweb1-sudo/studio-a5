'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { 
  verifyPasswordResetCode, 
  confirmPasswordReset, 
  applyActionCode, 
  checkActionCode 
} from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, CheckCircle2, AlertCircle, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

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
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!mode || !oobCode) {
      setErrorMsg('الرابط غير صالح أو منتهي الصلاحية.');
      setStatus('error');
      setIsLoading(false);
      return;
    }

    const handleAction = async () => {
      try {
        switch (mode) {
          case 'resetPassword':
            const resetEmail = await verifyPasswordResetCode(auth, oobCode);
            setEmail(resetEmail);
            break;
          case 'verifyEmail':
            await applyActionCode(auth, oobCode);
            setStatus('success');
            break;
          case 'recoverEmail':
            const info = await checkActionCode(auth, oobCode);
            const restoredEmail = info.data.email;
            await applyActionCode(auth, oobCode);
            setEmail(restoredEmail);
            setStatus('success');
            break;
          default:
            setErrorMsg('نوع الطلب غير مدعوم حالياً.');
            setStatus('error');
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg('الكود غير صالح أو تم استخدامه مسبقاً.');
        setStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    handleAction();
  }, [mode, oobCode, auth]);

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'كلمة المرور قصيرة جداً' });
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setStatus('success');
      toast({ title: 'تم تغيير كلمة المرور بنجاح' });
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء تغيير كلمة المرور. حاول مرة أخرى.');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const LiquidLoader = ({ text }: { text: string }) => (
    <div className="liquid-loader py-8">
      <div className="loading-text text-primary">
        {text}<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
      </div>
      <div className="loader-track">
        <div className="liquid-fill"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LiquidLoader text="جاري التحقق من السحابة" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Card className="max-w-md mx-auto mt-20 border-0 shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="bg-rose-500 h-2 w-full" />
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black">عذراً، حدث خطأ</h2>
            <p className="text-slate-500 font-bold leading-relaxed">{errorMsg}</p>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full h-12 rounded-xl font-bold gap-2">
             العودة لتسجيل الدخول
             <ArrowRight className="h-4 w-4 rotate-180" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'success' && mode !== 'resetPassword') {
    return (
      <Card className="max-w-md mx-auto mt-20 border-0 shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="bg-emerald-500 h-2 w-full" />
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black">تمت العملية بنجاح!</h2>
            <p className="text-slate-500 font-bold leading-relaxed">
              {mode === 'verifyEmail' 
                ? 'تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن استخدام كافة مميزات النظام.' 
                : `تمت استعادة حسابك للبريد (${email}) بنجاح.`}
            </p>
          </div>
          <Button onClick={() => router.push('/')} className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 gap-2">
             دخول للرئيسية
             <ArrowRight className="h-4 w-4 rotate-180" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'success' && mode === 'resetPassword') {
    return (
        <Card className="max-w-md mx-auto mt-20 border-0 shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="bg-emerald-500 h-2 w-full" />
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black">تم التغيير بنجاح!</h2>
            <p className="text-slate-500 font-bold">لقد تم تحديث كلمة مرورك. يمكنك الآن الدخول باستخدام الكلمة الجديدة.</p>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700">دخول الآن</Button>
        </CardContent>
      </Card>
    );
  }

  // وضع إعادة تعيين كلمة المرور - النموذج
  return (
    <Card className="max-w-md mx-auto mt-20 border-0 shadow-2xl rounded-[2rem] overflow-hidden">
      <div className="bg-primary h-2 w-full" />
      <CardHeader className="text-center pt-10">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-black">كلمة مرور جديدة</CardTitle>
        <CardDescription className="font-bold">
            للحساب المرتبط بـ: <span className="text-primary">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-10">
        {isSubmitting ? (
            <LiquidLoader text="جاري تحديث السحابة" />
        ) : (
            <>
                <div className="space-y-2 text-right">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">أدخل كلمة المرور الجديدة</label>
                    <div className="relative">
                        <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pr-12 h-14 rounded-xl bg-slate-50 border-0 focus-visible:ring-primary"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>
                <Button 
                    onClick={handleResetPassword} 
                    disabled={isSubmitting || newPassword.length < 6}
                    className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                    <CheckCircle2 className="h-5 w-5" />
                    تأكيد وحفظ الكلمة
                </Button>
            </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="liquid-loader">
                <div className="loading-text text-primary">
                    جاري التحميل<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                </div>
                <div className="loader-track">
                    <div className="liquid-fill"></div>
                </div>
            </div>
        </div>
    }>
      <AuthActionContent />
    </Suspense>
  );
}
