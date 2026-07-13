
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { Article, AdConfig } from '@/lib/definitions';
import { PageHeader, PageHeaderTitle } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Share2, Facebook, Twitter, Linkedin, MessageCircle, 
  Eye, Calendar, User, Layout, X, Globe, ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAppConfig } from '@/hooks/use-app-config';
import Image from 'next/image';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const numericId = parseInt(params.id as string);
  const firestore = useFirestore();
  const { config } = useAppConfig();
  
  const [showAdPopup, setShowAuthPopup] = useState(false);

  // جلب المقال بالرقم التعريفي
  const artsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'articles'), where('numericId', '==', numericId), limit(1)) : null,
  [firestore, numericId]);
  const { data: articles, isLoading } = useCollection<Article>(artsQuery);
  const article = articles?.[0];

  // جلب الإعلانات
  const adRef = useMemoFirebase(() => doc(firestore, 'adConfig', 'global'), [firestore]);
  const { data: adConfig } = useDoc<AdConfig>(adRef);

  useEffect(() => {
    if (article && firestore) {
      // زيادة المشاهدات
      updateDoc(doc(firestore, 'articles', article.id), { views: increment(1) });
      
      // منطق الإعلان المنبثق: كل 200 ثانية
      const lastPopup = localStorage.getItem('last_ad_popup');
      const now = Date.now();
      if (!lastPopup || (now - parseInt(lastPopup)) > 200000) {
        const timer = setTimeout(() => {
           setShowAuthPopup(true);
           localStorage.setItem('last_ad_popup', now.toString());
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [article, firestore]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const socialLinks = [
    { icon: Facebook, color: 'bg-[#1877F2]', label: 'فيسبوك', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { icon: Twitter, color: 'bg-[#000000]', label: 'X', url: `https://twitter.com/intent/tweet?url=${shareUrl}` },
    { icon: MessageCircle, color: 'bg-[#25D366]', label: 'واتساب', url: `https://wa.me/?text=${shareUrl}` },
    { icon: Linkedin, color: 'bg-[#0A66C2]', label: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
    { icon: Globe, color: 'bg-[#FF4500]', label: 'Threads', url: `https://www.threads.net/intent/post?text=${shareUrl}` },
  ];

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto" /></div>;
  if (!article) return <div className="p-20 text-center font-black">المقال غير موجود</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-10">
      
      {/* المنبثق الإعلاني */}
      {showAdPopup && adConfig?.popupCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="bg-white rounded-[2.5rem] max-w-lg w-full relative p-1">
              <Button variant="ghost" onClick={() => setShowAuthPopup(false)} className="absolute -top-4 -left-4 bg-white shadow-xl rounded-full h-12 w-12 border-4 border-slate-100 z-10">
                 <X className="h-6 w-6" />
              </Button>
              <div className="p-6 overflow-hidden rounded-[2.2rem]" dangerouslySetInnerHTML={{ __html: adConfig.popupCode }} />
              <div className="text-center pb-4 text-[10px] font-bold text-slate-400">إعلان ترويجي</div>
           </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="flex-grow lg:w-2/3 space-y-8">
        <PageHeader className="border-0 pb-0">
           <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-black">{article.category}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold"><Calendar className="h-3.5 w-3.5" /> {article.createdAt?.toDate ? format(article.createdAt.toDate(), 'd MMMM yyyy', { locale: ar }) : ''}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold"><Eye className="h-3.5 w-3.5" /> {article.views} مشاهدة</span>
           </div>
           <PageHeaderTitle className="text-3xl md:text-5xl font-black leading-tight text-slate-800">{article.title}</PageHeaderTitle>
        </PageHeader>

        {/* إعلان تحت العنوان */}
        {adConfig?.underTitleCode && <div className="w-full text-center" dangerouslySetInnerHTML={{ __html: adConfig.underTitleCode }} />}

        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
           <Image src={article.coverImage || config.appLogo} alt={article.title} fill className="object-cover" />
        </div>

        <article className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100 leading-relaxed">
           <div className="prose prose-slate max-w-none prose-img:rounded-3xl" dangerouslySetInnerHTML={{ __html: article.content }} />
           
           {/* إعلان وسط المقال */}
           {adConfig?.middleArticleCode && <div className="my-10 p-4 bg-slate-50 rounded-3xl text-center border-2 border-dashed border-slate-200" dangerouslySetInnerHTML={{ __html: adConfig.middleArticleCode }} />}
        </article>

        {/* مشاركة */}
        <Card className="border-0 shadow-lg rounded-[2.5rem] bg-slate-900 text-white p-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-white/10 rounded-3xl"><Share2 className="h-8 w-8 text-primary" /></div>
                 <div className="text-right">
                    <h4 className="text-xl font-black">أعجبك المقال؟</h4>
                    <p className="text-slate-400 font-bold">شاركه مع أصدقائك لتعم الفائدة</p>
                 </div>
              </div>
              <div className="flex flex-wrap gap-2">
                 {socialLinks.map(s => (
                   <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={`h-12 px-6 rounded-2xl flex items-center gap-2 font-bold text-white transition-transform hover:scale-105 ${s.color}`}>
                      <s.icon className="h-5 w-5" /> {s.label}
                   </a>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      {/* الشريط الجانبي */}
      <aside className="lg:w-1/3 space-y-8">
        <Card className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden bg-white sticky top-24">
           <CardHeader className="bg-slate-50 border-b p-6">
              <CardTitle className="text-lg flex items-center gap-2"><Layout className="h-5 w-5 text-primary" /> عن المنصة</CardTitle>
           </CardHeader>
           <CardContent className="p-8 space-y-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden shadow-lg">
                 <Image src={config.appLogo} alt="Logo" fill className="object-contain p-2 bg-white" />
              </div>
              <h3 className="font-black text-xl">{config.appName}</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">بوابتك الذكية للتعليم الحديث والتقنية الرقمية. تابعنا لتصلك أحدث المستجدات.</p>
              
              {/* إعلان جانبي */}
              {adConfig?.sidebarCode && <div className="pt-4 border-t border-dashed" dangerouslySetInnerHTML={{ __html: adConfig.sidebarCode }} />}
              
              <Button onClick={() => router.push('/')} variant="outline" className="w-full h-12 rounded-xl font-black mt-4">العودة للرئيسية</Button>
           </CardContent>
        </Card>
      </aside>
    </div>
  );
}
