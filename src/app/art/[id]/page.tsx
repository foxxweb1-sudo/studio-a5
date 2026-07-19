
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { Article, AdConfig } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Share2, Facebook, Twitter, Linkedin, MessageCircle, 
  Eye, Calendar, X, Loader2, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAppConfig } from '@/hooks/use-app-config';
import { Badge } from '@/components/ui/badge';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const numericId = parseInt(params.id as string);
  const firestore = useFirestore();
  const { config } = useAppConfig();
  
  const [showAdPopup, setShowAdPopup] = useState(false);

  const artsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'articles'), where('numericId', '==', numericId), limit(1)) : null,
  [firestore, numericId]);
  const { data: articles, isLoading } = useCollection<Article>(artsQuery);
  const article = articles?.[0];

  const adRef = useMemoFirebase(() => doc(firestore, 'adConfig', 'global'), [firestore]);
  const { data: adConfig } = useDoc<AdConfig>(adRef);

  useEffect(() => {
    if (article && firestore) {
      updateDoc(doc(firestore, 'articles', article.id), { views: increment(1) });
      const lastPopup = localStorage.getItem('last_ad_popup');
      const now = Date.now();
      if (!lastPopup || (now - parseInt(lastPopup)) > 200000) {
        const timer = setTimeout(() => {
           setShowAdPopup(true);
           localStorage.setItem('last_ad_popup', now.toString());
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [article, firestore]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const socialLinks = [
    { icon: Facebook, color: 'bg-[#1877F2]', label: 'فيسبوك', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { icon: Twitter, color: 'bg-[#000000]', label: 'X', url: `https://twitter.com/intent/tweet?url=${shareUrl}` },
    { icon: MessageCircle, color: 'bg-[#25D366]', label: 'واتساب', url: `https://wa.me/?text=${shareUrl}` },
    { icon: Send, color: 'bg-[#0088cc]', label: 'تلجرام', url: `https://t.me/share/url?url=${shareUrl}` },
  ];

  if (isLoading) return <div className="py-40 text-center"><Loader2 className="animate-spin h-12 w-12 mx-auto text-primary/30" /></div>;
  if (!article) return <div className="py-40 text-center font-black">المقال غير موجود</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-10 animate-in fade-in duration-700">
      {showAdPopup && adConfig?.popupCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="bg-white rounded-[2.5rem] max-w-lg w-full relative p-1 shadow-2xl">
              <Button variant="ghost" onClick={() => setShowAdPopup(false)} className="absolute -top-4 -left-4 bg-white shadow-xl rounded-full h-12 w-12 border-4 border-slate-100"><X className="h-6 w-6" /></Button>
              <div className="p-6 overflow-hidden rounded-[2.2rem]" dangerouslySetInnerHTML={{ __html: adConfig.popupCode }} />
           </div>
        </div>
      )}

      <div className="flex-grow lg:w-2/3 space-y-8">
        <div className="space-y-6">
           <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary text-white hover:bg-primary px-4 py-1.5 rounded-full text-[10px] font-black border-0">{article.category}</Badge>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold"><Calendar className="h-3.5 w-3.5" /> {article.createdAt?.toDate ? format(article.createdAt.toDate(), 'd MMMM yyyy', { locale: ar }) : 'الآن'}</span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold"><Eye className="h-3.5 w-3.5 text-primary" /> {article.views} مشاهدة</span>
           </div>
           <h1 className="text-3xl md:text-6xl font-black leading-tight">{article.title}</h1>
           <p className="text-lg text-slate-500 font-bold border-r-4 border-primary pr-4 italic">{article.searchDescription}</p>
        </div>

        {adConfig?.underTitleCode && <div className="w-full bg-slate-50 rounded-[2rem] p-4 text-center border-2 border-dashed" dangerouslySetInnerHTML={{ __html: adConfig.underTitleCode }} />}

        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
           <img src={article.coverImage || config.appLogo} alt={article.title} className="object-cover w-full h-full" />
        </div>

        <article className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-16 shadow-xl border border-slate-100 relative">
           <div className="prose prose-lg dark:prose-invert max-w-none text-right leading-[1.8]" dangerouslySetInnerHTML={{ __html: article.content }} />
           {adConfig?.middleArticleCode && <div className="my-12 p-8 bg-slate-50 rounded-[2.5rem] text-center border-2 border-dashed" dangerouslySetInnerHTML={{ __html: adConfig.middleArticleCode }} />}
        </article>

        <Card className="border-0 shadow-2xl rounded-[3rem] bg-slate-900 text-white p-8 md:p-12 overflow-hidden relative">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <h4 className="text-2xl font-black">شارك المعرفة مع أصدقائك:</h4>
              <div className="flex flex-wrap gap-3">
                 {socialLinks.map(s => (
                   <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={`h-14 px-6 rounded-2xl flex items-center gap-2 font-bold text-white shadow-lg ${s.color}`}>
                      <s.icon className="h-5 w-5" /> <span>{s.label}</span>
                   </a>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      <aside className="lg:w-1/3 space-y-8">
        <div className="lg:sticky lg:top-24 space-y-8">
            <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white border-t-8 border-t-primary text-center p-8">
                <div className="relative w-24 h-24 mx-auto mb-6 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
                    <img src={config.appLogo} alt="Logo" className="object-contain p-3 w-full h-full" />
                </div>
                <CardTitle className="text-2xl font-black">{config.appName}</CardTitle>
                <p className="text-sm text-slate-500 font-bold mt-4 leading-relaxed">نحن نقدم لك أحدث المستجدات في عالم الذكاء الاصطناعي والحياة الرقمية، مع أدوات ذكية لإدارة العملية التعليمية.</p>
                {adConfig?.sidebarCode && <div className="pt-6 mt-6 border-t border-dashed" dangerouslySetInnerHTML={{ __html: adConfig.sidebarCode }} />}
                <Button onClick={() => router.push('/')} variant="outline" className="w-full h-14 rounded-2xl font-black mt-8 gap-2 border-primary/20"><ArrowLeft className="h-5 w-5 ms-2" /> الرئيسية</Button>
            </Card>
        </div>
      </aside>
    </div>
  );
}
