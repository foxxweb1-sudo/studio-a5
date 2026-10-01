
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDocs, collection, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Loader2, Zap, CheckCircle2, UserCheck, MessageCircle, Star, Bell, Info, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/definitions';
import { addMonths, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAppConfig } from '@/hooks/use-app-config';

export default function AssistantActivation() {
  const { user, reloadUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { config } = useAppConfig();
  
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  const [code, setCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    if (!code.trim() || !user || !firestore) return;

    setIsActivating(true);
    try {
        const q = query(
            collection(firestore, 'promoCodes'), 
            where('code', '==', code.trim().toUpperCase())
        );
        const snap = await getDocs(q);
        const codeDoc = snap.docs.find(d => d.data().isUsed === false);

        if (!codeDoc) {
            toast({ 
                variant: "destructive", 
                title: "كود غير صالح", 
                description: "الكود خاطئ أو تم استخدامه مسبقاً." 
            });
            setIsActivating(false);
            return;
        }

        const expiryDate = addMonths(new Date(), 1);

        // 1. تحديث الكود كـ مستخدم
        await updateDoc(doc(firestore, 'promoCodes', codeDoc.id), {
            isUsed: true,
            usedBy: user.uid,
            usedAt: serverTimestamp()
        });

        // 2. ترقية حساب المعلم وتفعيل حالة المساعد
        await updateDoc(doc(firestore, 'users', user.uid), {
            hasAssistantPackage: true,
            assistantExpiresAt: expiryDate,
            updatedAt: serverTimestamp()
        });

        await reloadUser();
        toast({ title: "تم تفعيل الباقة!", description: "باقة المساعد نشطة الآن. تواصل مع الدعم لتخصيص مساعدك." });
        setCode('');
    } catch (error: any) {
        console.error("Activation Error:", error);
        toast({ 
            variant: "destructive", 
            title: "فشل التفعيل", 
            description: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً." 
        });
    } finally {
        setIsActivating(false);
    }
  };

  if (isProfileLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div>;

  if (profile?.hasAssistantPackage || profile?.assistantExpiresAt) {
      const expiryDate = profile.assistantExpiresAt?.toDate ? profile.assistantExpiresAt.toDate() : null;
      const isExpired = expiryDate ? new Date() > expiryDate : false;

      return (
          <Card className="border-0 shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-emerald-500 h-2 w-full" />
              <CardHeader className="p-8">
                  <div className="flex items-center gap-4">
                      <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                          <UserCheck className="h-8 w-8" />
                      </div>
                      <div>
                          <CardTitle className="text-2xl font-black">باقة المساعد نشطة ✅</CardTitle>
                          <CardDescription className="text-slate-400 font-bold">
                              {isExpired ? 'انتهت صلاحية الباقة' : `صالحة حتى: ${expiryDate ? format(expiryDate, 'd MMMM yyyy', { locale: ar }) : '...'}`}
                          </CardDescription>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-amber-400 shrink-0 mt-1" />
                        <p className="text-sm font-bold leading-relaxed">
                            تم تفعيل اشتراكك بنجاح. الخطوة التالية هي التواصل مع فريق العمل لتزويدك بمساعد متخصص يقوم بإدارة حسابك.
                        </p>
                      </div>
                  </div>
                  
                  <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20 space-y-4">
                      <Button asChild className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg gap-3 shadow-xl">
                          <a href={`https://wa.me/${config.contactPhone}?text=${encodeURIComponent(`أهلاً، قمت بتفعيل كود باقة المساعد للـ UID: ${user?.uid}\nأريد البدء في إجراءات التخصيص.`)}`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-6 w-6" />
                              اطلب تخصيص مساعدك الآن
                          </a>
                      </Button>
                      <p className="text-[10px] text-slate-400 text-center font-bold">يرجى إرسال الـ UID الخاص بك الظاهر في بطاقة الهوية الجانبية.</p>
                  </div>
              </CardContent>
          </Card>
      );
  }

  return (
    <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border-t-4 border-t-amber-500">
      <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 border-b p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-slate-800 dark:text-white">هل تمتلك كود تفعيل؟</CardTitle>
            <CardDescription className="font-bold">أدخل الكود أدناه لتفعيل باقة المساعد الشخصي فوراً.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-2">
            <Label className="font-bold text-xs px-1">كود التفعيل (CYBE-PRO-XXXXX)</Label>
            <div className="relative">
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input 
                    placeholder="أدخل الكود هنا..." 
                    className="h-16 pr-12 rounded-2xl text-xl font-black font-mono tracking-widest border-2 focus:border-amber-500 bg-slate-50 dark:bg-slate-800"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            </div>
        </div>

        <Button 
            onClick={handleActivate}
            disabled={isActivating || !code.trim()}
            className="w-full h-16 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xl gap-3 shadow-xl"
        >
            {isActivating ? <Loader2 className="animate-spin h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            تفعيل الباقة بالكود
        </Button>

        <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Bell className="h-4 w-4" />
                <span className="text-xs font-black">الأكواد المجانية:</span>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                يتم طرح <span className="text-indigo-600 dark:text-indigo-300 font-black">5 أكواد مجانية يومياً</span> على قناتنا الرسمية. انضم الآن لتكون من المحظوظين!
            </p>
            <Button asChild variant="outline" className="w-full rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold gap-2">
                <a href={config.whatsappChannel} target="_blank" rel="noopener noreferrer">
                    <Star className="h-4 w-4 fill-current" />
                    انضم للقناة واحصل على كودك
                </a>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
