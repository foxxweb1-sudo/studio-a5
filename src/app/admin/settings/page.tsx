
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
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Layout, Wallpaper, Database, RefreshCw, AlertCircle } from 'lucide-react';
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
        description: "تم تحديث هوية التطبيق بنجاح."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "تعذر التحديث حالياً."
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
        title: "تزامن القواعد",
        description: "جاري نشر قواعد الأمان الجديدة."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل التزامن."
      });
    } finally {
      setTimeout(() => setIsUpdatingRules(false), 2000);
    }
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-center">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">إعدادات الهوية والنظام</PageHeaderTitle>
          <PageHeaderDescription>تخصيص المظهر الخارجي وتزامن البيانات</PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold gap-2">
          <ArrowLeft className="h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              هوية الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">اسم التطبيق</Label>
              <Input 
                value={formData.appName}
                onChange={(e) => setFormData({...formData, appName: e.target.value})}
                placeholder="اسم الموقع في الهيدر..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">رابط اللوجو</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  value={formData.appLogo}
                  onChange={(e) => setFormData({...formData, appLogo: e.target.value})}
                  placeholder="رابط الصورة المباشر..."
                  className="rounded-xl font-mono text-xs"
                />
                <div className="relative w-12 h-12 rounded-xl border bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                   {formData.appLogo ? (
                     <Image src={formData.appLogo} alt="Preview" fill className="object-contain p-2" />
                   ) : (
                     <ImageIcon className="h-5 w-5 text-slate-300" />
                   )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 p-6 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallpaper className="h-5 w-5 text-emerald-500" />
              صور الخلفية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">خلفية تسجيل الدخول</Label>
              <Input 
                value={formData.loginBg}
                onChange={(e) => setFormData({...formData, loginBg: e.target.value})}
                placeholder="رابط صورة الخلفية..."
                className="rounded-xl font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">خلفية إنشاء الحساب</Label>
              <Input 
                value={formData.signupBg}
                onChange={(e) => setFormData({...formData, signupBg: e.target.value})}
                placeholder="رابط صورة الخلفية..."
                className="rounded-xl font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/10 shadow-none rounded-3xl overflow-hidden bg-blue-50/30 lg:col-span-2">
          <CardHeader className="p-6 border-b border-blue-100">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
              <Database className="h-5 w-5" />
              صيانة قواعد البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="font-bold text-sm flex items-center gap-2">
                تحديث قواعد الأمان
                <Badge variant="outline" className="text-[10px] rounded-lg">مستحسن</Badge>
              </h4>
              <p className="text-xs text-slate-500 max-w-xl">
                استخدم هذا الزر لمزامنة القواعد الأمنية المحدثة مع خادم Firebase لضمان حماية بيانات الطلاب.
              </p>
            </div>
            <Button 
              onClick={handleUpdateRules} 
              disabled={isUpdatingRules}
              variant="outline"
              className="w-full md:w-auto h-11 rounded-xl font-bold px-8 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {isUpdatingRules ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              تزامن الآن
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full max-w-md h-14 rounded-2xl font-black text-lg gap-3 shadow-xl hover-lift"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          حفظ كافة التغييرات
        </Button>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 text-sm">تنبيه</h4>
          <p className="text-xs text-amber-700/80">
            تأكد من استخدام روابط صور مباشرة؛ التغييرات تظهر فور الحفظ في كافة صفحات الموقع.
          </p>
        </div>
      </div>
    </div>
  );
}
