'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink, Calendar, Newspaper, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface BlogPost {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  thumbnail: string;
}

export default function BlogFeed() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        // نستخدم rss2json كبروكسي لتفادي مشاكل CORS وتحويل XML إلى JSON
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=https://blog.alhodoor.site/rss.xml`
        );
        const data = await response.json();
        
        if (data.status === 'ok') {
          // نأخذ أول 9 مقالات فقط (3×3)
          const items = data.items.slice(0, 9).map((item: any) => ({
            title: item.title,
            link: item.link,
            description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...',
            pubDate: new Date(item.pubDate).toLocaleDateString('ar-EG'),
            thumbnail: item.thumbnail || `https://picsum.photos/seed/${Math.random()}/400/250`,
          }));
          setPosts(items);
        }
      } catch (error) {
        console.error('Error fetching blog feed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRSS();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
        <p className="text-slate-400 font-bold">جاري تحميل آخر مقالات المدونة...</p>
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">مدونة الحضور</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">آخر الأخبار والمقالات التعليمية</p>
          </div>
        </div>
        <a 
          href="https://blog.alhodoor.site" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-primary font-black text-sm hover:underline"
        >
          زيارة المدونة بالكامل
          <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <a 
            key={i} 
            href={post.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group block"
          >
            <Card className="border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 h-full flex flex-col">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={post.thumbnail} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                   <Badge className="bg-white/20 backdrop-blur-md text-white border-0 font-bold">قراءة المزيد</Badge>
                </div>
              </div>
              <CardContent className="p-6 flex-grow flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                    <Calendar className="h-3 w-3" />
                    {post.pubDate}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
}
