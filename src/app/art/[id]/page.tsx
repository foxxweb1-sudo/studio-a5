
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { Article, AdConfig } from '@/lib/definitions';
import { PageHeader, PageHeaderTitle } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Share2, Facebook, Twitter, Linkedin, MessageCircle, 
  Eye, Calendar, Layout, X, Globe, Loader2, Send
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
  
  const [showAdPopup, setShowAdPopup] = useState(false);

  // جلب المقال بالرقم التعريفي (Numeric ID) ليكون الرابط احترافياً
  const artsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'articles'), where('numericId', '==', numericId), limit(1)) : null,
  [firestore, numericId]);
  const { data: articles, isLoading } = useCollection<Article>(artsQuery);
  const article = articles?.[0];

  // جلب إعدادات الإعلانات
  const adRef = useMemoFirebase(() => doc(firestore, 'adConfig', 'global'), [firestore]);
  const { data: adConfig } = useDoc<AdConfig>(adRef);

  useEffect(() => {
    if (article && firestore) {
      // زيادة عدد المشاهدات تلقائياً عند الزيارة
      updateDoc(doc(firestore, 'articles', article.id), { views: increment(1) });
      
      // منطق الإعلان المنبثق: يظهر كل 200 ثانية للزائر
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
    { icon: Linkedin, color: 'bg-[#0A66C2]', label: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
  ];

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary/30" />
        <p className="font-black text-slate-400">جاري تحميل المقال...</p>
    </div>
  );
  
  if (!article) return (
    <div className="flex flex-col justify-center items-center h-[70vh] gap-6 px-4">
        <div className="p-12 bg-white dark:bg-slate-900 rounded-[3rem] text-center border-2 border-dashed border-rose-100 dark:border-rose-900 shadow-2xl max-w-md w-full">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <X className="h-10 w-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">عفواً، المقال غير موجود</h2>
            <p className="text-slate-400 font-bold mb-8">ربما تم حذف المقال أو أن الرابط الذي تتبعه غير صحيح.</p>
            <Button onClick={() => router.push('/')} className="rounded-2xl h-12 px-8 w-full font-black">العودة للرئيسية</Button>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-10 animate-in fade-in duration-700">
      
      {/* المنبثق الإعلاني الذكي */}
      {showAdPopup && adConfig?.popupCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="bg-white rounded-[2.5rem] max-w-lg w-full relative p-1 shadow-2xl animate-in zoom-in duration-300">
              <Button variant="ghost" onClick={() => setShowAdPopup(false)} className="absolute -top-4 -left-4 bg-white shadow-xl rounded-full h-12 w-12 border-4 border-slate-100 z-10 hover:bg-slate-50">
                 <X className="h-6 w-6" />
              </Button>
              <div className="p-6 overflow-hidden rounded-[2.2rem]" dangerouslySetInnerHTML={{ __html: adConfig.popupCode }} />
              <div className="text-center pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">إعلان ممول</div>
           </div>
        </div>
      )}

      {/* المحتوى الرئيسي للمقال */}
      <div className="flex-grow lg:w-2/3 space-y-8">
        <div className="space-y-6">
           <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary text-white hover:bg-primary px-4 py-1.5 rounded-full text-[10px] font-black border-0 shadow-lg shadow-primary/20">
                {article.category}
              </Badge>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <Calendar className="h-3.5 w-3.5" /> 
                {article.createdAt?.toDate ? format(article.createdAt.toDate(), 'd MMMM yyyy', { locale: ar }) : 'الآن'}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <Eye className="h-3.5 w-3.5 text-primary" /> 
                {article.views} مشاهدة
              </span>
           </div>
           <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-slate-800 dark:text-white text-right">
             {article.title}
           </h1>
           {article.searchDescription && (
             <p className="text-lg text-slate-500 font-bold border-r-4 border-primary pr-4 leading-relaxed italic">
               {article.searchDescription}
             </p>
           )}
        </div>

        {/* إعلان تحت العنوان */}
        {adConfig?.underTitleCode && (
          <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800" dangerouslySetInnerHTML={{ __html: adConfig.underTitleCode }} />
        )}

        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-white dark:border-slate-800">
           <img 
            src={article.coverImage || config.appLogo} 
            alt={article.title} 
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000" 
           />
        </div>

        <article className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-xl border border-slate-100 dark:border-slate-800 relative">
           <div className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-[2rem] prose-img:shadow-xl prose-headings:font-black prose-p:font-bold prose-p:text-slate-600 dark:prose-p:text-slate-300 text-right leading-[1.8]" dangerouslySetInnerHTML={{ __html: article.content }} />
           
           {/* إعلان وسط المقال (نمط جوجل أدسنس) */}
           {adConfig?.middleArticleCode && (
             <div className="my-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-inner" dangerouslySetInnerHTML={{ __html: adConfig.middleArticleCode }} />
           )}
        </article>

        {/* قسم المشاركة المميز */}
        <Card className="border-0 shadow-2xl rounded-[3rem] bg-slate-900 text-white p-8 md:p-12 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-5">
                 <div className="p-5 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/10 shrink-0">
                    <Share2 className="h-10 w-10 text-primary" />
                 </div>
                 <div className="text-right">
                    <h4 className="text-2xl font-black mb-1">هل أعجبك المقال؟</h4>
                    <p className="text-slate-400 font-bold">ساهم في نشر الفائدة مع أصدقائك بضغطة زر</p>
                 </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                 {socialLinks.map(s => (
                   <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={`h-14 px-6 rounded-2xl flex items-center gap-2 font-bold text-white transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 shadow-lg ${s.color}`}>
                      <s.icon className="h-5 w-5" /> 
                      <span className="hidden sm:inline">{s.label}</span>
                   </a>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      {/* الشريط الجانبي الذكي (Desktop Sidebar) */}
      <aside className="lg:w-1/3 space-y-8">
        <div className="lg:sticky lg:top-24 space-y-8">
            <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border-t-8 border-t-primary">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b p-8 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700 bg-white">
                        <img src={config.appLogo} alt="Logo" className="object-contain p-3 w-full h-full" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-800 dark:text-white">{config.appName}</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">البوابة التعليمية الرقمية</p>
                </CardHeader>
                <CardContent className="p-8 space-y-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        نحن نقدم لك أحدث المستجدات في عالم الذكاء الاصطناعي والحياة الرقمية، مع أدوات ذكية لإدارة العملية التعليمية.
                    </p>
                    
                    {/* إعلان الشريط الجانبي */}
                    {adConfig?.sidebarCode && (
                        <div className="pt-6 border-t border-dashed border-slate-100 dark:border-slate-800">
                            <div className="rounded-2xl overflow-hidden shadow-inner" dangerouslySetInnerHTML={{ __html: adConfig.sidebarCode }} />
                        </div>
                    )}
                    
                    <Button onClick={() => router.push('/')} variant="outline" className="w-full h-14 rounded-2xl font-black mt-4 gap-2 border-primary/20 hover:bg-primary hover:text-white transition-all">
                        <ArrowLeft className="h-5 w-5 ms-2" /> العودة للرئيسية
                    </Button>
                </CardContent>
            </Card>

            {/* بطاقة متابعة سريعة */}
            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-700 text-white p-8 text-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <h5 className="text-lg font-black mb-4 relative z-10">انضم لمجتمعنا على واتساب</h5>
                <Button asChild className="w-full h-12 rounded-xl bg-white text-primary hover:bg-slate-100 font-black relative z-10">
                    <a href={config.whatsappChannel} target="_blank" rel="noopener noreferrer">اشترك الآن</a>
                </Button>
            </Card>
        </div>
      </aside>
    </div>
  );
}
