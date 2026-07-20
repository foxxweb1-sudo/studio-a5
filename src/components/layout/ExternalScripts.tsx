
'use client';

import { useEffect } from 'react';
import { useAppConfig } from '@/hooks/use-app-config';
import { useUser } from '@/firebase';
import { ADMIN_EMAIL } from '@/lib/constants';

/**
 * ExternalScripts - حقن الأكواد الخارجية برمجياً بناءً على إعدادات الأدمن
 * مع ميزة "عدم إزعاج المسؤول" (لا تظهر للمسؤول).
 */
export default function ExternalScripts() {
  const { config } = useAppConfig();
  const { user } = useUser();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    // إذا كان المستخدم هو المسؤول، لا نقوم بتحميل أي أكواد إعلانية لضمان راحته
    if (isAdmin) return;

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
          // التأكد من إضافة السكريبت لآخر عنصر متاح في الصفحة
          const target = [document.documentElement, document.body].filter(Boolean).pop();
          if (target) target.appendChild(s);
        })(document.createElement('script'));
      } catch (e) {
        console.error('Error injecting vignette script', e);
      }
    }

    return () => {
      // تنظيف الأكواد عند مغادرة الصفحة أو تغيير الإعدادات (اختياري)
    };
  }, [config.enableAds1, config.enableAds2, isAdmin]);

  return null;
}
