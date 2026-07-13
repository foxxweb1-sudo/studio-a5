
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useStudents, useAttendance, usePayments } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, School, Building, CalendarCheck, ShieldCheck, Users, Wallet, Clock, Calendar, Bell, ArrowRightLeft, LogIn, UserPlus, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ADMIN_EMAIL } from '@/lib/constants';
import { useAppConfig } from '@/hooks/use-app-config';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

const categories = ["AI", "الرقمية", "معلومات عامة", "عن المنصة"];

export default function Home() {
  const { user } = useUser();
  const { config } = useAppConfig();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // جلب مقالات للمدونة في الرئيسية
  const articlesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'articles'), orderBy('createdAt', 'desc'), limit(20)) : null,
  [firestore]);
  const { data: allArticles } = useCollection(articlesQuery);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % 5);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAuthDialog(true);
    }
  };

  const latestArticlesByCategory = useMemo(() => {
    const map: Record<string, any[]> = {};
    categories.forEach(cat => {
      map[cat] = allArticles?.filter(a => a.category === cat).slice(0, 5) || [];
    });
    return map;
  }, [allArticles]);

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center text-center py-12">
        <PageHeader className="border-0">
            <PageHeaderTitle className="text-4xl md:text-5xl text-primary font-black">مرحباً أيها المشرف</PageHeaderTitle>
            <PageHeaderTitle className="text-lg font-bold opacity-60">أنت تستخدم حساب الإدارة الرئيسي</PageHeaderTitle>
        </PageHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          <Link href="/admin" className="group">
            <Card className="hover-lift overflow-hidden border-2 border-primary/20 bg-white">
                <CardContent className="flex flex-col items-center p-8 gap-4">
                    <ShieldCheck className="w-12 h-12 text-primary" />
                    <h2 className="text-xl font-bold">لوحة تحكم النظام</h2>
                </CardContent>
            </Card>
          </Link>
          <Link href="/admin/blog" className="group">
            <Card className="hover-lift overflow-hidden border-2 border-emerald-500/20 bg-white">
                <CardContent className="flex flex-col items-center p-8 gap-4">
                    <BookOpen className="w-12 h-12 text-emerald-500" />
                    <h2 className="text-xl font-bold">إدارة المدونة</h2>
                </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 py-4">
      {/* هيدر ترحيبي للزوار */}
      {!user && (
        <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 md:p-16 text-white shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Sparkles className="w-full h-full animate-pulse" />
           </div>
           <div className="relative z-10 text-center space-y-8">
              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                أهلاً بك في منصة <span className="text-primary">{config.appName}</span>
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                النظام الأذكى لإدارة حضور الطلاب والمدفوعات، بالإضافة إلى أحدث المقالات في عالم التقنية والذكاء الاصطناعي.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                 <Link href="/login">
                   <Button size="lg" className="rounded-2xl px-10 h-16 text-lg font-black gap-2 shadow-xl shadow-primary/30">
                     <LogIn className="h-6 w-6" /> تسجيل الدخول
                   </Button>
                 </Link>
                 <Link href="/signup">
                   <Button size="lg" variant="outline" className="rounded-2xl px-10 h-16 text-lg font-black gap-2 border-white/20 bg-white/5 hover:bg-white/10">
                     <UserPlus className="h-6 w-6" /> إنشاء حساب جديد
                   </Button>
                 </Link>
              </div>
           </div>
        </section>
      )}

      {/* قسم المدونة المصغر (Ticker) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const arts = latestArticlesByCategory[cat];
          const currentArt = arts[currentSlideIndex % (arts.length || 1)];
          return (
            <Card key={cat} className="border-0 shadow-sm overflow-hidden bg-white group hover:shadow-md transition-all h-24">
              <CardContent className="p-0 h-full flex items-center">
                <div className="bg-primary/5 p-4 h-full flex items-center justify-center border-l shrink-0">
                  <span className="text-[10px] font-black text-primary writing-vertical rotate-180">{cat}</span>
                </div>
                <div className="p-3 flex-grow overflow-hidden">
                  {currentArt ? (
                    <Link href={`/art/${currentArt.numericId}`} className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-bold">آخر المقالات...</p>
                      <h4 className="text-xs font-black truncate text-slate-800">{currentArt.title}</h4>
                    </Link>
                  ) : (
                    <p className="text-xs text-slate-300 font-bold italic">لا توجد مقالات بعد</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* المحتوى الرئيسي المحمي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'تسجيل الحضور', icon: CalendarCheck, href: '/attendance', color: 'bg-blue-500/10 text-blue-500' },
          { name: 'إدارة الطلاب', icon: Users, href: '/students', color: 'bg-emerald-500/10 text-emerald-500' },
          { name: 'المدفوعات والتقارير', icon: Wallet, href: '/payments', color: 'bg-amber-500/10 text-amber-500' },
        ].map((item) => (
          <Link href={item.href} key={item.name} onClick={handleProtectedClick}>
            <Card className="hover-lift h-full border-0 bg-white shadow-xl rounded-[2.5rem] p-8 text-center flex flex-col items-center gap-6">
               <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold">{item.name}</h3>
            </Card>
          </Link>
        ))}
      </div>

      {/* نافذة التحذير (الطلب المنبثق) */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl max-w-sm">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black">خطوة واحدة باقية</DialogTitle>
            <DialogDescription className="font-bold pt-2">
              هذا القسم مخصص للمعلمين المشتركين. يرجى تسجيل الدخول للوصول إلى أدواتك التعليمية.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
             <Button onClick={() => router.push('/login')} className="h-12 rounded-xl font-bold gap-2">
               <LogIn className="h-4 w-4" /> سجل دخولك الآن
             </Button>
             <Button onClick={() => router.push('/signup')} variant="outline" className="h-12 rounded-xl font-bold gap-2">
               <UserPlus className="h-4 w-4" /> إنشاء حساب جديد
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
