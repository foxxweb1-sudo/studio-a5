'use client';

import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import AiAssistant from './AiAssistant';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-6 mt-auto">
      <div className="container max-w-screen-2xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* الجهة اليمنى: زر العودة للأعلى */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-12 w-12 bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all shadow-sm border-slate-200"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>

        {/* المنتصف: حقوق الملكية */}
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 text-center">
          جميع الحقوق محفوظة © 2026 لفريق TECH.
        </p>

        {/* الجهة اليسرى: المساعد الذكي */}
        <div className="flex items-center gap-3">
           <span className="text-sm font-black text-slate-700 dark:text-slate-300">المساعد الذكي</span>
           <AiAssistant />
        </div>

      </div>
    </footer>
  );
}
