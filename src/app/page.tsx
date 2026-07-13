
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useStudents, useAttendance, usePayments } from '@/hooks/use-app-data';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, School, Building, CalendarCheck, ShieldCheck, Users, Wallet, Clock, Calendar, Bell, ArrowRightLeft, LogIn, UserPlus, BookOpen, Sparkles, Eye, TrendingUp } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

const categories = ["AI", "الرقمية", "معلومات عامة", "عن المنصة"];

export default function Home() {
  const { user } = useUser();
  const { config } = useAppConfig();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // جلب المقالات للمدونة
  const articlesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'articles'), orderBy('createdAt', 'desc'), limit(20)) : null,
  [firestore]);
  const { data: allArticles } = useCollection(articlesQuery);

  // جلب المقالات الأكثر مشاهدة للرئيسية
  const topArticlesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'articles'), orderBy('views', 'desc'), limit(5)) : null,
  [firestore]);
  const { data: topArticles } = useCollection(topArticlesQuery);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % 5);
    }, 1500);
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
            <PageHeaderTitle className="text-lg font-bold opacity-60">أنت تستخدم حساب الإدارة الرئيسي للنظام</PageHeaderTitle>
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
    <div className="flex flex-col gap-16 py-4 px-2 sm:px-6">
      {/* هيدر ترحيبي متطور */}
      {!user && (
        <section className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 md:p-20 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary via-transparent to-transparent animate-pulse" />
           <div className="relative z-10 text-center space-y-10 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md mb-4">
                 <Sparkles className="h-4 w-4 text-primary" />
                 <span className="text-xs font-black uppercase tracking-widest text-primary-foreground/80">الجيل القادم من أنظمة التعليم</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1] tracking-tighter">
                بوابتك <span className="text-primary italic">الذكية</span> للتعليم الرقمي
              </h1>
              <p className="text-slate-400 text-lg md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed">
                ادارة متكاملة للحضور والمدفوعات، ممزوجة بأحدث تقنيات الذكاء الاصطناعي والمقالات التقنية.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-6">
                 <Link href="/login">
                   <Button size="lg" className="rounded-2xl px-12 h-16 text-xl font-black gap-3 shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                     <LogIn className="h-6 w-6" /> دخول المعلمين
                   </Button>
                 </Link>
                 <Link href="/signup">
                   <Button size="lg" variant="outline" className="rounded-2xl px-12 h-16 text-xl font-black gap-3 border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                     <UserPlus className="h-6 w-6" /> ابدأ مجاناً
                   </Button>
                 </Link>
              </div>
           </div>
        </section>
      )}

      {/* شريط المقالات المتحرك (Ticker) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const arts = latestArticlesByCategory[cat];
          const currentArt = arts[currentSlideIndex % (arts.length || 1)];
          return (
            <Card key={cat} className="border-0 shadow-sm overflow-hidden bg-white dark:bg-slate-900 group hover:shadow-xl transition-all h-28 border-r-4 border-r-primary">
              <CardContent className="p-0 h-full flex items-center">
                <div className="p-4 flex-grow overflow-hidden text-right">
                  {currentArt ? (
                    <Link href={`/art/${currentArt.numericId}`} className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                         <Badge variant="outline" className="text-[8px] font-black uppercase text-primary border-primary/20">{cat}</Badge>
                         <span className="text-[8px] text-slate-300 font-bold uppercase">آخر الأخبار</span>
                      </div>
                      <h4 className="text-xs font-black truncate text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{currentArt.title}</h4>
                      <p className="text-[9px] text-slate-400 font-bold line-clamp-1">{currentArt.searchDescription}</p>
                    </Link>
                  ) : (
                    <p className="text-[10px] text-slate-300 font-bold italic">لا توجد مقالات في قسم {cat}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* المقالات الأكثر قراءة (الرئيسية) */}
      <section className="space-y-8">
         <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                  <TrendingUp className="h-6 w-6" />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white">الأكثر قراءة</h2>
                  <p className="text-sm text-slate-400 font-bold">المقالات التي حازت على اهتمام مجتمعنا</p>
               </div>
            </div>
            <Link href="/blog">
               <Button variant="ghost" className="rounded-xl font-black text-primary gap-2">عرض المدونة <ArrowRightLeft className="h-4 w-4 rotate-180" /></Button>
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {topArticles?.map((art) => (
               <Link href={`/art/${art.numericId}`} key={art.id}>
                  <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 group h-full hover-lift">
                     <div className="aspect-[4/3] relative">
                        <img src={art.coverImage || config.appLogo} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt={art.title} />
                        <div className="absolute top-3 right-3">
                           <Badge className="bg-white/90 backdrop-blur-md text-primary font-black text-[8px] border-0">{art.category}</Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-slate-900/60 backdrop-blur-md text-white px-2 py-0.5 rounded-lg flex items-center gap-1 text-[8px] font-bold">
                           <Eye className="h-3 w-3" /> {art.views}
                        </div>
                     </div>
                     <CardContent className="p-5 space-y-2">
                        <h4 className="font-black text-sm text-right line-clamp-2 leading-snug group-hover:text-primary transition-colors">{art.title}</h4>
                        <p className="text-[9px] text-slate-400 font-bold line-clamp-2">{art.searchDescription}</p>
                     </CardContent>
                  </Card>
               </Link>
            ))}
         </div>
      </section>

      {/* الأدوات الأساسية (محمية) */}
      <section className="space-y-8">
         <div className="flex items-center gap-3 px-2">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
               <Layout className="h-6 w-6" />
            </div>
            <div>
               <h2 className="text-3xl font-black text-slate-800 dark:text-white">أدوات المعلم</h2>
               <p className="text-sm text-slate-400 font-bold">كل ما تحتاجه لإدارة طلابك في مكان واحد</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
            { name: 'تسجيل الحضور الذكي', icon: CalendarCheck, href: '/attendance', color: 'bg-blue-600', desc: 'نظام مسح الكود QR وتسجيل الغياب التلقائي.' },
            { name: 'إدارة الطلاب النشطين', icon: Users, href: '/students', color: 'bg-emerald-600', desc: 'قواعد بيانات شاملة وأكواد تعريفية رقمية.' },
            { name: 'التقارير والمدفوعات', icon: Wallet, href: '/payments', color: 'bg-amber-600', desc: 'تتبع المستحقات المالية وتحليل نسب الالتزام.' },
            ].map((item) => (
            <Link href={item.href} key={item.name} onClick={handleProtectedClick} className="group">
               <Card className="border-0 bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] p-10 text-center flex flex-col items-center gap-6 group-hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center ${item.color} text-white shadow-2xl shadow-${item.color}/40 group-hover:rotate-6 transition-transform`}>
                     <item.icon className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-slate-800 dark:text-white">{item.name}</h3>
                     <p className="text-sm text-slate-400 font-bold">{item.desc}</p>
                  </div>
               </Card>
            </Link>
            ))}
         </div>
      </section>

      {/* نافذة التحذير الذكية */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="rounded-[3rem] border-0 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] max-w-sm overflow-hidden p-0">
          <div className="bg-primary h-2 w-full" />
          <div className="p-10 space-y-8">
              <DialogHeader className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <DialogTitle className="text-3xl font-black text-slate-800">تحتاج للدخول</DialogTitle>
                <DialogDescription className="font-bold pt-3 text-slate-400 leading-relaxed">
                  هذه الأدوات مخصصة للمعلمين المسجلين في المنظومة. يرجى الدخول لمتابعة عملك.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => router.push('/login')} className="h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20">
                   <LogIn className="h-5 w-5" /> تسجيل الدخول
                 </Button>
                 <Button onClick={() => router.push('/signup')} variant="outline" className="h-14 rounded-2xl font-black text-lg gap-3 border-primary/20 hover:bg-primary/5">
                   <UserPlus className="h-5 w-5" /> إنشاء حساب جديد
                 </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
