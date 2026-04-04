
'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Share2, MessageCircle, Palette, Github, AppWindow, Facebook, Twitter, Send, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const appUrl = 'https://tqnyatstore.vercel.app/apps/revkekjiJOW9ogkglocG';
  const whatsappUrl = 'https://wa.me/201121473424';
  const techStoreUrl = 'https://techstore-servers.vercel.app/';
  const techStoreLogo = 'https://www.appcreator24.com/srv/imgs/gen/3879946_ico.png?v=5';
  
  const facebookUrl = '#'; 
  const twitterUrl = '#';  
  const telegramUrl = '#'; 

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
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-12">
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
              <span className="font-mono bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">v3.68.0</span>
            </div>
            
            <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-primary/5 to-emerald-500/5 rounded-2xl border border-primary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md border-2 border-white dark:border-slate-800">
                            <Image 
                                src={techStoreLogo}
                                alt="TECH STORE"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">المصدر الرسمي</span>
                            <span className="font-bold text-sm">تم التحميل من TECH STORE</span>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary hover:text-white transition-all">
                        <a href={techStoreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            زيارة المتجر
                        </a>
                    </Button>
                </div>
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

        {/* تابعونا */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <Share2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">تابعونا</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-emerald-500/20 hover:bg-emerald-500/5">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                  <span className="text-xs font-bold">واتساب</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-blue-600/20 hover:bg-blue-600/5">
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-bold">فيسبوك</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-slate-900/20 hover:bg-slate-900/5">
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-6 w-6 text-slate-900 dark:text-white" />
                  <span className="text-xs font-bold">تويتر X</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-sky-500/20 hover:bg-sky-500/5">
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                  <Send className="h-6 w-6 text-sky-500" />
                  <span className="text-xs font-bold">تلجرام</span>
                </a>
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
