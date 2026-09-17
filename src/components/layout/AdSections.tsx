'use client';

import { useEffect, useState } from 'react';
import { useUser, useDatabase } from '@/firebase';
import { ref, get, onValue } from 'firebase/database';
import { useAppConfig } from '@/hooks/use-app-config';

/**
 * مكون لعرض إعلانات البانر السحابية المدارة من لوحة التحكم
 */
export function BannerAd() {
  const { user } = useUser();
  const database = useDatabase();
  const { config } = useAppConfig();
  const [isAdFree, setIsAdFree] = useState(true);

  useEffect(() => {
    if (!user || !database) {
      setIsAdFree(false);
      return;
    }

    // مراقبة حالة الـ Ad-Free لحظياً من RTDB
    const adFreeRef = ref(database, `users/${user.uid}/isAdFree`);
    const unsubscribe = onValue(adFreeRef, (snapshot) => {
      setIsAdFree(snapshot.exists() ? snapshot.val() : false);
    });

    return () => unsubscribe();
  }, [user, database]);

  // لا تظهر الإعلانات إذا كان المستخدم PRO أو إذا لم يكن هناك كود مسجل
  if (isAdFree || !config.bannerAdCode) return null;

  return (
    <div className="my-8 flex justify-center w-full overflow-hidden animate-in fade-in duration-1000">
      <div 
        className="max-w-full ad-container bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-800"
        dangerouslySetInnerHTML={{ __html: config.bannerAdCode }} 
      />
    </div>
  );
}

/**
 * مكون لحقن أكواد البوب اندر السحابية
 */
export function NativeArticleAd() {
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

  // حقن كود البوب اندر في الـ Body إذا وجد ولم يكن المستخدم PRO
  useEffect(() => {
    if (!isAdFree && config.popunderAdCode) {
      const scriptContainer = document.createElement('div');
      scriptContainer.id = 'cloud-popunder-container';
      scriptContainer.innerHTML = config.popunderAdCode;
      
      // تنفيذ السكربتات الموجودة في الكود
      const scripts = scriptContainer.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const s = document.createElement('script');
        if (scripts[i].src) {
          s.src = scripts[i].src;
          s.async = true;
        } else {
          s.textContent = scripts[i].textContent;
        }
        document.body.appendChild(s);
      }

      return () => {
        const existing = document.getElementById('cloud-popunder-container');
        if (existing) existing.remove();
      };
    }
  }, [isAdFree, config.popunderAdCode]);

  return null;
}
