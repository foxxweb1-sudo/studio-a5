
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ShieldCheck, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PhoneSetupPopup() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userRef);

  const [isOpen, setIsOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('20');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // إظهار النافذة فقط إذا كان المستخدم مسجلاً وليس لديه رقم هاتف في سجلاتنا
    if (user && !isProfileLoading && userProfile && !userProfile.phone) {
      setIsOpen(true);
    }
  }, [user, userProfile, isProfileLoading]);

  const handleSavePhone = async () => {
    if (!phone.trim() || phone.length < 8) {
      toast({ variant: "destructive", title: "رقم غير صحيح", description: "يرجى إدخال رقم هاتف واتساب صالح." });
      return;
    }

    setIsSaving(true);
    try {
      const fullPhone = `+${countryCode}${phone.replace(/\D/g, '')}`;
      await updateDoc(doc(firestore, 'users', user!.uid), {
        phone: fullPhone,
        updatedAt: serverTimestamp()
      });
      
      toast({ title: "تم التحديث", description: "تم ربط رقم هاتفك بنجاح." });
      setIsOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الرقم، حاول مرة أخرى." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl overflow-hidden p-0" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="bg-primary h-2 w-full" />
        <div className="p-8 space-y-6 text-right">
            <DialogHeader className="text-right">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-black">إكمال بيانات الهوية</DialogTitle>
                <DialogDescription className="font-bold pt-2 text-slate-500 leading-relaxed">
                    من فضلك، قم بإدخال رقم الواتساب الخاص بك لإكمال تسجيلك. سيظهر هذا الرقم لأولياء الأمور في تقارير الطلاب.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-2">
                        <Label className="text-xs font-black text-slate-400 px-1">الرمز</Label>
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
                    </div>
                    <div className="col-span-2 space-y-2">
                        <Label className="text-xs font-black text-slate-400 px-1">رقم الواتساب</Label>
                        <div className="relative">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                            <Input 
                                placeholder="112147..." 
                                className="pr-12 h-14 rounded-2xl bg-slate-50 border-0 font-mono shadow-inner text-lg"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Button 
                onClick={handleSavePhone} 
                disabled={isSaving || !phone.trim()}
                className="w-full h-16 rounded-2xl font-black text-xl gap-3 shadow-xl shadow-primary/20"
            >
                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                حفظ وإكمال الدخول
            </Button>
            <p className="text-[10px] text-center text-slate-400 font-bold italic">
                * يمكنك تعديل الرقم لاحقاً من صفحة "إدارة الحساب".
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
