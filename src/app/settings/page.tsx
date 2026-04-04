
'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Share2, MessageCircle, Palette, Github, AppWindow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const appUrl = 'https://tqnyatstore.vercel.app/apps/revkekjiJOW9ogkglocG';
  const whatsappUrl = 'https://wa.me/201121473424';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق الحضور الذكي',
          text: 'قم بتحميل تطبيق الحضور الذكي لإدارة الطلاب والمدفوعات بسهولة.',
          url: appUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(appUrl);
      toast({
        title: 'تم نسخ الرابط',
        description: 'تم نسخ رابط التطبيق إلى الحافظة.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>الإعدادات</PageHeaderTitle>
          <PageHeaderDescription>إعدادات التطبيق ومعلومات الإصدار.</PageHeaderDescription>
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
        {/* معلومات التطبيق */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Info className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">عن التطبيق</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-2">
                <AppWindow className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">اسم التطبيق</span>
              </div>
              <span className="font-bold text-primary">الحضور الذكي</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">الإصدار</span>
              </div>
              <span className="font-mono bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">v1.0.0</span>
            </div>
          </CardContent>
        </Card>

        {/* المظهر */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <Palette className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">المظهر</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-2xl">
              <Button 
                variant={theme === 'light' ? 'default' : 'ghost'} 
                onClick={() => setTheme('light')}
                className="rounded-xl font-bold"
              >
                فاتح
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'ghost'} 
                onClick={() => setTheme('dark')}
                className="rounded-xl font-bold"
              >
                داكن
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'ghost'} 
                onClick={() => setTheme('system')}
                className="rounded-xl font-bold"
              >
                النظام
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* الروابط والمشاركة */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Share2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">مشاركة وتواصل</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleShare}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-3 shadow-lg shadow-primary/20"
            >
              <Share2 className="h-5 w-5" />
              مشاركة التطبيق
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-600 font-bold gap-3"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                التواصل مع فريق TECH
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                Made with ❤️ by TECH TEAM
            </p>
        </div>
      </div>
    </div>
  );
}
