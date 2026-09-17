'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, useDatabase } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import { useAppConfig } from '@/hooks/use-app-config';

/**
 * مكون لعرض إعلانات البانر السحابية المدارة من لوحة التحكم
 */
export function BannerAd() {
  const { user } = useUser();
  const database = useDatabase();
  const { config } = useAppConfig();
  const [isAdFree, setIsAdFree] = useState(true); // نفترض أنه محترف حتى نتحقق

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

  if (isAdFree || !config.bannerAdCode) return null;

  return (
    <div className="my-8 flex justify-center w-full overflow-hidden animate-in fade-in duration-1000">
      <div 
        id="cloud-banner-ad-container"
        className="max-w-full ad-container bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-800"
        dangerouslySetInnerHTML={{ __html: config.bannerAdCode }} 
      />
    </div>
  );
}

/**
 * مكون لحقن وإزالة أكواد البوب اندر السحابية بدقة
 */
export function NativeArticleAd() {
  const { user } = useUser();
  const database = useDatabase();
  const { config } = useAppConfig();
  const [isAdFree, setIsAdFree] = useState(true);
  const injectedScriptsRef = useRef<string[]>([]);

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

  useEffect(() => {
    // وظيفة لتنظيف السكربتات القديمة
    const cleanupScripts = () => {
      injectedScriptsRef.current.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      injectedScriptsRef.current = [];
      
      // محاولة حذف أي عناصر متبقية تحمل وسم إعلاني عام
      document.querySelectorAll('[data-ad-injected="true"]').forEach(el => el.remove());
    };

    if (!isAdFree && config.popunderAdCode) {
      cleanupScripts();
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = config.popunderAdCode;
      
      const scripts = tempDiv.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const scriptId = `cloud-script-${Math.random().toString(36).substr(2, 9)}`;
        const s = document.createElement('script');
        
        if (scripts[i].src) {
          s.src = scripts[i].src;
          s.async = true;
        } else {
          s.textContent = scripts[i].textContent;
        }
        
        s.id = scriptId;
        s.setAttribute('data-ad-injected', 'true');
        document.body.appendChild(s);
        injectedScriptsRef.current.push(scriptId);
      }
    } else if (isAdFree) {
      cleanupScripts();
    }

    return () => cleanupScripts();
  }, [isAdFree, config.popunderAdCode]);

  return null;
}
