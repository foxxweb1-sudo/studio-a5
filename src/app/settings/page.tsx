'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Info, 
  Share2, 
  MessageCircle, 
  Palette, 
  Github, 
  AppWindow, 
  Facebook, 
  Twitter, 
  Send, 
  ExternalLink,
  UserCircle,
  ChevronLeft,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useAppConfig } from '@/hooks/use-app-config';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { config } = useAppConfig();

  const handleShare = async () => {
    const appUrl = config.techStoreUrl;
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

  const techStoreLogo = 'https://www.appcreator24.com/srv/imgs/gen/3879946_ico.png?v=5';

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-12 px-4">
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
        {/* قسم الحساب - نمط فيسبوك المطور مع تأثير النور الدوار */}
        <div className="relative p-[2px] overflow-hidden rounded-[2.5rem] group">
          <div className="absolute inset-[-1000%] animate-spin-border bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,hsl(var(--primary))_50%,transparent_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
          
          <Card className="relative border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.4rem] overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <UserCircle className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black">الحساب</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
               <Button asChild variant="ghost" className="w-full justify-between h-auto py-5 px-4 rounded-2xl hover:bg-primary/5 font-bold group transition-all duration-300">
                <Link href="/account" className="flex items-center w-full justify-between">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300 relative">
                          <UserCircle className="h-6 w-6 relative z-10" />
                          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping group-hover:block hidden" />
                      </div>
                      <div className="flex flex-col items-start text-right">
                          <span className="text-base font-black text-slate-800 dark:text-white">إدارة الحساب</span>
                          <span className="text-xs text-muted-foreground font-medium opacity-80">تحديث الاسم، الصورة، وكلمة المرور</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">تعديل</span>
                    <ChevronLeft className="h-5 w-5 text-primary/40 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* المظهر */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
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
              <Button 
                variant={theme === 'light' ? 'default' : 'ghost'} 
                onClick={() => setTheme('light')}
                className={`rounded-xl font-bold transition-all ${theme === 'light' ? 'shadow-md' : ''}`}
              >
                فاتح
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'ghost'} 
                onClick={() => setTheme('dark')}
                className={`rounded-xl font-bold transition-all ${theme === 'dark' ? 'shadow-md' : ''}`}
              >
                داكن
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'ghost'} 
                onClick={() => setTheme('system')}
                className={`rounded-xl font-bold transition-all ${theme === 'system' ? 'shadow-md' : ''}`}
              >
                النظام
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* معلومات التطبيق */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
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
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">الإصدار</span>
              </div>
              <span className="font-mono bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold">v3.77.0</span>
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
                            <span className="font-bold text-sm">TECH STORE</span>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary hover:text-white transition-all">
                        <a href={config.techStoreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            زيارة
                        </a>
                    </Button>
                </div>
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
              <CardTitle className="text-xl font-black">تابعونا</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-emerald-500/20 hover:bg-emerald-500/5 hover-lift">
                <a href={config.whatsappChannel} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                  <span className="text-xs font-bold">واتساب</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-blue-600/20 hover:bg-blue-600/5 hover-lift">
                <a href={config.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-bold">فيسبوك</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-slate-900/20 hover:bg-slate-900/5 hover-lift">
                <a href={config.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-6 w-6 text-slate-900 dark:text-white" />
                  <span className="text-xs font-bold">تويتر X</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-sky-500/20 hover:bg-sky-500/5 hover-lift">
                <a href={config.telegram} target="_blank" rel="noopener noreferrer">
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
              <CardTitle className="text-xl font-black">مشاركة وتواصل</CardTitle>
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
              <a href={`https://wa.me/${config.contactPhone}`} target="_blank" rel="noopener noreferrer">
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
