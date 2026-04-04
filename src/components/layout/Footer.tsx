'use client';

import { Button } from '@/components/ui/button';
import {
  ChevronUp,
} from 'lucide-react';
import AiAssistant from './AiAssistant';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-card text-card-foreground border-t mt-12">
      <div className="container max-w-screen-xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-2">
              <AiAssistant />
              <span className="text-[10px] text-muted-foreground hidden sm:block font-bold">المساعد الذكي</span>
          </div>
          
          <p className="text-[10px] md:text-xs text-muted-foreground text-center flex-shrink-0 px-4 font-medium">
          جميع الحقوق محفوظة © {new Date().getFullYear()} لشركة تقنيات.
          </p>
          
          <div className="flex-1 flex justify-end">
              <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-10 w-10 bg-muted hover:bg-muted/90 text-muted-foreground shadow-sm"
              onClick={scrollToTop}
              >
              <ChevronUp className="h-5 w-5" />
              </Button>
          </div>
      </div>
    </footer>
  );
}
