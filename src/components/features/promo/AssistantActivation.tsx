
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDocs, collection, query, where, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Loader2, Zap, CheckCircle2, UserCheck, ShieldCheck, Mail, Lock, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/definitions';
import { addMonths } from 'date-fns';

export default function AssistantActivation() {
  const { user, reloadUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  const [code, setCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    if (!code.trim() || !user || !firestore) return;

    setIsActivating(true);
    try {
        const q = query(collection(firestore, 'promoCodes'), where('code', '==', code.trim()), where('isUsed', '==', false));
        const snap = await getDocs(q);

        if (snap.empty) {
            toast({ variant: "destructive", title: "كود غير صالح", description: "الكود خاطئ أو تم استخدامه مسبقاً." });
            return;
        }

        const codeDoc = snap.docs[0];
        const expiryDate = addMonths(new Date(), 1);
        
        // توليد بيانات المساعد
        const assistantId = Math.random().toString(36).substring(2, 7);
        const assistantEmail = `assistant_${assistantId}@alhodoor.site`;
        const assistantPassword = Math.random().toString(36).substring(2, 12).toUpperCase() + '@' + Math.floor(100 + Math.random() * 900);

        // 1. تحديث الكود كـ "مستخدم"
        await updateDoc(doc(firestore, 'promoCodes', codeDoc.id), {
            isUsed: true,
            usedBy: user.uid,
            usedAt: serverTimestamp()
        });

        // 2. تحديث بروفايل المعلم ببيانات المساعد
        await updateDoc(doc(firestore, 'users', user.uid), {
            assistantEmail,
            assistantPassword,
            assistantExpiresAt: expiryDate,
        });

        // 3. إنشاء حساب المساعد في Firestore (سيكون موثقاً تلقائياً)
        // ملاحظة: الحساب الفعلي في Auth سيتم إنشاؤه بواسطة الدعم بناءً على الكود
        // هنا نقوم بحجز السجل فقط لضمان عمل Impersonation
        await setDoc(doc(firestore, 'users', `ASSISTANT_${assistantId}`), {
            uid: `ASSISTANT_${assistantId}`,
            email: assistantEmail,
            displayName: `مساعد لـ ${user.displayName}`,
            isAssistant: true,
            assignedTeacherId: user.uid,
            assistantPassword: assistantPassword,
            isVerified: true,
            assistantExpiresAt: expiryDate,
            createdAt: serverTimestamp()
        });

        await reloadUser();
        toast({ title: "تم التفعيل بنجاح!", description: "باقة المساعد الشخصي نشطة الآن." });
        setCode('');
    } catch (error: any) {
        toast({ variant: "destructive", title: "خطأ في التفعيل", description: error.message });
    } finally {
        setIsActivating(false);
    }
  };

  if (isProfileLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div>;

  if (profile?.assistantEmail) {
      const isExpired = profile.assistantExpiresAt?.toDate ? new Date() > profile.assistantExpiresAt.toDate() : false;

      return (
          <Card className="border-0 shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-amber-500 h-2 w-full" />
              <CardHeader className="p-8">
                  <div className="flex items-center gap-4">
                      <div className="p-4 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                          <UserCheck className="h-8 w-8" />
                      </div>
                      <div>
                          <CardTitle className="text-2xl font-black">باقة المساعد نشطة</CardTitle>
                          <CardDescription className="text-slate-400 font-bold">
                              {isExpired ? 'انتهت صلاحية الباقة' : `صالحة حتى: ${profile.assistantExpiresAt.toDate().toLocaleDateString('ar-EG')}`}
                          </CardDescription>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                      <p className="text-xs font-bold text-amber-400">بيانات دخول المساعد الخاص بك:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <Label className="text-[10px] uppercase text-slate-500 font-black">البريد الإلكتروني</Label>
                              <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5">
                                  <code className="text-xs font-mono">{profile.assistantEmail}</code>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(profile.assistantEmail!)}><Copy className="h-3 w-3" /></Button>
                              </div>
                          </div>
                          <div className="space-y-1">
                              <Label className="text-[10px] uppercase text-slate-500 font-black">كلمة المرور</Label>
                              <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5">
                                  <code className="text-xs font-mono">{profile.assistantPassword}</code>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(profile.assistantPassword!)}><Copy className="h-3 w-3" /></Button>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-300 leading-relaxed font-bold">
                          قم بإرسال هذه البيانات لمساعدك المختار. يمكنه الدخول بها من صفحة تسجيل الدخول العادية وسيدير حسابك بالكامل.
                      </p>
                  </div>
              </CardContent>
          </Card>
      );
  }

  return (
    <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="bg-amber-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-black">تفعيل المساعد الشخصي</CardTitle>
            <CardDescription>أدخل كود التفعيل للحصول على بيانات مساعدك.</CardDescription>
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
                    className="h-16 pr-12 rounded-2xl text-xl font-black font-mono tracking-widest border-2 focus:border-amber-500"
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
            {isActivating ? <Loader2 className="animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
            تفعيل الباقة الآن
        </Button>

        <p className="text-center text-[10px] font-bold text-slate-400">
            لا تملك كود؟ تواصل مع الدعم الفني للحصول على كود تفعيل.
        </p>
      </CardContent>
    </Card>
  );
}
