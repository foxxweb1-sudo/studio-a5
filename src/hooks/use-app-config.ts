
'use client';

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { GlobalConfig } from "@/lib/definitions";
import { doc, setDoc } from "firebase/firestore";
import { useMemo } from 'react';

export const DEFAULT_LOGO = "https://www.appcreator24.com/srv/imgs/gen/3816551_ico.png?v=19";
export const DEFAULT_NAME = "الحضور";
export const DEFAULT_LOGIN_BG = "https://picsum.photos/seed/dunes/1920/1080";
export const DEFAULT_SIGNUP_BG = "https://picsum.photos/seed/lake/1920/1080";

export function useAppConfig() {
  const firestore = useFirestore();
  const configRef = useMemoFirebase(() => doc(firestore, 'appConfig', 'global'), [firestore]);
  const { data: config, isLoading } = useDoc<GlobalConfig>(configRef);

  const updateConfig = async (newConfig: Partial<GlobalConfig>) => {
    if (!firestore) return;
    await setDoc(configRef, newConfig, { merge: true });
  };

  const memoizedConfig = useMemo(() => ({
    appName: config?.appName || DEFAULT_NAME,
    appLogo: config?.appLogo || DEFAULT_LOGO,
    loginBg: config?.loginBg || DEFAULT_LOGIN_BG,
    signupBg: config?.signupBg || DEFAULT_SIGNUP_BG,
  }), [config?.appName, config?.appLogo, config?.loginBg, config?.signupBg]);

  return {
    config: memoizedConfig,
    isLoading,
    updateConfig
  };
}
