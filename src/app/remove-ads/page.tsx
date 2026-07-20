
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ZapOff, 
  ShieldCheck, 
  MessageCircle, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Gift
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function RemoveAdsPage() {
  const router = useRouter();
  const { user, reloadUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: profile } = useDoc<any>(userRef);

  const handleActivate = async () => {
    if (!activationCode.trim() || !user || !firestore) return;

    setIsActivating(true);
    try {
      const q = query(
        collection(firestore, 'activationCodes'), 
        where('code', '==', activationCode.trim().toUpperCase()),
        where('isUsed', '==', false)
      );
      
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ variant: "destructive", title: "كود غير صالح", description: "هذا الكود غير صحيح أو تم استخدامه مسبقاً." });
        setIsActivating(false);
        return;
      }

      const codeDoc = snap.docs[0];
      const codeData = codeDoc.data();

      // التحقق إذا كان الكود مخصصاً لهذا المستخدم
      if (codeData.targetId !== user.uid && codeData.targetId !== user.email) {
        toast({ variant: "destructive", title: "كود غير مخصص", description: "هذا الكود مخصص لحساب آخر." });
        setIsActivating(false);
        return;
      }

      // 1. تحديث حالة الكود
      await updateDoc(doc(firestore, 'activationCodes', codeDoc.id), {
        isUsed: true,
        usedBy: user.uid,
        usedAt: serverTimestamp()
      });

      // 2. تحديث بروفايل المستخدم
      await updateDoc(doc(firestore, 'users', user.uid), {
        isAdFree: true
      });

      await reloadUser();
      toast({ title: "مبروك!", description: "تم تفعيل حسابك بدون إعلانات مدى الحياة بنجاح." });
      router.push('/settings');
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في التفعيل" });
    } finally {
      setIsActivating(false);
    }
  };

  if (profile?.isAdFree) {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center px-4">
            <div className="p-8 bg-emerald-50 rounded-[3rem] shadow-inner">
                <ShieldCheck className="h-20 w-20 text-emerald-500 animate-in zoom-in duration-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">حسابك مفعل بدون إعلانات!</h2>
            <p className="text-slate-500 font-bold max-w-md">أنت الآن تستمتع بتجربة عمل نظيفة وسريعة مدى الحياة. شكراً لدعمك.</p>
            <Button onClick={() => router.push('/settings')} className="rounded-xl px-8 h-12 font-bold">العودة للإعدادات</Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
               <ZapOff className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">إلغاء الإعلانات</PageHeaderTitle>
          </div>
          <PageHeaderDescription>استمتع بتجربة عمل هادئة وسريعة بدون أي نوافذ منبثقة.</PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-primary/20 h-12 px-6 font-bold">
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-600 to-primary text-white relative group h-full">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <CardContent className="p-10 flex flex-col items-center text-center justify-center gap-6 relative z-10 h-full">
                <div className="p-5 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20 shadow-xl">
                    <Gift className="h-12 w-12 text-white fill-current" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black">عرض التفعيل الأبدي</h3>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-black">100</span>
                        <span className="text-lg font-bold opacity-80">ج.م</span>
                    </div>
                    <Badge className="bg-yellow-400 text-indigo-900 font-black rounded-lg text-[10px] px-3">لمرة واحدة مدى الحياة</Badge>
                </div>
                
                <p className="text-sm font-medium opacity-90 leading-relaxed">
                    ادفع مرة واحدة فقط، وتخلص من كافة الإعلانات والروابط الخارجية في حسابك للأبد.
                </p>

                <div className="pt-4 w-full">
                    <Button asChild className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg gap-2 shadow-xl shadow-emerald-500/20">
                        <a href="https://wa.me/201550729858" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-6 w-6" />
                            اطلب الكود عبر WhatsApp
                        </a>
                    </Button>
                    <p className="text-[10px] mt-3 font-bold opacity-60">تواصل معنا على: 01550729858</p>
                </div>
            </CardContent>
        </Card>

        <Card className="border-0 shadow-xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 h-full">
            <CardHeader className="p-10 pb-4">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Key className="h-6 w-6 text-indigo-500" />
                    تفعيل الكود
                </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-500 px-1">أدخل كود التفعيل المستلم:</Label>
                        <Input 
                            placeholder="CODE-XXXX-XXXX" 
                            className="h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-indigo-100 text-center text-2xl font-black text-indigo-600 placeholder:text-slate-300 focus:border-indigo-400 focus:ring-0 uppercase font-mono"
                            value={activationCode}
                            onChange={(e) => setActivationCode(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={handleActivate} 
                        disabled={isActivating || !activationCode.trim()}
                        className="w-full h-16 rounded-2xl font-black text-xl gap-3 shadow-lg shadow-primary/20"
                    >
                        {isActivating ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                        تفعيل الحساب الآن
                    </Button>
                </div>

                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-relaxed font-bold">
                        تأكد من الحصول على الكود من فريق الدعم الفني الرسمي فقط. يتم ربط الكود بـ UID الخاص بك ولا يمكن استخدامه في حساب آخر.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
