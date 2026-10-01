'use client';

import { useUser } from '@/firebase';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  CheckCircle2, 
  UserCheck, 
  ShieldCheck, 
  MessageCircle, 
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useAppConfig } from '@/hooks/use-app-config';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useUser();
  const { config } = useAppConfig();
  
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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 px-4 animate-in fade-in duration-700">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
               <Zap className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">بوابة باقة المساعد</PageHeaderTitle>
          </div>
          <PageHeaderDescription>احصل على تجربة إدارة احترافية لفصولك الدراسية.</PageHeaderDescription>
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

      <div className="grid grid-cols-1 gap-8 items-start">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                              <div className="p-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                                  <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <p className="font-bold text-slate-700 dark:text-slate-200">{feature}</p>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-10 p-6 bg-primary/5 rounded-[2.5rem] border border-dashed border-primary/20 text-center space-y-4">
                      <p className="font-bold text-slate-600 leading-relaxed">
                          للاشتراك في الباقة وتخصيص مساعدك الشخصي، يرجى التواصل مع فريق الدعم الفني مباشرة عبر الواتساب.
                      </p>
                      <Button asChild className="h-16 px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-xl gap-3 shadow-xl">
                          <a href={`https://wa.me/${config.contactPhone}?text=${encodeURIComponent(`أهلاً، أريد الاشتراك في باقة المساعد الشخصي للـ UID: ${user.uid}`)}`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-6 w-6" />
                              اطلب مساعدك الآن
                          </a>
                      </Button>
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}