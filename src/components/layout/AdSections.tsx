'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, useDatabase } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import { useAppConfig } from '@/hooks/use-app-config';

interface AdSlotProps {
  type: 'banner728x90' | 'banner300x250' | 'banner160x600' | 'banner320x50' | 'banner468x60' | 'banner160x300' | 'native' | 'adsenseResponsive' | 'adsenseInArticle';
  className?: string;
}

/**
 * مكون عرض الوحدات الإعلانية الثابتة
 */
export function AdSlot({ type, className }: AdSlotProps) {
  const { user } = useUser();
  const database = useDatabase();
  const { config } = useAppConfig();
  const [isAdFree, setIsAdFree] = useState(true);

  useEffect(() => {
    if (!user || !database) {
      setIsAdFree(false);
      return;
    }
    const adFreeRef = ref(database, `users/${user.uid}/isAdFree`);
    const unsubscribe = onValue(adFreeRef, (snapshot) => {
      setIsAdFree(snapshot.exists() ? snapshot.val() : false);
    });
    return () => unsubscribe();
  }, [user, database]);

  // جلب الكود الصحيح بناءً على النوع
  const adCodeMap: Record<string, string | undefined> = {
    banner728x90: config.banner728x90Code,
    banner300x250: config.banner300x250Code,
    banner160x600: config.banner160x600Code,
    banner320x50: config.banner320x50Code,
    banner468x60: config.banner468x60Code,
    banner160x300: config.banner160x300Code,
    native: config.nativeAdCode,
    adsenseResponsive: config.adsenseResponsiveCode,
    adsenseInArticle: config.adsenseInArticleCode,
  };

  const code = adCodeMap[type];

  if (isAdFree || !code) return null;

  return (
    <div className={`ad-slot-container my-6 flex justify-center w-full overflow-hidden animate-in fade-in duration-700 ${className}`}>
      <div 
        className="max-w-full rounded-xl overflow-hidden border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-2"
        dangerouslySetInnerHTML={{ __html: code }} 
      />
    </div>
  );
}

/**
 * مكون حقن السكربتات العالمية (Popunder, Social Bar, AdSense Client, Smartlink)
 */
export function GlobalAdsInjector() {
  const { user } = useUser();
  const database = useDatabase();
  const { config } = useAppConfig();
  const [isAdFree, setIsAdFree] = useState(true);
  const injectedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!user || !database) {
      setIsAdFree(false);
      return;
    }
    const unsubscribe = onValue(ref(database, `users/${user.uid}/isAdFree`), (snap) => {
      setIsAdFree(snap.exists() ? snap.val() : false);
    });
    return () => unsubscribe();
  }, [user, database]);

  useEffect(() => {
    const cleanup = () => {
      injectedIdsRef.current.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      injectedIdsRef.current = [];
      document.querySelectorAll('[data-ad-injected="true"]').forEach(el => el.remove());
    };

    if (!isAdFree) {
      cleanup();
      
      const codesToInject = [
        { code: config.popunderAdCode, label: 'popunder' },
        { code: config.socialBarCode, label: 'socialbar' },
        { code: config.smartlinkCode, label: 'smartlink' },
        { code: config.adsenseClientCode, label: 'adsense-global' }
      ];

      codesToInject.forEach(item => {
        if (!item.code) return;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.code;
        
        const scripts = tempDiv.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const s = document.createElement('script');
          const scriptId = `cloud-script-${item.label}-${Math.random().toString(36).substr(2, 5)}`;
          
          if (scripts[i].src) s.src = scripts[i].src;
          else s.textContent = scripts[i].textContent;
          
          s.async = true;
          s.id = scriptId;
          s.setAttribute('data-ad-injected', 'true');
          document.body.appendChild(s);
          injectedIdsRef.current.push(scriptId);
        }
      });
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isAdFree, config]);

  return null;
}

/**
 * مكون البانر القديم (للخلفية والتوافق)
 */
export function BannerAd() {
    return <AdSlot type="banner728x90" />;
}

export function NativeArticleAd() {
    return <GlobalAdsInjector />;
}
