
'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Info, 
  Share2, 
  MessageCircle, 
  Palette, 
  AppWindow, 
  ChevronLeft,
  Tag,
  ShieldCheck,
  Globe,
  Zap,
  CheckCircle2,
  Loader2,
  Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useAppConfig } from '@/hooks/use-app-config';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { config } = useAppConfig();
  const { user } = useUser();
  const firestore = useFirestore();

  const [promoCode, setPromoCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile } = useDoc<any>(userRef);

  const isAdFree = !!userProfile?.isAdFree;

  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setShowAuthDialog(true);
    } else {
      router.push(href);
    }
  };

  const handleActivateCode = async () => {
    if (!user || !promoCode.trim() || !firestore) return;
    setIsActivating(true);
    try {
        const codeInput = promoCode.trim().toUpperCase();
        const codeRef = doc(firestore, 'promoCodes', codeInput);
        const codeSnap = await getDoc(codeRef);
        
        if (!codeSnap.exists()) {
            toast({ variant: "destructive", title: "كود غير صالح", description: "الكود الذي أدخلته غير موجود في النظام." });
            return;
        }

        const codeData = codeSnap.data();
        if (codeData.isUsed) {
            toast({ variant: "destructive", title: "كود مستخدم", description: "هذا الكود تم استخدامه مسبقاً." });
            return;
        }

        // 1. تحديث الكود ليصبح مستخدماً
        await updateDoc(codeRef, {
            isUsed: true,
            usedBy: user.uid,
            usedAt: serverTimestamp()
        });

        // 2. تفعيل وضع Ad-Free للمستخدم
        await updateDoc(doc(firestore, 'users', user.uid), {
            isAdFree: true,
            adFreeActivatedAt: serverTimestamp()
        });

        toast({ title: "تم التفعيل بنجاح!", description: "لقد أصبحت الآن مستخدماً احترافياً (PRO) مدى الحياة." });
        setPromoCode('');
    } catch (e) {
        toast({ variant: "destructive", title: "خطأ في التفعيل", description: "تأكد من جودة اتصالك بالإنترنت وصلاحية الكود." });
    } finally {
        setIsActivating(false);
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
        
        {/* قسم تفعيل باقة الـ PRO */}
        {user && !isAdFree && (
            <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite]" />
                <CardContent className="p-8 space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Zap className="h-8 w-8 text-yellow-300 fill-current" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black">باقة الـ PRO مدي الحياة</h3>
                            <p className="text-sm font-bold opacity-80 mt-1">تخلص من كافة الإعلانات واحصل على ميزات حصرية بـ 50 ج.م فقط.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <Input 
                            placeholder="ضع كود التفعيل هنا..." 
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center font-black tracking-widest uppercase"
                        />
                        <Button 
                            onClick={handleActivateCode}
                            disabled={isActivating || !promoCode.trim()}
                            className="bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl h-14 px-8 font-black text-lg gap-2 shadow-2xl w-full sm:w-auto"
                        >
                            {isActivating ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                            تفعيل الآن
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a href="https://wa.me/201550729858" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold opacity-60 uppercase">شراء كود تفعيل</span>
                                <span className="text-sm font-black">01550729858</span>
                            </div>
                            <MessageCircle className="h-5 w-5 text-emerald-400" />
                        </a>
                        <a href="https://whatsapp.com/channel/0029VbCyb52DeON36q813U3W" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 text-right">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-bold opacity-60 uppercase">أكواد مجانية يومياً</span>
                                <span className="text-sm font-black">تابع قناتنا</span>
                            </div>
                            <Send className="h-5 w-5 text-blue-400" />
                        </a>
                    </div>
                </CardContent>
            </Card>
        )}

        {isAdFree && (
            <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] flex items-center gap-5 animate-in zoom-in-95 duration-500">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-emerald-800">حساب احترافي نشط (PRO)</h4>
                    <p className="text-xs text-emerald-600 font-bold">تهانينا! أنت الآن في النسخة الخالية من الإعلانات تماماً.</p>
                </div>
            </div>
        )}

        {/* قسم الحساب */}
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

        {/* معلومات التطبيق */}
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

        {/* المظهر */}
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

        {/* مشاركة وتواصل */}
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
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
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

const UserCircle = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
    </svg>
);
