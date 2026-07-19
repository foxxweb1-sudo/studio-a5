'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Calendar, ArrowRight, BookOpen, Clock, TrendingUp, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col gap-16 pb-32 max-w-7xl mx-auto px-4">
      
      {/* Premium Header */}
      <section className="text-center space-y-8 pt-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative inline-block">
            <div className="w-32 h-32 mx-auto rounded-[3rem] glass-effect p-5 shadow-2xl relative z-10 animate-float">
                <img src={config.appLogo} alt="Logo" className="object-contain w-full h-full" />
            </div>
            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white p-2 rounded-2xl shadow-lg">
                <Sparkles className="h-5 w-5" />
            </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
            مجلة <span className="text-primary italic">{config.appName}</span> التقنية
          </h1>
          <p className="text-slate-400 text-xl font-bold max-w-2xl mx-auto leading-relaxed">
            استكشف عالم الذكاء الاصطناعي والتحول الرقمي مع نخبة من المقالات التعليمية والتقنية.
          </p>
        </div>
      </section>

      {/* Modern Filter Bar */}
      <section className="sticky top-24 z-30 glass-effect p-4 rounded-[2.5rem] border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:w-[450px]">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="ابحث عن المعرفة هنا..." 
              className="pr-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-900 border-0 shadow-inner font-bold text-lg focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full lg:w-auto overflow-x-auto custom-scrollbar">
            <div className="flex gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-2 rounded-2xl">
              {categories.map(cat => (
                <Button 
                  key={cat}
                  variant={activeTab === cat ? "default" : "ghost"}
                  onClick={() => setActiveTab(cat)}
                  className={`rounded-xl font-black h-12 px-8 whitespace-nowrap transition-all ${activeTab === cat ? 'shadow-xl scale-105' : 'text-slate-500 hover:bg-white'}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {activeTab === "الكل" && !searchTerm && topArticles.length > 0 && (
          <section className="space-y-8">
             <div className="flex items-center gap-4 text-indigo-600 px-4">
                <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black italic">الأكثر رواجاً</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {topArticles.map((art, idx) => (
                    <Link href={`/art/${art.numericId}`} key={art.id}>
                        <Card className="border-0 shadow-lg hover:shadow-2xl transition-all rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 group h-full border-b-8 border-b-primary/20">
                            <div className="aspect-square relative overflow-hidden">
                                <img src={art.coverImage || config.appLogo} className="object-cover w-full h-full group-hover:scale-125 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-primary font-black text-xs w-8 h-8 rounded-xl flex items-center justify-center shadow-xl">
                                    {idx + 1}
                                </div>
                                <div className="absolute bottom-3 right-3 left-3">
                                     <Badge className="bg-primary/90 text-white text-[9px] border-0">{art.category}</Badge>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <h4 className="text-sm font-black line-clamp-2 leading-snug group-hover:text-primary transition-colors">{art.title}</h4>
                                <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400">
                                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {art.views}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 5 د</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
             </div>
          </section>
      )}

      {/* Main Grid */}
      <div className="space-y-8">
          <div className="flex items-center gap-4 text-slate-800 dark:text-white px-4">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black italic">{activeTab === "الكل" ? "آخر التدوينات" : `استكشاف ${activeTab}`}</h2>
          </div>
          
          {isLoading ? (
            <div className="py-32 text-center">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary/20" />
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredArticles.map((art) => (
                <Link href={`/art/${art.numericId}`} key={art.id} className="group">
                  <Card className="border-0 shadow-xl rounded-[3.5rem] overflow-hidden bg-white dark:bg-slate-900 h-full flex flex-col hover:-translate-y-3 transition-all duration-500 border-t-8 border-t-indigo-500/10">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={art.coverImage || config.appLogo} 
                        alt={art.title} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" 
                      />
                      <div className="absolute top-6 right-6">
                        <Badge className="bg-white/80 backdrop-blur-xl text-primary font-black text-xs border-0 px-4 py-1.5 rounded-2xl shadow-xl">
                          {art.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-10 flex flex-col flex-grow space-y-6">
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {art.createdAt?.toDate ? format(art.createdAt.toDate(), 'd MMM yyyy', { locale: ar }) : 'الآن'}</span>
                        <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-primary" /> {art.views} قراءة</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-base text-slate-500 dark:text-slate-400 font-bold line-clamp-3 leading-relaxed flex-grow">
                        {art.searchDescription || 'استكشف تفاصيل هذا المقال الحصري الذي نقدمه لكم في إطار سعينا لنشر الوعي التقني.'}
                      </p>
                      <div className="pt-6 border-t border-dashed border-slate-100 flex justify-between items-center group/btn">
                        <span className="text-xs font-black text-primary group-hover/btn:translate-x-2 transition-transform">استكمل القراءة</span>
                        <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <ArrowRight className="h-5 w-5 rotate-180" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-40 text-center space-y-6 glass-effect rounded-[4rem] border-dashed border-2">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">لم نجد ما تبحث عنه</h3>
                <p className="text-slate-400 font-bold">جرب كلمات بحث أخرى أو تصفح الأقسام العامة.</p>
              </div>
            </div>
          )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}