'use client';

import { useUser, useFirestore } from '@/firebase';
import { useAppConfig } from '@/hooks/use-app-config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useRef, Suspense } from 'react';
import { ADMIN_EMAIL } from '@/lib/constants';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Layout, 
  Wallpaper, 
  Database, 
  RefreshCw, 
  AlertCircle,
  Link as LinkIcon,
  Phone,
  Facebook,
  Twitter,
  Send,
  Tag,
  ShieldCheck,
  Bell,
  UploadCloud,
  Smartphone,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'identity';
  
  const { user, isUserLoading } = useUser();
  const { config, updateConfig, isLoading: configLoading } = useAppConfig();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    appName: '',
    appLogo: '',
    appVersion: '',
    loginBg: '',
    signupBg: '',
    contactPhone: '',
    contactEmail: '',
    supportUrl: '',
    whatsappChannel: '',
    facebook: '',
    twitter: '',
    telegram: '',
    techStoreUrl: '',
    apkDownloadUrl: '',
    cookiePolicyUrl: '',
    updatesUrl: '',
    bannerAdCode: '',
    popunderAdCode: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadField = useRef<string | null>(null);

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isUserLoading, router]);

  useEffect(() => {
    if (config) {
      setFormData({
        appName: config.appName || '',
        appLogo: config.appLogo || '',
        appVersion: config.appVersion || '',
        loginBg: config.loginBg || '',
        signupBg: config.signupBg || '',
        contactPhone: config.contactPhone || '',
        contactEmail: config.contactEmail || '',
        supportUrl: config.supportUrl || '',
        whatsappChannel: config.whatsappChannel || '',
        facebook: config.facebook || '',
        twitter: config.twitter || '',
        telegram: config.telegram || '',
        techStoreUrl: config.techStoreUrl || '',
        apkDownloadUrl: config.apkDownloadUrl || '',
        cookiePolicyUrl: config.cookiePolicyUrl || '',
        updatesUrl: config.updatesUrl || '',
        bannerAdCode: config.bannerAdCode || '',
        popunderAdCode: config.popunderAdCode || ''
      });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(formData);
      toast({
        title: "تم الحفظ",
        description: "تم تحديث كافة الإعدادات وأكواد الإعلانات بنجاح."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "تعذر الحفظ حالياً."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const field = currentUploadField.current;
    if (!file || !field) return;

    setIsUploading(field);
    const body = new FormData();
    body.append('image', file);

    try {
        const res = await fetch('https://api.imgbb.com/1/upload?key=d015dd34e005b5dd56d68d2fe147c267', {
            method: 'POST',
            body
        });
        const result = await res.json();
        if (result.success) {
            setFormData(prev => ({ ...prev, [field]: result.data.url }));
            toast({ title: "تم رفع الصورة بنجاح" });
        } else {
            toast({ variant: "destructive", title: "فشل الرفع" });
        }
    } catch (err) {
        toast({ variant: "destructive", title: "خطأ في الاتصال بالخادم" });
    } finally {
        setIsUploading(null);
        currentUploadField.current = null;
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (field: string) => {
    currentUploadField.current = field;
    fileInputRef.current?.click();
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-40 px-4 relative">
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">إعدادات النظام العليا</PageHeaderTitle>
          <PageHeaderDescription>التحكم في الهوية، الإعلانات السحابية، والروابط</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-xl font-bold gap-2 shadow-lg bg-primary text-white flex-grow sm:flex-initial h-11 px-6"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ كافة التغييرات
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold gap-2 flex-grow sm:flex-initial h-11 px-6">
            <ArrowLeft className="h-4 w-4" />
            رجوع
          </Button>
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-8 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="identity" className="rounded-lg font-bold py-2.5">الهوية والصور</TabsTrigger>
          <TabsTrigger value="ads" className="rounded-lg font-bold py-2.5">إدارة الإعلانات</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg font-bold py-2.5">التواصل والروابط</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-6">
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
                    placeholder="اسم الموقع..."
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4" /> إصدار التطبيق
                  </Label>
                  <Input 
                    value={formData.appVersion}
                    onChange={(e) => setFormData({...formData, appVersion: e.target.value})}
                    placeholder="v3.77.0"
                    className="rounded-xl h-11 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">لوجو الموقع</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.appLogo}
                      onChange={(e) => setFormData({...formData, appLogo: e.target.value})}
                      placeholder="رابط اللوجو..."
                      className="rounded-xl h-11 font-mono text-xs flex-grow"
                    />
                    <Button variant="outline" size="sm" className="rounded-xl h-11 border-dashed gap-2" onClick={() => triggerUpload('appLogo')} disabled={!!isUploading}>
                        {isUploading === 'appLogo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        رفع
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 p-6 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallpaper className="h-5 w-5 text-emerald-500" />
                  صور القاعدة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">خلفية تسجيل الدخول</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.loginBg}
                      onChange={(e) => setFormData({...formData, loginBg: e.target.value})}
                      placeholder="رابط الخلفية..."
                      className="rounded-xl h-11 font-mono text-xs flex-grow"
                    />
                    <Button variant="outline" size="sm" className="rounded-xl h-11 border-dashed gap-2" onClick={() => triggerUpload('loginBg')} disabled={!!isUploading}>
                        {isUploading === 'loginBg' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        رفع
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">خلفية إنشاء الحساب</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.signupBg}
                      onChange={(e) => setFormData({...formData, signupBg: e.target.value})}
                      placeholder="رابط الخلفية..."
                      className="rounded-xl h-11 font-mono text-xs flex-grow"
                    />
                    <Button variant="outline" size="sm" className="rounded-xl h-11 border-dashed gap-2" onClick={() => triggerUpload('signupBg')} disabled={!!isUploading}>
                        {isUploading === 'signupBg' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        رفع
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
            <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white">
                <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl flex items-center gap-3">
                        <Code className="h-6 w-6 text-indigo-400" />
                        إدارة الإعلانات السحابية
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <Label className="text-slate-400 font-bold flex items-center gap-2">
                                <Badge variant="outline" className="text-indigo-400 border-indigo-400/30">JS/HTML</Badge>
                                كود إعلان البانر (Banner Ad)
                            </Label>
                            <Textarea 
                                value={formData.bannerAdCode}
                                onChange={(e) => setFormData({...formData, bannerAdCode: e.target.value})}
                                placeholder="ضع كود الـ Script الخاص بالبانر هنا..."
                                className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl font-mono text-xs text-emerald-400 focus:bg-white/10 transition-all"
                            />
                            <p className="text-[10px] text-slate-500 italic font-medium">سيظهر هذا الكود في المساحات المخصصة للإعلانات للمستخدمين العاديين.</p>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-slate-400 font-bold flex items-center gap-2">
                                <Badge variant="outline" className="text-rose-400 border-rose-400/30">POPUNDER</Badge>
                                كود إعلان النوافذ المنبثقة (Pop-under)
                            </Label>
                            <Textarea 
                                value={formData.popunderAdCode}
                                onChange={(e) => setFormData({...formData, popunderAdCode: e.target.value})}
                                placeholder="ضع كود الـ Script الخاص بالبوب اندر هنا..."
                                className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl font-mono text-xs text-amber-400 focus:bg-white/10 transition-all"
                            />
                            <p className="text-[10px] text-slate-500 italic font-medium">هذا الكود سيتم حقنه في خلفية الموقع ليظهر لمرة واحدة لكل جلسة.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
                        <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="font-bold text-indigo-200 text-sm">ملاحظة أمنية</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                يرجى التأكد من أن الأكواد التي تضعها آمنة ومأخوذة من شركات إعلانية موثوقة. الأكواد الخاطئة قد تسبب بطء في الموقع أو مشاكل في العرض.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 p-6 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  بيانات التواصل المباشر
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">رقم الواتساب (بدون +)</Label>
                  <Input 
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="مثال: 201121473424"
                    className="rounded-xl h-11 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">البريد الإلكتروني للدعم</Label>
                  <Input 
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="support@example.com"
                    className="rounded-xl h-11 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">رابط تذاكر الدعم الفني</Label>
                  <Input 
                    value={formData.supportUrl}
                    onChange={(e) => setFormData({...formData, supportUrl: e.target.value})}
                    placeholder="https://support-portal.com/new"
                    className="rounded-xl h-11 font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 p-6 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-emerald-500" />
                  روابط منصاتنا والسياسات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Send className="h-4 w-4 text-emerald-600" /> قناة الواتساب
                    </Label>
                    <Input 
                      value={formData.whatsappChannel}
                      onChange={(e) => setFormData({...formData, whatsappChannel: e.target.value})}
                      placeholder="رابط القناة..."
                      className="rounded-xl h-11 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-indigo-600" /> رابط تحميل APK
                    </Label>
                    <Input 
                      value={formData.apkDownloadUrl}
                      onChange={(e) => setFormData({...formData, apkDownloadUrl: e.target.value})}
                      placeholder="https://..."
                      className="rounded-xl h-11 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" /> رابط السياسات
                    </Label>
                    <Input 
                      value={formData.cookiePolicyUrl}
                      onChange={(e) => setFormData({...formData, cookiePolicyUrl: e.target.value})}
                      placeholder="/privacy"
                      className="rounded-xl h-11 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-500" /> رابط الإشعارات
                    </Label>
                    <Input 
                      value={formData.updatesUrl}
                      onChange={(e) => setFormData({...formData, updatesUrl: e.target.value})}
                      placeholder="https://..."
                      className="rounded-xl h-11 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" /> فيسبوك
                    </Label>
                    <Input 
                      value={formData.facebook}
                      onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                      placeholder="رابط الصفحة..."
                      className="rounded-xl h-11 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-slate-900" /> تويتر X
                    </Label>
                    <Input 
                      value={formData.twitter}
                      onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                      placeholder="رابط الحساب..."
                      className="rounded-xl h-11 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="font-bold">رابط CybeNode STORE</Label>
                  <Input 
                    value={formData.techStoreUrl}
                    onChange={(e) => setFormData({...formData, techStoreUrl: e.target.value})}
                    placeholder="رابط متجر التطبيقات..."
                    className="rounded-xl h-11 text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Made with ❤️ by <span className="text-primary font-black">CybeNode</span>
          </p>
      </div>
    </div>
  );
}

export default function AdminAppSettingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" /></div>}>
        <SettingsContent />
    </Suspense>
  );
}
