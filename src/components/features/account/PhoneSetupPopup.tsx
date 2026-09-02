
'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ShieldCheck, Loader2, Save, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export default function PhoneSetupPopup() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userRef);

  const [isOpen, setIsOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('20');
  const [phone, setPhone] = useState('');
  const [paymentTiming, setPaymentTiming] = useState<'start' | 'mid' | 'end'>('start');
  const [isSaving, setIsSaving] = useState(false);
  
  // لمنع ظهور النافذة مرة أخرى بعد الحفظ مباشرة في نفس الجلسة
  const hasSubmittedInSession = useRef(false);

  useEffect(() => {
    // لا تظهر النافذة إذا كان المستخدم قيد التحميل أو إذا كان قد سجل بالفعل في هذه الجلسة
    if (isUserLoading || isProfileLoading || !user || !userProfile || hasSubmittedInSession.current) {
      return;
    }

    // التحقق الفعلي من نقص البيانات
    const isMissingData = !userProfile.phone || !userProfile.paymentTiming;
    
    if (isMissingData) {
      // تأخير بسيط للتأكد من أن البيانات ليست في حالة تحديث مؤقتة
      const timer = setTimeout(() => {
        setIsOpen(true);
        if (userProfile.phone) {
            setPhone(userProfile.phone.replace(/^\+\d{2,3}/, ''));
        }
        if (userProfile.paymentTiming) {
            setPaymentTiming(userProfile.paymentTiming);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [user, userProfile, isProfileLoading, isUserLoading]);

  const handleSaveData = async () => {
    if (!phone.trim() || phone.length < 8) {
      toast({ variant: "destructive", title: "رقم غير صحيح", description: "يرجى إدخال رقم هاتف واتساب صالح." });
      return;
    }

    setIsSaving(true);
    try {
      const fullPhone = `+${countryCode}${phone.replace(/\D/g, '')}`;
      await updateDoc(doc(firestore, 'users', user!.uid), {
        phone: fullPhone,
        paymentTiming: paymentTiming,
        updatedAt: serverTimestamp()
      });
      
      hasSubmittedInSession.current = true; // منع الظهور مجدداً فوراً
      setIsOpen(false);
      toast({ title: "تم التحديث", description: "تم تحديث بياناتك بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ البيانات، حاول مرة أخرى." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        // نمنع إغلاق النافذة يدوياً إذا كانت البيانات ناقصة
        if (!open && (!userProfile?.phone || !userProfile?.paymentTiming) && !hasSubmittedInSession.current) {
            return;
        }
        setIsOpen(open);
    }}>
      <DialogContent 
        className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl overflow-hidden p-0" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-primary h-2 w-full" />
        <div className="p-8 space-y-6 text-right">
            <DialogHeader className="text-right">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-black">إكمال ملف المعلم</DialogTitle>
                <DialogDescription className="font-bold pt-2 text-slate-500 leading-relaxed">
                    من فضلك، قم بتحديث معلوماتك الأساسية لتفعيل نظام الحضور والمتابعة بشكل كامل.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
                <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 px-1">رقم الواتساب</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 font-mono shadow-inner">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl font-mono">
                                <SelectItem value="20">+20</SelectItem>
                                <SelectItem value="966">+966</SelectItem>
                                <SelectItem value="971">+971</SelectItem>
                                <SelectItem value="965">+965</SelectItem>
                                <SelectItem value="212">+212</SelectItem>
                                <SelectItem value="213">+213</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="col-span-2 relative">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
                            <Input 
                                placeholder="112147..." 
                                className="pr-12 h-14 rounded-2xl bg-slate-50 border-0 font-mono shadow-inner text-lg"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs font-black text-slate-400 px-1 flex items-center gap-2">
                        <Wallet className="h-4 w-4" /> موعد تحصيل الرسوم (هام)
                    </Label>
                    <RadioGroup
                        value={paymentTiming}
                        onValueChange={(val: any) => setPaymentTiming(val)}
                        className="grid grid-cols-3 gap-2"
                    >
                        <div className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer", paymentTiming === 'start' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50 hover:bg-slate-100')}>
                           <RadioGroupItem value="start" id="p-start" className="sr-only" />
                           <Label htmlFor="p-start" className="text-[10px] font-black cursor-pointer">أول 5 أيام</Label>
                        </div>
                        <div className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer", paymentTiming === 'mid' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50 hover:bg-slate-100')}>
                           <RadioGroupItem value="mid" id="p-mid" className="sr-only" />
                           <Label htmlFor="p-mid" className="text-[10px] font-black cursor-pointer">منتصف الشهر</Label>
                        </div>
                        <div className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer", paymentTiming === 'end' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50 hover:bg-slate-100')}>
                           <RadioGroupItem value="end" id="p-end" className="sr-only" />
                           <Label htmlFor="p-end" className="text-[10px] font-black cursor-pointer">آخر الشهر</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            <Button 
                onClick={handleSaveData} 
                disabled={isSaving || !phone.trim()}
                className="w-full h-16 rounded-2xl font-black text-xl gap-3 shadow-xl shadow-primary/20"
            >
                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                حفظ وإكمال الدخول
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
