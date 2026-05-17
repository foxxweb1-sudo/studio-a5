
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useAppConfig } from '@/hooks/use-app-config';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ADMIN_EMAIL } from '@/lib/constants';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Layout, Wallpaper, Database, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { serverTimestamp } from 'firebase/firestore';

export default function AdminAppSettingsPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { config, updateConfig, isLoading: configLoading } = useAppConfig();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    appName: '',
    appLogo: '',
    loginBg: '',
    signupBg: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingRules, setIsUpdatingRules] = useState(false);

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isUserLoading, router]);

  useEffect(() => {
    if (config) {
      setFormData(prev => {
        if (
          prev.appName === (config.appName || '') &&
          prev.appLogo === (config.appLogo || '') &&
          prev.loginBg === (config.loginBg || '') &&
          prev.signupBg === (config.signupBg || '')
        ) {
          return prev;
        }
        return {
          appName: config.appName || '',
          appLogo: config.appLogo || '',
          loginBg: config.loginBg || '',
          signupBg: config.signupBg || ''
        };
      });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(formData);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات الهوية البصرية للتطبيق."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "تعذر تحديث الإعدادات حالياً."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRules = async () => {
    setIsUpdatingRules(true);
    try {
      await updateConfig({
        lastRulesUpdate: serverTimestamp()
      });
      
      toast({
        title: "بدء التزامن",
        description: "جاري تحديث ونشر قواعد الأمان على الخادم."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل التزامن",
        description: "حدث خطأ غير متوقع أثناء تحديث القواعد."
      });
    } finally {
      setTimeout(() => setIsUpdatingRules(false), 2500);
    }
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-32 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-4xl font-black text-slate-900">إعدادات الهوية والنظام</PageHeaderTitle>
          <PageHeaderDescription className="text-lg font-medium opacity-70">التحكم في المظهر وتزامن قواعد البيانات.</PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.back()} className="rounded-2xl h-14 px-8 font-black border-slate-300 gap-3">
          <ArrowLeft className="h-5 w-5" />
          رجوع للخلف
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* هوية الموقع */}
        <Card className="border-0 shadow-2xl rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-100">
          <CardHeader className="bg-primary/5 border-b-2 border-primary/5 p-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <Layout className="h-7 w-7 text-primary" />
              هوية الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-3">
              <Label className="font-black text-slate-700 text-sm">اسم التطبيق الرئيسي</Label>
              <Input 
                value={formData.appName}
                onChange={(e) => setFormData({...formData, appName: e.target.value})}
                placeholder="أدخل الاسم الذي سيظهر في الهيدر..."
                className="rounded-2xl h-14 bg-slate-50 border-slate-200 focus:bg-white transition-all text-lg font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-black text-slate-700 text-sm">رابط اللوجو (Logo URL)</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  value={formData.appLogo}
                  onChange={(e) => setFormData({...formData, appLogo: e.target.value})}
                  placeholder="رابط مباشر للصورة (PNG/JPG)..."
                  className="rounded-2xl h-14 bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono text-xs"
                />
                <div className="relative w-16 h-16 rounded-2xl border-4 border-primary/10 bg-white overflow-hidden shrink-0 shadow-inner flex items-center justify-center p-2">
                   {formData.appLogo ? (
                     <Image src={formData.appLogo} alt="Preview" fill className="object-contain p-2" />
                   ) : (
                     <ImageIcon className="h-8 w-8 text-slate-300" />
                   )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* صور الخلفية */}
        <Card className="border-0 shadow-2xl rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-100">
          <CardHeader className="bg-emerald-500/5 border-b-2 border-emerald-500/5 p-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <Wallpaper className="h-7 w-7 text-emerald-500" />
              صور الخلفية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-3">
              <Label className="font-black text-slate-700 text-sm">خلفية تسجيل الدخول (Login Page)</Label>
              <Input 
                value={formData.loginBg}
                onChange={(e) => setFormData({...formData, loginBg: e.target.value})}
                placeholder="رابط صورة الخلفية..."
                className="rounded-2xl h-14 bg-slate-50 border-slate-200 font-mono text-xs"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-black text-slate-700 text-sm">خلفية إنشاء الحساب (Sign Up)</Label>
              <Input 
                value={formData.signupBg}
                onChange={(e) => setFormData({...formData, signupBg: e.target.value})}
                placeholder="رابط صورة الخلفية..."
                className="rounded-2xl h-14 bg-slate-50 border-slate-200 font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* إدارة قواعد البيانات */}
        <Card className="border-4 border-blue-500/10 shadow-2xl rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden lg:col-span-2">
          <CardHeader className="bg-blue-600/5 border-b-2 border-blue-500/5 p-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <Database className="h-7 w-7 text-blue-600" />
              صيانة وأمان قواعد البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-right flex-grow">
              <h4 className="font-black text-xl text-blue-700 flex items-center gap-2">
                تحديث مخطط الأمان الشامل
                <Badge variant="outline" className="border-blue-300 text-blue-600 rounded-lg">مستحسن</Badge>
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl font-medium">
                هذا الخيار يقوم بإرسال نبضة برمجية لخادم Firebase لإعادة قراءة وتفعيل القواعد الأمنية المحدثة. استخدمه دائماً بعد إجراء أي تعديلات جذرية في هيكل الحسابات أو الطلاب لضمان الحماية القصوى.
              </p>
            </div>
            <Button 
              onClick={handleUpdateRules} 
              disabled={isUpdatingRules}
              variant="outline"
              className="w-full md:w-auto h-20 rounded-[2rem] font-black px-12 gap-4 border-2 border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all text-blue-600 shadow-xl hover:shadow-blue-500/30 text-lg group"
            >
              {isUpdatingRules ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <RefreshCw className="h-7 w-7 group-hover:rotate-180 transition-transform duration-700" />
              )}
              تحديث ومزامنة القواعد
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-8 z-30 px-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full h-20 rounded-[2.5rem] font-black text-2xl gap-4 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-[1.02] transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isSaving ? (
            <Loader2 className="h-8 w-8 animate-spin relative z-10" />
          ) : (
            <Save className="h-8 w-8 relative z-10" />
          )}
          <span className="relative z-10">حفظ كافة التغييرات على الهوية</span>
        </Button>
      </div>

      <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/30 rounded-[2.5rem] flex items-start gap-5 shadow-sm">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h4 className="font-black text-amber-800 dark:text-amber-500 text-lg">تنبيهات هامة للمشرف الفني</h4>
          <ul className="text-sm text-amber-700/80 dark:text-amber-400/80 space-y-1 font-bold leading-relaxed">
            <li>• تأكد من صحة روابط الصور المباشرة؛ الروابط الخاطئة ستؤدي لعدم ظهور الشعار.</li>
            <li>• عملية تحديث القواعد قد تستغرق بضع ثوانٍ لتظهر فعاليتها لدى كافة المستخدمين.</li>
            <li>• اسم التطبيق سيظهر في الهيدر، وفي شاشات الدخول، وفي رسائل المساعد الذكي.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
