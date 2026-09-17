'use client';

import { useEffect, useState } from 'react';
import { useUser, useDatabase } from '@/firebase';
import { ref, get } from 'firebase/database';
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

    const checkAdStatus = async () => {
      const adFreeRef = ref(database, `users/${user.uid}/isAdFree`);
      const snapshot = await get(adFreeRef);
      setIsAdFree(snapshot.exists() ? snapshot.val() : false);
    };

    checkAdStatus();
  }, [user, database]);

  // لا تظهر الإعلانات إذا كان المستخدم PRO أو إذا لم يكن هناك كود مسجل
  if (isAdFree || !config.bannerAdCode) return null;

  return (
    <div className="my-8 flex justify-center w-full overflow-hidden">
      <div 
        className="max-w-full ad-container"
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

    const checkAdStatus = async () => {
      const adFreeRef = ref(database, `users/${user.uid}/isAdFree`);
      const snapshot = await get(adFreeRef);
      setIsAdFree(snapshot.exists() ? snapshot.val() : false);
    };

    checkAdStatus();
  }, [user, database]);

  // حقن كود البوب اندر في الـ Body إذا وجد
  useEffect(() => {
    if (!isAdFree && config.popunderAdCode) {
      const scriptContainer = document.createElement('div');
      scriptContainer.innerHTML = config.popunderAdCode;
      
      // تنفيذ السكربتات الموجودة في الكود
      const scripts = scriptContainer.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const s = document.createElement('script');
        if (scripts[i].src) {
          s.src = scripts[i].src;
        } else {
          s.textContent = scripts[i].textContent;
        }
        document.body.appendChild(s);
      }
    }
  }, [isAdFree, config.popunderAdCode]);

  return null;
}
