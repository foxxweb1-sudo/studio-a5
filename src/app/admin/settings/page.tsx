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
  Wallpaper, 
  UploadCloud,
  Globe,
  Settings as SettingsIcon,
  Link as LinkIcon,
  ShieldCheck,
  Facebook,
  Twitter,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'identity';
  
  const { user, isUserLoading } = useUser();
  const { config, updateConfig, isLoading: configLoading } = useAppConfig();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadField = useRef<string | null>(null);

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!isAdmin) router.push('/');
  }, [isAdmin, isUserLoading, router]);

  useEffect(() => {
    if (config) {
      setFormData({ ...config });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(formData);
      toast({ title: "تم الحفظ بنجاح", description: "تم تحديث معايير المنصة العالمية." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
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
            setFormData((prev: any) => ({ ...prev, [field]: result.data.url }));
            toast({ title: "تم الرفع بنجاح" });
        }
    } catch (err) {
        toast({ variant: "destructive", title: "خطأ في الاتصال" });
    } finally {
        setIsUploading(null);
        currentUploadField.current = null;
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isUserLoading || !isAdmin) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-40 px-4">
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">إدارة المعايير</PageHeaderTitle>
          <PageHeaderDescription>التحكم الكامل في هوية المنصة وروابطها.</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-bold gap-2 h-11 px-8">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ التغييرات
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl h-11"><ArrowLeft className="h-4 w-4" /></Button>
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl mb-8 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="identity" className="rounded-xl font-black py-3 px-6">الهوية البصرية</TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl font-black py-3 px-6">الروابط والدعم</TabsTrigger>
          <TabsTrigger value="policy" className="rounded-xl font-black py-3 px-6">السياسات</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-sm">
                    <CardHeader className="bg-primary/5 border-b"><CardTitle className="text-lg flex items-center gap-2"><SettingsIcon className="h-5 w-5" /> هوية الموقع</CardTitle></CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2"><Label>اسم التطبيق</Label><Input value={formData.appName} onChange={(e) => setFormData({...formData, appName: e.target.value})} className="rounded-xl h-12" /></div>
                        <div className="space-y-2"><Label>الإصدار</Label><Input value={formData.appVersion} onChange={(e) => setFormData({...formData, appVersion: e.target.value})} className="rounded-xl h-12 font-mono" /></div>
                        <div className="space-y-2">
                            <Label>رابط اللوجو</Label>
                            <div className="flex gap-2">
                                <Input value={formData.appLogo} onChange={(e) => setFormData({...formData, appLogo: e.target.value})} className="rounded-xl h-12 text-xs font-mono" />
                                <Button variant="outline" className="rounded-xl border-dashed" onClick={() => {currentUploadField.current = 'appLogo'; fileInputRef.current?.click()}}>رفع</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-sm">
                    <CardHeader className="bg-emerald-50 border-b"><CardTitle className="text-lg flex items-center gap-2"><Wallpaper className="h-5 w-5" /> الخلفيات</CardTitle></CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>خلفية الدخول</Label>
                            <div className="flex gap-2">
                                <Input value={formData.loginBg} onChange={(e) => setFormData({...formData, loginBg: e.target.value})} className="rounded-xl h-12 text-xs font-mono" />
                                <Button variant="outline" className="rounded-xl border-dashed" onClick={() => {currentUploadField.current = 'loginBg'; fileInputRef.current?.click()}}>رفع</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>خلفية التسجيل</Label>
                            <div className="flex gap-2">
                                <Input value={formData.signupBg} onChange={(e) => setFormData({...formData, signupBg: e.target.value})} className="rounded-xl h-12 text-xs font-mono" />
                                <Button variant="outline" className="rounded-xl border-dashed" onClick={() => {currentUploadField.current = 'signupBg'; fileInputRef.current?.click()}}>رفع</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
            <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-sm">
                <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> روابط التواصل والتحميل</CardTitle></CardHeader>
                <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>رابط APK (أندرويد)</Label><Input value={formData.apkDownloadUrl} onChange={(e) => setFormData({...formData, apkDownloadUrl: e.target.value})} className="rounded-xl h-12 font-mono" /></div>
                    <div className="space-y-2"><Label>رابط التحديثات</Label><Input value={formData.updatesUrl} onChange={(e) => setFormData({...formData, updatesUrl: e.target.value})} className="rounded-xl h-12 font-mono" /></div>
                    <div className="space-y-2"><Label>واتساب الدعم</Label><Input value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="rounded-xl h-12 font-mono" /></div>
                    <div className="space-y-2"><Label>فيسبوك</Label><Input value={formData.facebook} onChange={(e) => setFormData({...formData, facebook: e.target.value})} className="rounded-xl h-12 font-mono" /></div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="policy" className="space-y-6">
            <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-sm">
                <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> روابط السياسات</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-4">
                    <div className="space-y-2"><Label>سياسة الخصوصية</Label><Input value={formData.cookiePolicyUrl} onChange={(e) => setFormData({...formData, cookiePolicyUrl: e.target.value})} className="rounded-xl h-12 font-mono" /></div>
                    <div className="space-y-2"><Label>رابط المتجر (Tech Store)</Label><Input value={formData.techStoreUrl} onChange={(e) => setFormData({...formData, techStoreUrl: e.target.value})} className="rounded-xl h-12 font-mono" /></div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminAppSettingsPage() {
  return <Suspense><SettingsContent /></Suspense>;
}
