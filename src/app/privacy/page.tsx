
'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PrivacyPage() {
  useEffect(() => {
    window.location.href = "https://blog.alhodoor.site/p/privacy-policy.html";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="font-bold text-slate-500">جاري توجيهك إلى "سياسة الخصوصية"...</p>
    </div>
  );
}
