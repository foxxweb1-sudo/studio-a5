'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { doc } from 'firebase/firestore';

/**
 * ExternalScripts - حقن الأكواد الخارجية برمجياً بشكل دائم
 * يتم تفعيلها للجميع بما في ذلك الزوار (Anonymous) 
 * ويتم إيقافها فقط للمسؤول أو عند تفعيل حساب "بدون إعلانات".
 */
export default function ExternalScripts() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: profile } = useDoc<any>(userRef);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAdFree = profile?.isAdFree === true;

  useEffect(() => {
    // ننتظر حتى يتم تحديد هوية المستخدم لضمان عدم عرض الإعلانات للمسؤول بالخطأ أثناء التحميل
    if (isUserLoading) return;

    // إذا كان المستخدم هو المسؤول أو مشترك في باقة إلغاء الإعلانات، لا نقوم بتحميل أي أكواد إعلانية
    if (isAdmin || isAdFree) return;

    // حقن الكود الأول: Vignette (11350285)
    try {
      const s1 = document.createElement('script');
      s1.dataset.zone = '11350285';
      s1.src = 'https://n6wxm.com/vignette.min.js';
      const target = [document.documentElement, document.body].filter(Boolean).pop();
      if (target) target.appendChild(s1);
    } catch (e) {
      console.error('Error injecting script 1', e);
    }

    // حقن الكود الثاني: Tag (11350401)
    try {
      const s2 = document.createElement('script');
      s2.dataset.zone = '11350401';
      s2.src = 'https://nap5k.com/tag.min.js';
      const target = [document.documentElement, document.body].filter(Boolean).pop();
      if (target) target.appendChild(s2);
    } catch (e) {
      console.error('Error injecting script 2', e);
    }
  }, [isAdmin, isAdFree, isUserLoading]);

  return null;
}
