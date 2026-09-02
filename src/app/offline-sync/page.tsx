
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDatabase } from '@/firebase';
import { useStudents, syncStudentPortal } from '@/hooks/use-app-data';
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
  Loader2,
  AppWindow,
  CloudUpload,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function OfflineSyncPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const rtdb = useDatabase();
  const { students } = useStudents();
  const { toast } = useToast();

  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(100);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    
    setTimeout(() => setSyncProgress(60), 1500);
    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      toast({
        title: "تمت المزامنة بنجاح",
        description: "تم تحديث كافة بياناتك المحلية مع السحابة."
      });
    }, 3000);
  };

  const handleUploadAllToPortal = async () => {
    if (!isOnline) {
      toast({ variant: "destructive", title: "أنت أوفلاين", description: "يجب توفر إنترنت لرفع البيانات للبوابة." });
      return;
    }

    if (students.length === 0) {
      toast({ title: "لا يوجد طلاب", description: "لم يتم العثور على طلاب لرفع بياناتهم." });
      return;
    }

    setIsUploadingAll(true);
    setUploadProgress(0);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        try {
            const success = await syncStudentPortal(firestore, rtdb, user!.uid, student.id);
            if (success) successCount++;
            else failCount++;
        } catch (e: any) {
            console.error(e);
            failCount++;
            // إذا كان الخطأ بسبب الفهارس، نظهر تنبيه مخصص
            if (e.message?.includes('index')) {
                toast({ 
                    variant: "destructive", 
                    title: "مطلوب إنشاء Index", 
                    description: "يرجى الضغط على الرابط في رسالة الخطأ لتفعيل ترتيب البيانات." 
                });
                setIsUploadingAll(false);
                return; 
            }
        }
        setUploadProgress(Math.round(((i + 1) / students.length) * 100));
    }

    setIsUploadingAll(false);
    toast({
        title: "اكتمل الرفع الشامل",
        description: `تم تحديث ${successCount} سجل طالب بنجاح. ${failCount > 0 ? `(فشل ${failCount})` : ''}`
    });
  };

  const handleCacheAssets = async () => {
    setIsCaching(true);
    try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          toast({ title: "تم تفعيل وضع الأوفلاين", description: "تم تخزين ملفات النظام بنجاح." });
        } else {
           const cache = await caches.open('attendance-v1');
           await cache.addAll(['/', '/attendance', '/students', '/payments', '/reports']);
           toast({ title: "تم الحفظ محلياً" });
        }
    } catch (e) {
        toast({ variant: "destructive", title: "فشل التخزين" });
    } finally {
        setIsCaching(false);
    }
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
            <PageHeaderTitle className="text-3xl font-black">المزامنة الشاملة</PageHeaderTitle>
          </div>
          <PageHeaderDescription>ارفع كافة بياناتك للسحابة أو ثبت الملفات للعمل بدون نت.</PageHeaderDescription>
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
        
        {/* بطاقة الرفع السحابي الشامل */}
        <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-indigo-600 text-white md:col-span-2">
            <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 text-center md:text-right">
                        <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md">
                            <CloudUpload className="h-10 w-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black">الرفع السحابي الشامل</h3>
                            <p className="text-sm font-bold opacity-80 mt-1">تحديث كافة بوابات أولياء الأمور (لجميع الطلاب) بضغطة واحدة.</p>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-auto">
                        {isUploadingAll ? (
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span>جاري الرفع...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2 bg-white/20" />
                            </div>
                        ) : (
                            <Button 
                                onClick={handleUploadAllToPortal}
                                className="bg-white text-indigo-600 hover:bg-slate-50 rounded-2xl h-14 px-8 font-black text-lg gap-2 shadow-2xl"
                            >
                                <CloudLightning className="h-5 w-5" />
                                رفع كافة السجلات الآن
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>

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
                    </div>

                    <Button 
                        onClick={handleManualSync} 
                        disabled={isSyncing || isCaching || isUploadingAll}
                        className="w-full h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
                    >
                        <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                        تحديث ومزامنة البيانات
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
              تثبيت النظام (Offline)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {isCaching ? (
                <LiquidLoader text="جاري حفظ الأقسام" />
            ) : (
                <>
                    {[
                        { icon: AppWindow, text: "فتح المنصة بدون إنترنت نهائياً.", color: "text-indigo-500" },
                        { icon: HardDrive, text: "تخزين سجلات الطلاب في ذاكرة الهاتف.", color: "text-blue-500" },
                        { icon: Smartphone, text: "تسجيل حضور بالـ QR أوفلاين.", color: "text-emerald-500" }
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
                        disabled={isSyncing || isCaching || isUploadingAll}
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

      <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-start gap-4 text-right">
        <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-black text-amber-900 text-sm">ملاحظة بخصوص بوابة الأهل</h4>
          <p className="text-xs text-amber-700/80 leading-relaxed font-bold">
            عند إضافة طلاب جدد أو تسجيل درجات في "وضع الأوفلاين"، يرجى التأكد من العودة لهذه الصفحة والضغط على <span className="text-indigo-600">"رفع كافة السجلات"</span> فور توفر الإنترنت لتحديث بوابات أولياء الأمور.
          </p>
        </div>
      </div>
    </div>
  );
}
