
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppConfig } from '@/hooks/use-app-config';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { config } = useAppConfig();

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookie-accepted');
    if (!hasAccepted) {
      // إظهار البانر بعد تأخير بسيط لإعطاء تجربة مستخدم سلسة
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-[320px] w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold">
          يستخدم موقعنا ملفات تعريف الارتباط لتعزيز تجربتك.{' '}
          <Link 
            href={config.cookiePolicyUrl || '/privacy'} 
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            لمعرفة المزيد
          </Link>
        </p>
        <div className="flex justify-end">
          <Button 
            onClick={handleAccept} 
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 py-2 h-auto font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            أقبل !
          </Button>
        </div>
      </div>
    </div>
  );
}
