
'use client';

import { useUser } from '@/firebase';
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
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Image as ImageIcon, 
  Layout, 
  Wallpaper, 
  Database, 
  RefreshCw, 
  AlertCircle,
  Link as LinkIcon,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Send,
  LifeBuoy,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminAppSettingsPage() {
  const router = useRouter();
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
    techStoreUrl: ''
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
        techStoreUrl: config.techStoreUrl || ''
      });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(formData);
      toast({
        title: "تم الحفظ",
        description: "تم تحديث كافة الإعدادات والروابط بنجاح."
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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-40 px-4 relative">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">إعدادات النظام</PageHeaderTitle>
          <PageHeaderDescription>التحكم في الهوية، الصور، والروابط</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-xl font-bold gap-2 shadow-lg bg-primary text-white flex-grow sm:flex-initial h-11 px-6"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ الإعدادات
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold gap-2 flex-grow sm:flex-initial h-11 px-6">
            <ArrowLeft className="h-4 w-4" />
            رجوع
          </Button>
        </div>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-8 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="identity" className="rounded-lg font-bold py-2.5">الهوية والصور</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg font-bold py-2.5">التواصل والروابط</TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg font-bold py-2.5">صيانة النظام</TabsTrigger>
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
                  <Label className="font-bold">رابط اللوجو</Label>
                  <div className="flex gap-4 items-center">
                    <Input 
                      value={formData.appLogo}
                      onChange={(e) => setFormData({...formData, appLogo: e.target.value})}
                      placeholder="رابط الصورة..."
                      className="rounded-xl h-11 font-mono text-xs"
                    />
                    <div className="relative w-12 h-12 rounded-xl border bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
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
                    placeholder="رابط الخلفية..."
                    className="rounded-xl h-11 font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">خلفية إنشاء الحساب</Label>
                  <Input 
                    value={formData.signupBg}
                    onChange={(e) => setFormData({...formData, signupBg: e.target.value})}
                    placeholder="رابط الخلفية..."
                    className="rounded-xl h-11 font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
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
                  روابط منصاتنا
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
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Send className="h-4 w-4 text-sky-500" /> تلجرام
                    </Label>
                    <Input 
                      value={formData.telegram}
                      onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                      placeholder="رابط القناة..."
                      className="rounded-xl h-11 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="font-bold">رابط TECH STORE</Label>
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

        <TabsContent value="system" className="space-y-6">
          <Card className="border-2 border-blue-500/10 shadow-none rounded-3xl overflow-hidden bg-blue-50/30">
            <CardHeader className="p-6 border-b border-blue-100">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                <Database className="h-5 w-5" />
                صيانة القواعد الأمنية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  تحديث مخطط الأمان
                  <Badge variant="outline" className="text-[10px] rounded-lg">مستحسن</Badge>
                </h4>
                <p className="text-xs text-slate-500 max-w-xl">
                  استخدم هذا الزر لمزامنة القواعد الأمنية المحدثة مع خادم Firebase لضمان حماية بيانات الطلاب وخصوصية المعلمين.
                </p>
              </div>
              <Button 
                onClick={handleUpdateRules} 
                disabled={isUpdatingRules}
                variant="outline"
                className="w-full md:w-auto h-11 rounded-xl font-bold px-8 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {isUpdatingRules ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                تزامن القواعد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 mb-10">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 text-sm">ملاحظة هامة</h4>
          <p className="text-xs text-amber-700/80">
            يرجى التأكد من صحة روابط التواصل (بدءاً بـ https://) لضمان عمل أزرار المشاركة والتواصل لدى المستخدمين بشكل سليم.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Made with ❤️ by TECH TEAM
          </p>
      </div>
    </div>
  );
}
