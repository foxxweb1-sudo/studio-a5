
'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * مكون إعلان البانر 468x60 - يراقب Firestore لإخفاء الإعلان للمشتركين
 */
export function BannerAd() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile } = useDoc<any>(userRef);

  const isAdFree = !!userProfile?.isAdFree;

  useEffect(() => {
    if (isAdFree) return;

    const adContainer = document.getElementById('ad-banner-slot');
    if (adContainer && adContainer.childNodes.length === 0) {
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
      adContainer.appendChild(conf);
      adContainer.appendChild(script);
    }
  }, [isAdFree]);

  if (isAdFree) return null;

  return (
    <div className="flex flex-col items-center w-full my-8 overflow-hidden min-h-[80px]">
      <span className="text-[9px] text-muted-foreground font-black mb-1.5 uppercase tracking-[0.2em] opacity-60">مادة إعلانية</span>
      <div id="ad-banner-slot" className="max-w-full rounded-xl overflow-hidden shadow-sm" />
    </div>
  );
}

/**
 * مكون الإعلان المخصص (Native) - يراقب Firestore لإخفاء الإعلان للمشتركين
 */
export function NativeArticleAd() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile } = useDoc<any>(userRef);

  const isAdFree = !!userProfile?.isAdFree;

  useEffect(() => {
    if (isAdFree) return;

    const scriptId = 'profitablerate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://pl31155904.profitableratecpmnetwork.com/e4a3dd200a382fdfe17a5ede528a2491/invoke.js';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.head.appendChild(script);
    }
  }, [isAdFree]);

  if (isAdFree) return null;

  return (
    <div className="w-full my-12 flex flex-col items-center">
      <span className="text-[9px] text-muted-foreground font-black mb-2 uppercase tracking-[0.2em] opacity-60">مادة إعلانية</span>
      <div className="w-full bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner">
        <div id="container-e4a3dd200a382fdfe17a5ede528a2491"></div>
      </div>
    </div>
  );
}
