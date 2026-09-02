'use client';

import { useEffect, useRef } from 'react';

/**
 * مكون إعلان البانر 468x60
 */
export function BannerAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // نتحقق من عدم وجود الإعلان مسبقاً لمنع التكرار عند إعادة الرندر
    if (adRef.current && adRef.current.childNodes.length === 0) {
      const script = document.createElement('script');
      const conf = document.createElement('script');
      conf.innerHTML = `
        atOptions = {
          'key' : 'fbc7f87800be1cae51dad70ec282616e',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      script.src = 'https://www.highrevenueformat.com/fbc7f87800be1cae51dad70ec282616e/invoke.js';
      script.async = true;
      adRef.current.appendChild(conf);
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center w-full my-8 overflow-hidden">
      <div ref={adRef} className="max-w-full rounded-xl overflow-hidden shadow-sm" />
    </div>
  );
}

/**
 * مكون الإعلان المخصص (Native) أسفل المقالات
 */
export function NativeArticleAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // تحميل السكربت الخارجي في الـ Head
    const scriptId = 'profitablerate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://pl31155904.profitableratecpmnetwork.com/e4a3dd200a382fdfe17a5ede528a2491/invoke.js';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full my-12 bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner">
      <div id="container-e4a3dd200a382fdfe17a5ede528a2491"></div>
    </div>
  );
}
