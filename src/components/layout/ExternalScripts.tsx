'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { doc } from 'firebase/firestore';

/**
 * ExternalScripts - حقن الأكواد الخارجية برمجياً بشكل دائم لغير المشتركين
 * يتم إيقاف الإعلانات تلقائياً للمسؤول أو عند تفعيل حساب "بدون إعلانات".
 */
export default function ExternalScripts() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: profile } = useDoc<any>(userRef);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAdFree = profile?.isAdFree === true;

  useEffect(() => {
    // إذا كان المستخدم هو المسؤول أو مشترك في باقة إلغاء الإعلانات، لا نقوم بتحميل أي أكواد إعلانية
    if (isAdmin || isAdFree) return;

    // حقن كود الإعلانات الدائم (Vignette Script)
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
  }, [isAdmin, isAdFree]);

  return null;
}
