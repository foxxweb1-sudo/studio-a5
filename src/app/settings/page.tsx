
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
  ShieldCheck,
  FileText,
  Users,
  UserCircle
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
        {/* قسم الحساب - نمط فيسبوك */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <UserCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">الحساب</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
             <Button asChild variant="ghost" className="w-full justify-between h-16 rounded-2xl px-4 hover:bg-muted font-bold group">
              <Link href="/account" className="flex items-center w-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        <UserCircle className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-black">إدارة الحساب</span>
                        <span className="text-[10px] text-muted-foreground font-medium">الاسم، الصورة، الأمان، والخصوصية</span>
                    </div>
                </div>
                <ArrowLeft className="h-4 w-4 opacity-20 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
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
              <span className="font-bold text-primary">{config.appName}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">الإصدار</span>
              </div>
              <span className="font-mono bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">v3.77.0</span>
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

        {/* قانوني ومعلومات */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500/10 text-slate-500 rounded-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">قانوني ومعلومات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Button asChild variant="ghost" className="justify-start h-12 rounded-xl px-4 gap-3 hover:bg-muted font-bold">
              <Link href="/privacy">
                <ShieldCheck className="h-5 w-5 text-primary" />
                الخصوصية
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start h-12 rounded-xl px-4 gap-3 hover:bg-muted font-bold">
              <Link href="/terms">
                <FileText className="h-5 w-5 text-primary" />
                اتفاقية الاستخدام
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start h-12 rounded-xl px-4 gap-3 hover:bg-muted font-bold">
              <Link href="/about">
                <Users className="h-5 w-5 text-primary" />
                من نحن
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start h-12 rounded-xl px-4 gap-3 hover:bg-muted font-bold text-emerald-600">
              <Link href="/contact">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                تواصل معنا
              </Link>
            </Button>
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
                <a href={config.whatsappChannel} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                  <span className="text-xs font-bold">واتساب</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-blue-600/20 hover:bg-blue-600/5">
                <a href={config.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-bold">فيسبوك</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-slate-900/20 hover:bg-slate-900/5">
                <a href={config.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-6 w-6 text-slate-900 dark:text-white" />
                  <span className="text-xs font-bold">تويتر X</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex flex-col h-20 gap-2 rounded-2xl border-sky-500/20 hover:bg-sky-500/5">
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

