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
  AlertCircle,
  Phone,
  Link as LinkIcon,
  Bell,
  UploadCloud,
  Smartphone,
  Code,
  Globe,
  Settings as SettingsIcon,
  ShieldCheck,
  Facebook,
  Twitter,
  Send,
  Tag,
  Monitor,
  Tablet,
  MousePointer2
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
      toast({ title: "تم الحفظ", description: "تم تحديث كافة الإعدادات والمنظومة الإعلانية بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "تعذر الحفظ حالياً." });
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
            toast({ title: "تم رفع الصورة بنجاح" });
        } else {
            toast({ variant: "destructive", title: "فشل الرفع" });
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
          <PageHeaderTitle className="text-3xl font-black">مركز التحكم السحابي</PageHeaderTitle>
          <PageHeaderDescription>إدارة الهوية، الإعلانات العالمية، وتقنيات أدسنس</PageHeaderDescription>
        </PageHeader>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-bold gap-2 h-11 px-8">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ كافة التغييرات
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl h-11"><ArrowLeft className="h-4 w-4" /></Button>
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl mb-8 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="identity" className="rounded-xl font-black py-3 px-6">الهوية البصرية</TabsTrigger>
          <TabsTrigger value="ads" className="rounded-xl font-black py-3 px-6">إدارة الإعلانات (Global)</TabsTrigger>
          <TabsTrigger value="adsense" className="rounded-xl font-black py-3 px-6 text-amber-600">Google AdSense</TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl font-black py-3 px-6">الروابط والسياسات</TabsTrigger>
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

        <TabsContent value="ads" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* الإعلانات الخلفية */}
                <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-xl bg-slate-900 text-white">
                    <CardHeader className="p-8 border-b border-white/5"><CardTitle className="flex items-center gap-3 text-indigo-400"><Code className="h-6 w-6" /> إعلانات الحقن الخلفي</CardTitle></CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-slate-400 font-bold flex items-center gap-2"><Badge variant="outline" className="text-indigo-400 border-indigo-400/20">POPUNDER</Badge> Pop-under Ad Code</Label>
                            <Textarea value={formData.popunderAdCode} onChange={(e) => setFormData({...formData, popunderAdCode: e.target.value})} className="min-h-[120px] bg-white/5 border-white/10 font-mono text-[10px] text-indigo-300" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-slate-400 font-bold flex items-center gap-2"><Badge variant="outline" className="text-emerald-400 border-emerald-400/20">SOCIAL</Badge> Social Bar Ad Code</Label>
                            <Textarea value={formData.socialBarCode} onChange={(e) => setFormData({...formData, socialBarCode: e.target.value})} className="min-h-[120px] bg-white/5 border-white/10 font-mono text-[10px] text-emerald-300" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-slate-400 font-bold flex items-center gap-2"><Badge variant="outline" className="text-rose-400 border-rose-400/20">LINK</Badge> Smartlink / Redirect Code</Label>
                            <Textarea value={formData.smartlinkCode} onChange={(e) => setFormData({...formData, smartlinkCode: e.target.value})} className="min-h-[120px] bg-white/5 border-white/10 font-mono text-[10px] text-rose-300" />
                        </div>
                    </CardContent>
                </Card>

                {/* مقاسات البانر المحددة */}
                <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-lg bg-white">
                    <CardHeader className="p-8 border-b bg-slate-50"><CardTitle className="flex items-center gap-3"><Monitor className="h-6 w-6 text-primary" /> مقاسات البانر الثابتة</CardTitle></CardHeader>
                    <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Banner 728x90 (Top)</Label>
                            <Textarea value={formData.banner728x90Code} onChange={(e) => setFormData({...formData, banner728x90Code: e.target.value})} className="min-h-[80px] text-[10px] font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Banner 300x250 (Square)</Label>
                            <Textarea value={formData.banner300x250Code} onChange={(e) => setFormData({...formData, banner300x250Code: e.target.value})} className="min-h-[80px] text-[10px] font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Banner 160x600 (Skyscraper)</Label>
                            <Textarea value={formData.banner160x600Code} onChange={(e) => setFormData({...formData, banner160x600Code: e.target.value})} className="min-h-[80px] text-[10px] font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Banner 320x50 (Mobile)</Label>
                            <Textarea value={formData.banner320x50Code} onChange={(e) => setFormData({...formData, banner320x50Code: e.target.value})} className="min-h-[80px] text-[10px] font-mono" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-lg bg-white">
                <CardHeader className="p-8 border-b bg-indigo-50"><CardTitle className="flex items-center gap-3"><MousePointer2 className="h-6 w-6 text-indigo-600" /> إعلانات Native وتصنيفات أخرى</CardTitle></CardHeader>
                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Native Ad (In-Content)</Label>
                        <Textarea value={formData.nativeAdCode} onChange={(e) => setFormData({...formData, nativeAdCode: e.target.value})} className="min-h-[100px] text-[10px] font-mono" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Banner 468x60</Label>
                        <Textarea value={formData.banner468x60Code} onChange={(e) => setFormData({...formData, banner468x60Code: e.target.value})} className="min-h-[100px] text-[10px] font-mono" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Banner 160x300</Label>
                        <Textarea value={formData.banner160x300Code} onChange={(e) => setFormData({...formData, banner160x300Code: e.target.value})} className="min-h-[100px] text-[10px] font-mono" />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="adsense" className="space-y-8">
            <Card className="rounded-[3rem] overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-[#FFF9C4] to-white border-t-8 border-t-amber-500">
                <CardHeader className="p-10 border-b border-amber-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <span className="text-white text-3xl font-black">G</span>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-amber-900">Google AdSense Integration</CardTitle>
                            <p className="text-sm font-bold text-amber-700 opacity-70">إدارة الأكواد التلقائية والوحدات الإعلانية من جوجل</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    <div className="space-y-4">
                        <Label className="text-amber-900 font-black flex items-center gap-2"><Code className="h-5 w-5" /> AdSense Global Code (Header script)</Label>
                        <Textarea value={formData.adsenseClientCode} onChange={(e) => setFormData({...formData, adsenseClientCode: e.target.value})} placeholder="<script async src='https://pagead2.googlesyndication.com/...'></script>" className="min-h-[120px] bg-white border-amber-200 focus-visible:ring-amber-500 font-mono text-xs text-amber-700" />
                        <p className="text-[10px] text-amber-600 italic">هذا الكود يوضع في رأس الصفحة لتفعيل "الإعلانات التلقائية" وربط الموقع بالحساب.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label className="text-amber-900 font-black">Responsive Unit (أدسنس تجاوبي)</Label>
                            <Textarea value={formData.adsenseResponsiveCode} onChange={(e) => setFormData({...formData, adsenseResponsiveCode: e.target.value})} className="min-h-[150px] bg-white border-amber-200 font-mono text-xs text-amber-700" />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-amber-900 font-black">In-Article Ad (داخل المقالات)</Label>
                            <Textarea value={formData.adsenseInArticleCode} onChange={(e) => setFormData({...formData, adsenseInArticleCode: e.target.value})} className="min-h-[150px] bg-white border-amber-200 font-mono text-xs text-amber-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
            <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-sm">
                <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> روابط التواصل والتحميل</CardTitle></CardHeader>
                <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>رابط APK (أندرويد)</Label><Input value={formData.apkDownloadUrl} onChange={(e) => setFormData({...formData, apkDownloadUrl: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label>واتساب الدعم</Label><Input value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="rounded-xl h-12 font-mono" /></div>
                    <div className="space-y-2"><Label>فيسبوك</Label><Input value={formData.facebook} onChange={(e) => setFormData({...formData, facebook: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label>تويتر X</Label><Input value={formData.twitter} onChange={(e) => setFormData({...formData, twitter: e.target.value})} className="rounded-xl h-12" /></div>
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
