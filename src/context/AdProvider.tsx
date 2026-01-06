'use client';

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';

interface AdContextType {
  showAd: boolean;
  closeAd: () => void;
}

export const AdContext = createContext<AdContextType | undefined>(undefined);

const AD_INTERVAL = 2; // Show ad every 2 navigations

export function AdProvider({ children }: { children: ReactNode }) {
  const [navCount, setNavCount] = useLocalStorage('navigationCount', 0);
  const [showAd, setShowAd] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Exclude auth pages from counting
    if (['/login', '/signup', '/forgot-password'].includes(pathname)) {
        return;
    }
      
    // Don't do anything if an ad is already showing
    if (showAd) {
        return;
    }

    const newCount = (navCount || 0) + 1;
    setNavCount(newCount);

    if (newCount % AD_INTERVAL === 0 && newCount > 0) {
      setShowAd(true);
    }
  }, [pathname]); // Intentionally only depends on pathname

  const closeAd = useCallback(() => {
    setShowAd(false);
  }, []);

  const value = {
    showAd,
    closeAd,
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
}
