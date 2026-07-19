
'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Coffee, Smartphone, Mail, Copy, CheckCircle2, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/app/lib/placeholder-images.json';

export default function SupportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const supportInfo = {
    vodafone: "01029583799",
    paypal: "tech.support.app@gmail.com"
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "تم النسخ بنجاح" });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
               <Coffee className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">Buy Me a Coffee</PageHeaderTitle>
          </div>
          <PageHeaderDescription>ادعم استمرارية وتطوير التطبيق لنقدم لك الأفضل دائماً.</PageHeaderDescription>
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

      <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-0">
            <div className="relative w-full aspect-video sm:aspect-[21/9]">
                <Image 
                    src={placeholderImages.support_image.url}
                    alt="Support TECH"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                    <div className="text-white space-y-2">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <Heart className="h-6 w-6 text-rose-500 fill-current" />
                            دعمكم سر نجاحنا
                        </h2>
                        <p className="text-sm font-bold opacity-80">نقدر ثقتكم ودعمكم المستمر لفريق العمل.</p>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vodafone Cash */}
                    <div className="group p-6 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                <Smartphone className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-emerald-900">Vodafone Cash</h4>
                                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Mobile Wallet</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 text-center border border-emerald-200">
                                <code className="text-2xl font-black text-emerald-700 tracking-wider tabular-nums">{supportInfo.vodafone}</code>
                            </div>
                            <Button 
                                size="icon"
                                className={`absolute -top-3 -left-3 h-10 w-10 rounded-full transition-all shadow-lg ${copiedField === 'vodafone' ? 'bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                onClick={() => handleCopy(supportInfo.vodafone, 'vodafone')}
                            >
                                {copiedField === 'vodafone' ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* PayPal */}
                    <div className="group p-6 rounded-[2rem] bg-blue-50 border-2 border-blue-100 hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-blue-900">PayPal Support</h4>
                                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest">Global Support</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 text-center border border-blue-200">
                                <code className="text-xs sm:text-sm font-black text-blue-700 truncate block">{supportInfo.paypal}</code>
                            </div>
                            <Button 
                                size="icon"
                                className={`absolute -top-3 -left-3 h-10 w-10 rounded-full transition-all shadow-lg ${copiedField === 'paypal' ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={() => handleCopy(supportInfo.paypal, 'paypal')}
                            >
                                {copiedField === 'paypal' ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 text-center">
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                        شكراً لكل من يساهم في بقاء هذا العمل متاحاً للجميع. <br className="hidden sm:block"/>
                        كل مبلغ تساهم به يساعدنا على تغطية تكاليف الخوادم وتطوير ميزات جديدة تخدم العملية التعليمية.
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
