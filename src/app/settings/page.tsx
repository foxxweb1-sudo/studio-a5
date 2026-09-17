'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Info, 
  Share2, 
  Palette, 
  AppWindow, 
  ChevronLeft,
  Tag,
  UserCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { useAppConfig } from '@/hooks/use-app-config';
import { useUser } from '@/firebase';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { config } = useAppConfig();
  const { user } = useUser();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setShowAuthDialog(true);
    } else {
      router.push(href);
    }
  };

  const handleShare = async () => {
    const appUrl = config.techStoreUrl || '#';
    if (navigator.share) {
      try {
        await navigator.share({
          title: config.appName,
          text: `قم بتحميل تطبيق ${config.appName} لإدارة الطلاب والمدفوعات بسهولة.`,
          url: appUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(appUrl);
      toast({
        title: 'تم نسخ الرابط',
        description: 'تم نسخ رابط المتجر إلى الحافظة.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">الإعدادات</PageHeaderTitle>
          <PageHeaderDescription>تخصيص التطبيق وإدارة حسابك.</PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="space-y-6">
        
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <UserCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black">الحساب</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
             <Button 
              variant="ghost" 
              onClick={(e) => handleProtectedClick(e, '/account')}
              className="w-full justify-between h-auto py-5 px-4 rounded-2xl hover:bg-primary/5 font-bold group transition-all"
             >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                        <UserCircle className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-start text-right">
                        <span className="text-base font-black text-slate-800 dark:text-white">إدارة الحساب</span>
                        <span className="text-xs text-muted-foreground font-medium opacity-80">تحديث الاسم، الصورة، والبيانات</span>
                    </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-primary/40 group-hover:text-primary transition-all" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Info className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black">عن التطبيق</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-2">
                <AppWindow className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">اسم التطبيق</span>
              </div>
              <span className="font-bold text-primary">{config.appName}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">الإصدار الحالي</span>
              </div>
              <span className="font-mono bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold">{config.appVersion}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <Palette className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black">المظهر</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <Button variant={theme === 'light' ? 'default' : 'ghost'} onClick={() => setTheme('light')} className="rounded-xl font-bold">فاتح</Button>
              <Button variant={theme === 'dark' ? 'default' : 'ghost'} onClick={() => setTheme('dark')} className="rounded-xl font-bold">داكن</Button>
              <Button variant={theme === 'system' ? 'default' : 'ghost'} onClick={() => setTheme('system')} className="rounded-xl font-bold">النظام</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <Share2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black">مشاركة وتواصل</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleShare} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-3 shadow-lg shadow-primary/20">
              <Share2 className="h-5 w-5" /> مشاركة التطبيق
            </Button>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                Powered by <span className="text-primary font-black">CybeNode</span>
            </p>
        </div>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] border-0 shadow-2xl max-w-md overflow-hidden p-0 bg-white">
          <div className="bg-primary h-2 w-full" />
          <div className="p-10 space-y-8 text-right">
              <DialogHeader className="text-center">
                <DialogTitle className="text-3xl font-black text-slate-900">هوية المعلم</DialogTitle>
                <DialogDescription className="font-bold pt-2 text-slate-400 leading-relaxed">
                  يرجى إثبات هويتك للمتابعة.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => router.push('/login')} className="h-14 rounded-2xl font-black text-lg gap-3 bg-primary">تسجيل الدخول</Button>
                 <Button onClick={() => router.push('/signup')} variant="outline" className="h-14 rounded-2xl font-black text-lg">إنشاء حساب</Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
