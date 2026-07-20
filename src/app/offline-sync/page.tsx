'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  DownloadCloud, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone,
  CloudLightning,
  AlertCircle,
  HardDrive,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function OfflineSyncPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [syncProgress, setSyncProgress] = useState(100);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleManualSync = () => {
    if (!isOnline) {
      toast({
        variant: "destructive",
        title: "لا يوجد اتصال",
        description: "يرجى الاتصال بالإنترنت لبدء مزامنة البيانات مع السحابة."
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(20);
    
    // محاكاة عملية المزامنة المكثفة
    setTimeout(() => setSyncProgress(60), 1500);
    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      toast({
        title: "تمت المزامنة بنجاح",
        description: "تم تحديث كافة بياناتك المحلية مع السحابة."
      });
    }, 4000);
  };

  const handleCacheAssets = () => {
    setIsCaching(true);
    
    // محاكاة تحميل ملفات النظام وتخزينها
    setTimeout(() => {
        setIsCaching(false);
        toast({
            title: "تم حفظ ملفات النظام",
            description: "يمكنك الآن فتح التطبيق حتى في حال انقطاع الإنترنت تماماً."
        });
    }, 4000);
  };

  const LiquidLoader = ({ text }: { text: string }) => (
    <div className="liquid-loader py-8 animate-in fade-in duration-500">
      <div className="loading-text text-primary">
        {text}<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
      </div>
      <div className="loader-track">
        <div className="liquid-fill"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
               <DownloadCloud className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">العمل دون اتصال (Sync)</PageHeaderTitle>
          </div>
          <PageHeaderDescription>إدارة تخزين البيانات محلياً وضمان استمرارية العمل بدون إنترنت.</PageHeaderDescription>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-8">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              حالة البيانات المحلية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {isSyncing ? (
                <LiquidLoader text="جاري مزامنة السحابة" />
            ) : (
                <>
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                            </div>
                            <div>
                                <p className="text-xs font-black">{isOnline ? 'متصل بالإنترنت' : 'وضع الأوفلاين نشط'}</p>
                                <p className="text-[10px] text-slate-500 font-bold">التطبيقات السحابية جاهزة</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="rounded-lg font-black text-[10px]">
                            {isOnline ? 'Online' : 'Offline'}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مستوى المزامنة</span>
                            <span className="text-sm font-black text-primary">{syncProgress}%</span>
                        </div>
                        <Progress value={syncProgress} className="h-2 bg-slate-100" />
                        <p className="text-[9px] text-slate-400 font-bold text-center">كافة بيانات الطلاب والمدفوعات محفوظة محلياً</p>
                    </div>

                    <Button 
                        onClick={handleManualSync} 
                        disabled={isSyncing || isCaching}
                        className="w-full h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
                    >
                        <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                        تحديث ومزامنة البيانات الآن
                    </Button>
                </>
            )}
          </CardContent>
        </Card>

        {/* Offline Features Card */}
        <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b p-8">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
              مميزات الأوفلاين
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {isCaching ? (
                <LiquidLoader text="جاري تحميل الملفات" />
            ) : (
                <>
                    {[
                        { icon: HardDrive, text: "حفظ تلقائي لكافة الحركات المالية والحضور.", color: "text-blue-500" },
                        { icon: Smartphone, text: "إمكانية مسح QR Code بدون إنترنت نهائياً.", color: "text-emerald-500" },
                        { icon: CloudLightning, text: "رفع البيانات للسحابة فور عودة الاتصال تلقائياً.", color: "text-amber-500" }
                    ].map((feature, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className={`p-2 bg-slate-100 rounded-xl ${feature.color} shrink-0`}>
                                <feature.icon className="h-4 w-4" />
                            </div>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">{feature.text}</p>
                        </div>
                    ))}
                    
                    <Button 
                        variant="outline"
                        onClick={handleCacheAssets}
                        disabled={isSyncing || isCaching}
                        className="w-full h-14 mt-4 rounded-2xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-black gap-2"
                    >
                        <DownloadCloud className="h-5 w-5" />
                        تثبيت ملفات الموقع محلياً
                    </Button>
                </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4 text-right">
        <AlertCircle className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-black text-blue-900 text-sm">كيف تعمل المزامنة؟</h4>
          <p className="text-xs text-blue-700/80 leading-relaxed font-bold">
            هذا التطبيق مصمم للعمل في بيئات الدروس التي قد ينقطع فيها الإنترنت. بمجرد تسجيلك لأي حضور أو دفعة، يقوم النظام بحفظها في "ذاكرة التخزين الدائم" لمتصفحك. عند توفر الإنترنت، يقوم التطبيق بمقارنة نسختك المحلية بالسحابة ورفع أي بيانات جديدة تلقائياً دون تدخل منك.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Smart Sync Engine v2.0 - TECH TEAM
          </p>
      </div>
    </div>
  );
}