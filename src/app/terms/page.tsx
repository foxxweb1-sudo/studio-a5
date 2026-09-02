
'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function TermsPage() {
  useEffect(() => {
    window.location.href = "https://blog.alhodoor.site/p/terms-conditions.html";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="font-bold text-slate-500">جاري توجيهك إلى "اتفاقية الاستخدام"...</p>
    </div>
  );
}
