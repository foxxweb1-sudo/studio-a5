
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Code, Layout, AppWindow, ArrowLeft } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/constants';
import { AdConfig } from '@/lib/definitions';
import { useRouter } from 'next/navigation';

export default function AdminAdsPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AdConfig>({
    isCdm: false,
    cdmCode1: '',
    cdmCode2: '',
    bannerCode: '',
    sidebarCode: '',
    popupCode: '',
    middleArticleCode: '',
    underTitleCode: '',
  });

  const adConfigRef = useMemoFirebase(() => doc(firestore, 'adConfig', 'global'), [firestore]);
  const { data: config, isLoading } = useDoc<AdConfig>(adConfigRef);

  useEffect(() => {
    if (config) setFormData(config);
  }, [config]);

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(adConfigRef, formData, { merge: true });
      toast({ title: "تم حفظ إعدادات الإعلانات" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);
  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <PageHeader className="border-0">
          <PageHeaderTitle className="text-3xl font-black">إدارة الإعلانات</PageHeaderTitle>
          <PageHeaderDescription>توزيع أكواد الإعلانات في المقالات والواجهة</PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl"><ArrowLeft className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white">
             <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3"><Code className="h-6 w-6 text-primary" /> إعدادات الإعلانات العامة</CardTitle>
                <div className="flex items-center gap-3">
                   <Label className="font-bold">استخدام نظام CDM</Label>
                   <Switch checked={formData.isCdm} onCheckedChange={(v) => setFormData({...formData, isCdm: v})} />
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {formData.isCdm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="font-bold">كود CDM الرئيسي</Label>
                   <Textarea value={formData.cdmCode1} onChange={(e) => setFormData({...formData, cdmCode1: e.target.value})} className="font-mono text-[10px] h-32 bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold">كود CDM الثانوي</Label>
                   <Textarea value={formData.cdmCode2} onChange={(e) => setFormData({...formData, cdmCode2: e.target.value})} className="font-mono text-[10px] h-32 bg-slate-50" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="font-bold">إعلان البانر العلوي</Label>
                   <Textarea value={formData.bannerCode} onChange={(e) => setFormData({...formData, bannerCode: e.target.value})} className="font-mono text-[10px] h-32 bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold">إعلان الشريط الجانبي (Sidebar)</Label>
                   <Textarea value={formData.sidebarCode} onChange={(e) => setFormData({...formData, sidebarCode: e.target.value})} className="font-mono text-[10px] h-32 bg-slate-50" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/10 border-b">
             <CardTitle className="text-xl flex items-center gap-3 text-primary"><Layout className="h-6 w-6" /> توزيع الإعلانات في المقالات</CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="font-bold">تحت عنوان المقال مباشره</Label>
                <Textarea value={formData.underTitleCode} onChange={(e) => setFormData({...formData, underTitleCode: e.target.value})} className="font-mono text-[10px] h-24" />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">وسط المقال (Google AdSense Style)</Label>
                <Textarea value={formData.middleArticleCode} onChange={(e) => setFormData({...formData, middleArticleCode: e.target.value})} className="font-mono text-[10px] h-24" />
             </div>
             <div className="space-y-2 md:col-span-2">
                <Label className="font-bold text-rose-600">إعلان منبثق (Popup) - يظهر كل 200 ثانية</Label>
                <Textarea value={formData.popupCode} onChange={(e) => setFormData({...formData, popupCode: e.target.value})} className="font-mono text-[10px] h-24 border-rose-100" />
             </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 rounded-[2rem] font-black text-xl gap-3 shadow-xl shadow-primary/20">
           {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />} حفظ كافة إعدادات الإعلانات
        </Button>
      </div>
    </div>
  );
}
