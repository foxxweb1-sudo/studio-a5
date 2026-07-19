
'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/firebase';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  CheckCircle2, 
  UserCheck, 
  ShieldCheck, 
  MessageCircle, 
  Send,
  Loader2,
  Star,
  Zap,
  Wallet,
  Globe,
  UploadCloud,
  Fingerprint,
  Mail,
  User as UserIcon,
  Image as ImageIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'vodafone' | 'paypal'>('vodafone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    countryCode: '20',
    whatsapp: '',
    senderAccount: '',
    screenshotUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const TELEGRAM_BOT_TOKEN = '8611761572:AAHV4uw_Adq7d3rlSQ0E8jbbLTOXHB5Q2cw';
  const TELEGRAM_CHAT_ID = '7086574224';
  const IMGBB_API_KEY = 'd015dd34e005b5dd56d68d2fe147c267';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body
      });
      const result = await res.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, screenshotUrl: result.data.url }));
        toast({ title: "تم رفع الإيصال بنجاح" });
      } else {
        toast({ variant: "destructive", title: "فشل رفع الصورة" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ في الاتصال بالسيرفر" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.whatsapp || !formData.senderAccount || !formData.screenshotUrl) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى استكمال كافة الحقول ورفع صورة الإيصال." });
      return;
    }

    setIsSubmitting(true);
    
    const fullWhatsapp = `+${formData.countryCode}${formData.whatsapp}`;
    const message = `
🌟 *طلب اشتراك جديد: باقة المساعد الشخصي*
-------------------------------
👤 *بيانات العميل:*
• الاسم: ${user?.displayName || 'غير مسجل'}
• البريد: ${user?.email || 'N/A'}
• الـ UID: \`${user?.uid}\`

📱 *بيانات التواصل والدفع:*
• واتساب: ${fullWhatsapp}
• طريقة الدفع: ${paymentMethod === 'vodafone' ? 'فودافون كاش' : 'باي بال'}
• حساب المحول: ${formData.senderAccount}

🖼️ *إيصال السداد:*
${formData.screenshotUrl}
-------------------------------
⏰ التاريخ: ${new Date().toLocaleString('ar-EG')}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        toast({
          title: "تم استلام طلبك بنجاح",
          description: "سيتم إرسال لك رسالة تأكيد الشراء على واتس اب. قد تستغرق العملية بضع من الوقت.",
        });
        router.push('/');
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "عذراً، حدث خطأ",
        description: "فشل إرسال الطلب، يرجى المحاولة لاحقاً."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    "مساعد مخصص لإدارة حسابك بالكامل",
    "تسجيل بيانات الطلاب الجدد نيابة عنك",
    "متابعة يومية للحضور والغياب بدقة",
    "تنظيم السجلات المالية وتحصيل الرسوم",
    "تواصل مباشر عبر WhatsApp على مدار الساعة",
    "تقارير أداء شهرية مرسلة لولي الأمر"
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center">
        <div className="p-6 bg-amber-50 rounded-full">
            <ShieldCheck className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black">يجب تسجيل الدخول أولاً</h2>
        <p className="text-slate-500 font-bold">يرجى تسجيل الدخول لتتمكن من الاشتراك في الباقات.</p>
        <Button onClick={() => router.push('/login')} className="rounded-xl h-12 px-8 font-black">ذهاب لتسجيل الدخول</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24 px-4 animate-in fade-in duration-700">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
               <Zap className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">بوابة الشراء الآمنة</PageHeaderTitle>
          </div>
          <PageHeaderDescription>أتمم عملية اشتراكك في باقة المساعد الشخصي بذكاء.</PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => step === 'payment' ? setStep('info') : router.back()}
          className="rounded-xl border-primary/20 h-12 px-6 font-bold"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          {step === 'payment' ? 'رجوع للتفاصيل' : 'رجوع'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Side: Dynamic Display */}
        <div className="lg:col-span-3 space-y-6">
            {step === 'info' ? (
                <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="bg-emerald-500/5 border-b p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                <UserCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-emerald-700">باقة المساعد الشخصي</CardTitle>
                                <Badge className="bg-yellow-400 text-emerald-900 font-black px-3 py-1 rounded-lg mt-1">100 ج.م شهرياً</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                                    <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{feature}</p>
                                </div>
                            ))}
                        </div>
                        <Button 
                            onClick={() => setStep('payment')}
                            className="w-full h-16 mt-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl gap-3 shadow-xl"
                        >
                            بدء إجراءات الدفع
                            <ArrowLeft className="h-6 w-6 ms-2 rotate-180" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card className="border-0 shadow-xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
                        <CardHeader className="border-b border-white/5 p-8">
                             <CardTitle className="text-xl font-black flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-emerald-400" />
                                تعليمات السداد
                             </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-slate-400 font-bold">اختر طريقة الدفع المناسبة لك:</Label>
                                <RadioGroup defaultValue="vodafone" onValueChange={(val: any) => setPaymentMethod(val)} className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'vodafone' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                                        <Label htmlFor="vodafone" className="flex flex-col items-center gap-2 cursor-pointer">
                                            <RadioGroupItem value="vodafone" id="vodafone" className="sr-only" />
                                            <span className="font-black text-lg">فودافون كاش</span>
                                            <span className="text-[10px] opacity-60">Mobile Wallet</span>
                                        </Label>
                                    </div>
                                    <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                                        <Label htmlFor="paypal" className="flex flex-col items-center gap-2 cursor-pointer">
                                            <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                                            <span className="font-black text-lg">PayPal</span>
                                            <span className="text-[10px] opacity-60">International</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 animate-in slide-in-from-bottom-2">
                                {paymentMethod === 'vodafone' ? (
                                    <div className="text-center space-y-2">
                                        <p className="text-xs text-slate-400 font-bold">حول مبلغ (100 ج.م) للرقم التالي:</p>
                                        <code className="text-3xl font-black text-emerald-400 tracking-wider">01029583799</code>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-2">
                                        <p className="text-xs text-slate-400 font-bold">أرسل المبلغ للبريد الإلكتروني التالي:</p>
                                        <code className="text-sm sm:text-lg font-black text-blue-400 break-all">tech.support.app@gmail.com</code>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-start gap-4">
                        <div className="p-2 bg-amber-500 rounded-xl text-white shrink-0">
                            <Star className="h-5 w-5 fill-current" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-amber-900 text-sm">تنبيه هام</h4>
                            <p className="text-xs text-amber-700 leading-relaxed font-bold">
                                يرجى تصوير شاشة عملية التحويل (Screenshot) لرفعها في الخطوة التالية لتأكيد عملية الشراء وتفعيل الحساب فوراً.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Right Side: Identity & Final Form */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-8">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Fingerprint className="h-5 w-5 text-primary" />
                        هوية المشترك
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                            <AvatarImage src={user.photoURL || ''} />
                            <AvatarFallback className="bg-primary text-white font-black">{user.displayName?.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                            <h4 className="font-black text-slate-800 dark:text-white truncate">{user.displayName}</h4>
                            <p className="text-[10px] text-slate-500 font-bold font-mono truncate">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">User Global UID</span>
                        <code className="text-[10px] font-mono text-primary font-bold break-all">{user.uid}</code>
                    </div>

                    {step === 'payment' && (
                        <form onSubmit={handleFinalSubmit} className="space-y-5 pt-4 border-t border-dashed">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold px-1">رقم الواتساب للتواصل</Label>
                                <div className="flex gap-2">
                                    <Select 
                                        defaultValue="20" 
                                        onValueChange={(val) => setFormData({...formData, countryCode: val})}
                                    >
                                        <SelectTrigger className="w-24 h-12 rounded-xl bg-slate-50 font-mono">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl font-mono">
                                            <SelectItem value="20">+20 (مصر)</SelectItem>
                                            <SelectItem value="966">+966</SelectItem>
                                            <SelectItem value="971">+971</SelectItem>
                                            <SelectItem value="965">+965</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input 
                                        placeholder="1121473424"
                                        className="h-12 rounded-xl bg-slate-50 font-mono flex-grow"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold px-1">
                                    {paymentMethod === 'vodafone' ? 'رقم المحفظة المحول منها' : 'بريد PayPal المحول منه'}
                                </Label>
                                <Input 
                                    placeholder={paymentMethod === 'vodafone' ? "01XXXXXXXXX" : "name@email.com"}
                                    className="h-12 rounded-xl bg-slate-50 font-mono"
                                    value={formData.senderAccount}
                                    onChange={(e) => setFormData({...formData, senderAccount: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold px-1">صورة إيصال التحويل</Label>
                                <div className="relative">
                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        className={`w-full h-14 rounded-xl border-dashed border-2 transition-all ${formData.screenshotUrl ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'hover:border-primary'}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : formData.screenshotUrl ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <UploadCloud className="h-5 w-5" />}
                                        <span className="ms-2">{formData.screenshotUrl ? 'تم رفع الإيصال' : 'رفع صورة الإيصال'}</span>
                                    </Button>
                                </div>
                            </div>

                            <Button 
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="w-full h-16 rounded-2xl bg-primary hover:bg-indigo-700 text-white font-black text-lg gap-3 shadow-xl shadow-primary/20 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                                تأكيد وإرسال الطلب
                            </Button>

                            <div className="text-center space-y-1">
                                <p className="text-[10px] text-slate-500 font-bold italic">سيتم إرسال لك رسالة تأكيد الشراء على واتس اب.</p>
                                <p className="text-[10px] text-rose-500 font-black">قد تستغرق العملية بضع من الوقت.</p>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
