
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
  AppWindow, 
  Facebook, 
  Twitter, 
  Send, 
  ExternalLink,
  UserCircle,
  ChevronLeft,
  Tag,
  ShieldCheck,
  FileText,
  HelpCircle,
  Users,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
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
        {/* قسم الحساب (محمي بنظام تسجيل الدخول) */}
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
               <Button 
                variant="ghost" 
                onClick={(e) => handleProtectedClick(e, '/account')}
                className="w-full justify-between h-auto py-5 px-4 rounded-2xl hover:bg-primary/5 font-bold group transition-all duration-300"
               >
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
                  <ChevronLeft className="h-5 w-5 text-primary/40 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 1. معلومات التطبيق */}
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
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">الإصدار الحالي</span>
              </div>
              <span className="font-mono bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold">{config.appVersion}</span>
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

        {/* 2. المظهر */}
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

        {/* 3. المعلومات والدعم */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <HelpCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black">المعلومات والدعم</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="flex flex-col">
                <Link href="/about" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm">من نحن</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link href="/contact" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm">تواصل معنا</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link href="/privacy" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm">سياسة الخصوصية</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link href="/terms" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm">اتفاقية الاستخدام</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </Link>
             </div>
          </CardContent>
        </Card>

        {/* 4. تابعونا */}
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

        {/* 5. مشاركة وتواصل */}
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

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] border-0 shadow-2xl max-w-md overflow-hidden p-0 bg-white">
          <div className="bg-primary h-2 w-full" />
          <div className="p-10 space-y-8 text-right">
              <DialogHeader className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900">هوية المعلم</DialogTitle>
                <DialogDescription className="font-bold pt-2 text-slate-400 leading-relaxed">
                  هذا النطاق مخصص للمعلمين المسجلين فقط. يرجى إثبات هويتك للمتابعة.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => router.push('/login')} className="h-14 rounded-2xl font-black text-lg gap-3 shadow-lg bg-primary hover:bg-indigo-700 transition-all">
                   <LogIn className="h-5 w-5" /> تسجيل الدخول
                 </Button>
                 <Button onClick={() => router.push('/signup')} variant="outline" className="h-14 rounded-2xl font-black text-lg gap-3 border-slate-200 hover:bg-slate-50 text-slate-600 transition-all">
                   <UserPlus className="h-5 w-5" /> إنشاء حساب جديد
                 </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
