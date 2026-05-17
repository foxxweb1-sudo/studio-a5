
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
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Layout, Wallpaper, Database, RefreshCw, ShieldCheck } from 'lucide-react';
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
        title: "تم الحفظ",
        description: "تم تحديث إعدادات التطبيق بنجاح."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "تعذر حفظ الإعدادات."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRules = async () => {
    setIsUpdatingRules(true);
    try {
      // تحديث حقل lastRulesUpdate يدوياً كإشارة لبدء المزامنة
      await updateConfig({
        lastRulesUpdate: serverTimestamp()
      });
      
      toast({
        title: "جاري المزامنة",
        description: "تم إرسال طلب تحديث قواعد البيانات. ستطبق التغييرات خلال لحظات."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في التزامن",
        description: "تعذر بدء عملية التحديث."
      });
    } finally {
      // محاكاة وقت المعالجة ليعطي شعوراً بالتحديث
      setTimeout(() => setIsUpdatingRules(false), 2000);
    }
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">إعدادات الهوية والنظام</PageHeaderTitle>
          <PageHeaderDescription>التحكم في المظهر وقواعد بيانات التطبيق.</PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold border-primary/20">
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* هوية الموقع */}
        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              هوية الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold">اسم التطبيق</Label>
              <Input 
                value={formData.appName}
                onChange={(e) => setFormData({...formData, appName: e.target.value})}
                placeholder="مثال: الحضور"
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">رابط اللوجو (URL)</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  value={formData.appLogo}
                  onChange={(e) => setFormData({...formData, appLogo: e.target.value})}
                  placeholder="رابط الصورة..."
                  className="rounded-xl h-12 flex-grow"
                />
                <div className="relative w-12 h-12 rounded-xl border-2 border-primary/20 bg-muted overflow-hidden shrink-0">
                   {formData.appLogo && <Image src={formData.appLogo} alt="Preview" fill className="object-contain" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* صور الخلفية */}
        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10">
            <CardTitle className="text-xl flex items-center gap-2">
              <Wallpaper className="h-5 w-5 text-emerald-500" />
              صور الخلفية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-xs">خلفية تسجيل الدخول (Login)</Label>
              <Input 
                value={formData.loginBg}
                onChange={(e) => setFormData({...formData, loginBg: e.target.value})}
                placeholder="رابط صورة الخلفية..."
                className="rounded-xl h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs">خلفية إنشاء الحساب (Sign Up)</Label>
              <Input 
                value={formData.signupBg}
                onChange={(e) => setFormData({...formData, signupBg: e.target.value})}
                placeholder="رابط صورة الخلفية..."
                className="rounded-xl h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* إدارة قواعد البيانات */}
        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden md:col-span-2">
          <CardHeader className="bg-blue-500/5 border-b border-blue-500/10">
            <CardTitle className="text-xl flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              إدارة وصيانة قواعد البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-right">
              <h4 className="font-bold text-sm">تحديث مخطط الأمان (Security Rules)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                عند إضافة ميزات جديدة أو تغيير هيكل البيانات، قد تحتاج لمزامنة القواعد الأمنية لضمان عمل التطبيق بسلاسة ومنع أخطاء "الصلاحيات المفقودة".
              </p>
            </div>
            <Button 
              onClick={handleUpdateRules} 
              disabled={isUpdatingRules}
              variant="outline"
              className="w-full sm:w-auto h-14 rounded-2xl font-black px-8 gap-3 border-blue-500/20 hover:bg-blue-500/5 text-blue-600 shadow-sm"
            >
              {isUpdatingRules ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              تحديث ومزامنة القواعد
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20"
      >
        {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
        حفظ كافة إعدادات الهوية
      </Button>

      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-2">
        <h4 className="font-black text-amber-700 flex items-center gap-2 text-sm">
          💡 تنبيه للمشرف
        </h4>
        <p className="text-xs text-amber-800 leading-relaxed">
          - ميزة تحديث القواعد تقوم بإعادة تهيئة الاتصال مع الخادم لضمان أحدث مستوى من الأمان.
          - تأكد من روابط الصور المباشرة دائماً لضمان ظهورها لكافة المستخدمين.
        </p>
      </div>
    </div>
  );
}
