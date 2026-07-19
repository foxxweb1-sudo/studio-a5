
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Calendar, ArrowRight, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useAppConfig } from '@/hooks/use-app-config';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Article } from '@/lib/definitions';

const categories = ["الكل", "AI", "الرقمية", "معلومات عامة", "عن المنصة"];

export default function BlogPage() {
  const { config } = useAppConfig();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState("الكل");

  const articlesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'articles'), orderBy('createdAt', 'desc')) : null,
  [firestore]);
  const { data: articles, isLoading } = useCollection<Article>(articlesQuery);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(art => {
      const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            art.searchDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeTab === "الكل" || art.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, activeTab]);

  const topArticles = useMemo(() => {
    if (!articles) return [];
    return [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [articles]);

  return (
    <div className="flex flex-col gap-12 pb-20 max-w-7xl mx-auto px-4">
      
      {/* هيدر المدونة الاحترافي */}
      <section className="text-center space-y-6 pt-10">
        <div className="relative w-28 h-28 mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white p-4">
          <img src={config.appLogo} alt="Logo" className="object-contain w-full h-full" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white">بوابة {config.appName} <span className="text-primary italic">التقنية</span></h1>
          <p className="text-slate-400 font-bold max-w-xl mx-auto">اكتشف أحدث المقالات في الذكاء الاصطناعي، التكنولوجيا، وأخبار منصتنا التعليمية.</p>
        </div>
      </section>

      {/* شريط الأقسام والبحث المطور */}
      <section className="sticky top-20 z-30 bg-background/80 backdrop-blur-md py-6 border-y border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="ابحث عن موضوع معين..." 
              className="pr-11 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border-slate-200 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full lg:w-auto overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
            <div className="flex gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl">
              {categories.map(cat => (
                <Button 
                  key={cat}
                  variant={activeTab === cat ? "default" : "ghost"}
                  onClick={() => setActiveTab(cat)}
                  className={`rounded-xl font-black h-11 px-6 whitespace-nowrap transition-all ${activeTab === cat ? 'shadow-lg' : 'text-slate-400'}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* عرض الرئيسية: الأكثر قراءة (إذا كنا في تبويب الكل ولم نبحث) */}
      {activeTab === "الكل" && !searchTerm && topArticles.length > 0 && (
          <section className="space-y-6">
             <div className="flex items-center gap-3 text-amber-600 px-2">
                <TrendingUp className="h-6 w-6" />
                <h2 className="text-2xl font-black italic">الأكثر رواجاً وقراءة</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topArticles.map((art, idx) => (
                    <Link href={`/art/${art.numericId}`} key={art.id}>
                        <Card className="border-0 shadow-sm hover:shadow-xl transition-all rounded-3xl overflow-hidden bg-white dark:bg-slate-900 group h-full border-b-4 border-b-amber-400">
                            <div className="aspect-square relative">
                                <img src={art.coverImage || config.appLogo} className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                                <div className="absolute top-2 right-2 bg-amber-400 text-white font-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                                    {idx + 1}
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h4 className="text-xs font-black line-clamp-2 leading-tight group-hover:text-primary transition-colors">{art.title}</h4>
                                <div className="flex items-center justify-between mt-2 text-[8px] font-bold text-slate-400">
                                    <span>{art.views} مشاهدة</span>
                                    <span>{art.category}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
             </div>
          </section>
      )}

      {/* شبكة المقالات الرئيسية */}
      <div className="space-y-6">
          <div className="flex items-center gap-3 text-primary px-2">
                <BookOpen className="h-6 w-6" />
                <h2 className="text-2xl font-black italic">{activeTab === "الكل" ? "آخر المستجدات" : `قسم ${activeTab}`}</h2>
          </div>
          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary/30" />
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
              {filteredArticles.map((art) => (
                <Link href={`/art/${art.numericId}`} key={art.id} className="group">
                  <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 h-full flex flex-col hover-lift border-t-8 border-t-primary/10">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={art.coverImage || config.appLogo} 
                        alt={art.title} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary font-black text-[9px] border-0 px-3 py-1 rounded-lg">
                          {art.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-8 flex flex-col flex-grow space-y-4">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {art.createdAt?.toDate ? format(art.createdAt.toDate(), 'd MMMM yyyy', { locale: ar }) : 'الآن'}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {art.views} مشاهدة</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold line-clamp-3 leading-relaxed flex-grow">
                        {art.searchDescription || 'لا يوجد وصف تعريفي متاح لهذا المقال حالياً.'}
                      </p>
                      <div className="pt-4 border-t border-dashed flex justify-between items-center">
                        <span className="text-[10px] font-black text-primary">إقرأ التفاصيل</span>
                        <div className="p-2 bg-primary/5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight className="h-4 w-4 rotate-180" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed">
              <Search className="h-12 w-12 text-slate-200 mx-auto" />
              <h3 className="text-xl font-black text-slate-400">لا توجد نتائج مطابقة لبحثك حالياً</h3>
            </div>
          )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
