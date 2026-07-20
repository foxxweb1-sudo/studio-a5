
'use client';

import { useEffect } from 'react';
import { useAppConfig } from '@/hooks/use-app-config';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { doc } from 'firebase/firestore';

/**
 * ExternalScripts - حقن الأكواد الخارجية برمجياً بناءً على إعدادات الأدمن
 * مع ميزة "عدم إزعاج المسؤول" والمشتركين (لا تظهر للمسؤول أو الحسابات المفعلة).
 */
export default function ExternalScripts() {
  const { config } = useAppConfig();
  const { user } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: profile } = useDoc<any>(userRef);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAdFree = profile?.isAdFree === true;

  useEffect(() => {
    // إذا كان المستخدم هو المسؤول أو مشترك في باقة إلغاء الإعلانات، لا نقوم بتحميل أي أكواد إعلانية
    if (isAdmin || isAdFree) return;

    // حقن الكود الأول (Direct Link/Script) إذا كان مفعلاً
    if (config.enableAds1) {
      const script1 = document.createElement('script');
      script1.src = 'https://omg10.com/4/11350283';
      script1.async = true;
      document.body.appendChild(script1);
    }

    // حقن الكود الثاني (Vignette Script) إذا كان مفعلاً
    if (config.enableAds2) {
      try {
        (function(s: any){
          s.dataset.zone='11350285';
          s.src='https://n6wxm.com/vignette.min.js';
          const target = [document.documentElement, document.body].filter(Boolean).pop();
          if (target) target.appendChild(s);
        })(document.createElement('script'));
      } catch (e) {
        console.error('Error injecting vignette script', e);
      }
    }
  }, [config.enableAds1, config.enableAds2, isAdmin, isAdFree]);

  return null;
}
