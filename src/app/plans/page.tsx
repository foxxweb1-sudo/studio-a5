'use client';

import { useState } from 'react';
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
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  Send,
  Loader2,
  Star,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TELEGRAM_BOT_TOKEN = '8611761572:AAHV4uw_Adq7d3rlSQ0E8jbbLTOXHB5Q2cw';
  const TELEGRAM_CHAT_ID = '7086574224';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال رقم هاتف صحيح للتواصل." });
      return;
    }

    setIsSubmitting(true);
    
    const message = `
🔔 *طلب اشتراك جديد: باقة المساعد الشخصي*
-------------------------------
👤 *الاسم:* ${user?.displayName || 'مستخدم غير مسجل'}
📧 *البريد:* ${user?.email || 'غير متوفر'}
📱 *رقم الهاتف:* ${phone}
🆔 *UID:* \`${user?.uid || 'N/A'}\`
💰 *الباقة:* مساعد شخصي (100 ج.م)
-------------------------------
⏰ *التاريخ:* ${new Date().toLocaleString('ar-EG')}
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
          description: "سيتواصل معك المساعد الشخصي عبر الواتساب خلال ساعات قليلة.",
        });
        setPhone('');
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "عذراً، حدث خطأ",
        description: "فشل إرسال الطلب، يمكنك المحاولة عبر الواتساب مباشرة."
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

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
               <Zap className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">الباقات المميزة</PageHeaderTitle>
          </div>
          <PageHeaderDescription>اختر الباقة التي تناسب احتياجاتك التعليمية.</PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 h-12 px-6 font-bold"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Features Section */}
        <div className="lg:col-span-3 space-y-6">
            <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-emerald-500/5 border-b p-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                            <UserCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-emerald-700">باقة المساعد الشخصي</CardTitle>
                            <Badge className="bg-yellow-400 text-emerald-900 font-black px-3 py-1 rounded-lg mt-1">الأكثر طلباً</Badge>
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
                    
                    <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-5xl font-black text-emerald-600 tabular-nums">100</span>
                            <span className="text-xl font-bold text-slate-400">ج.م / شهرياً</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">عرض خاص لفترة محدودة</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Action Form */}
        <div className="lg:col-span-2 space-y-6 sticky top-24">
            <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        طلب اشتراك فوري
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleSubscribe} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 px-1">رقم الواتساب للتواصل</Label>
                            <Input 
                                placeholder="01XXXXXXXXX" 
                                className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-mono text-center text-xl focus:bg-white/10 transition-all"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <Button 
                            type="submit"
                            className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                            إرسال طلب الاشتراك
                        </Button>
                    </form>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 bg-white/5 p-4 rounded-2xl">
                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            <span>طلبك سيصل مباشرة للمدير الفني لمعالجته فوراً.</span>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                            بمجرد الإرسال، ستظهر بياناتك لدى فريق TECH وسنقوم بالتواصل معك لتفعيل الخدمة واستلام بيانات طلابك.
                        </p>
                    </div>
                </CardContent>
            </Card>
            
            <Button 
                variant="link" 
                asChild 
                className="w-full text-slate-400 font-bold gap-2 hover:text-emerald-500"
            >
                <a href="https://wa.me/201121473424" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    تواصل معنا مباشرة عبر واتساب
                </a>
            </Button>
        </div>

      </div>
    </div>
  );
}
