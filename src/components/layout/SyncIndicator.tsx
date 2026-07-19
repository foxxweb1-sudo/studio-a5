'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // تحديث حالة الاتصال بالإنترنت
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000); // محاكاة وقت المزامنة
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // التحقق الأولي
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Badge 
          variant="outline" 
          className={cn(
            "rounded-full gap-1.5 px-3 py-1 font-bold border-emerald-200 transition-all duration-500",
            isSyncing ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-emerald-50 text-emerald-600"
          )}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="text-[10px]">جاري المزامنة...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[10px]">متصل وآمن</span>
            </>
          )}
        </Badge>
      ) : (
        <Badge 
          variant="outline" 
          className="rounded-full gap-1.5 px-3 py-1 font-bold bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
        >
          <WifiOff className="h-3 w-3" />
          <span className="text-[10px]">وضع الأوفلاين نشط</span>
        </Badge>
      )}
    </div>
  );
}
