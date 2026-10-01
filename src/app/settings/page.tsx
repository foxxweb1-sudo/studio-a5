'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ChevronLeft, 
  UserCircle, 
  Palette, 
  Zap, 
  Star, 
  ShieldCheck, 
  Info, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Send, 
  ExternalLink,
  LifeBuoy,
  FileText,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useUser } from '@/firebase';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
import { useAppConfig } from '@/hooks/use-app-config';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { config } = useAppConfig();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setShowAuthDialog(true);
    } else {
      router.push(href);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24 px-4">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <PageHeaderTitle className="text-3xl font-black">الإعدادات</PageHeaderTitle>
          <PageHeaderDescription>تخصيص التطبيق وإدارة حسابك والتواصل معنا.</PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 h-12 px-6 font-bold"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="space-y-8">
        {/* بطاقة باقة المساعد */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[2.5rem] overflow-hidden group">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                <Zap className="h-8 w-8 fill-current" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black">باقة المساعد الشخصي</h3>
                <p className="text-xs font-bold opacity-80">احصل على مساعد متخصص يدير لك حسابك بذكاء.</p>
              </div>
            </div>
            
            <Button asChild className="w-full h-14 rounded-2xl bg-white text-orange-600 hover:bg-slate-50 font-black text-lg gap-2 shadow-2xl">
              <Link href="/plans">
                <Star className="h-5 w-5 fill-current" />
                عرض تفاصيل الباقة
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* الحساب */}
        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
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
                    <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
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

        {/* التواصل الاجتماعي */}
        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <MessageCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black">تواصل معنا</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild className="rounded-2xl h-14 border-blue-100 hover:bg-blue-50 font-bold gap-2">
              <a href={config.facebook} target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 text-blue-600" />
                فيسبوك
              </a>
            </Button>
            <Button variant="outline" asChild className="rounded-2xl h-14 border-sky-100 hover:bg-sky-50 font-bold gap-2">
              <a href={config.twitter} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5 text-sky-500" />
                تويتر (X)
              </a>
            </Button>
            <Button variant="outline" asChild className="rounded-2xl h-14 border-indigo-100 hover:bg-indigo-50 font-bold gap-2">
              <a href={config.telegram} target="_blank" rel="noopener noreferrer">
                <Send className="h-5 w-5 text-indigo-500" />
                تليجرام
              </a>
            </Button>
            <Button variant="outline" asChild className="rounded-2xl h-14 border-emerald-100 hover:bg-emerald-50 font-bold gap-2">
              <a href={config.whatsappChannel} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                قناتنا
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* الصفحات القانونية والدعم */}
        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500/10 text-slate-500 rounded-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-black">الدعم والسياسات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              <Link href="/privacy" className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck className="h-5 w-5" /></div>
                  <span className="font-bold">سياسة الخصوصية</span>
                </div>
                <ChevronLeft className="h-4 w-4 text-slate-300" />
              </Link>
              <Link href="/terms" className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FileText className="h-5 w-5" /></div>
                  <span className="font-bold">اتفاقية الاستخدام</span>
                </div>
                <ChevronLeft className="h-4 w-4 text-slate-300" />
              </Link>
              <Link href="/about" className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-5 w-5" /></div>
                  <span className="font-bold">من نحن</span>
                </div>
                <ChevronLeft className="h-4 w-4 text-slate-300" />
              </Link>
              <Link href="/contact" className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><LifeBuoy className="h-5 w-5" /></div>
                  <span className="font-bold">اتصل بنا</span>
                </div>
                <ChevronLeft className="h-4 w-4 text-slate-300" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* المظهر */}
        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
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
      </div>

      {/* نافذة التنبيه لغير المسجلين */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] border-0 shadow-2xl max-w-md overflow-hidden p-0 bg-white">
          <div className="bg-primary h-2 w-full" />
          <div className="p-10 space-y-8 text-right">
              <DialogHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCircle className="h-10 w-10 text-primary" />
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900">هوية المعلم</DialogTitle>
                <DialogDescription className="font-bold pt-2 text-slate-400 leading-relaxed">
                  يرجى إثبات هويتك للوصول إلى إدارة الحساب والبيانات الخاصة بك.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => router.push('/login')} className="h-14 rounded-2xl font-black text-lg gap-3 bg-primary hover:bg-indigo-700 shadow-lg shadow-primary/20">
                   تسجيل الدخول
                 </Button>
                 <Button onClick={() => router.push('/signup')} variant="outline" className="h-14 rounded-2xl font-black text-lg border-slate-200">
                   إنشاء حساب جديد
                 </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
