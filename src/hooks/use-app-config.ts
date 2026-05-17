
'use client';

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { GlobalConfig } from "@/lib/definitions";
import { doc, setDoc } from "firebase/firestore";
import { useMemo } from 'react';

export const DEFAULT_LOGO = "https://www.appcreator24.com/srv/imgs/gen/3816551_ico.png?v=19";
export const DEFAULT_NAME = "الحضور";
export const DEFAULT_LOGIN_BG = "https://picsum.photos/seed/dunes/1920/1080";
export const DEFAULT_SIGNUP_BG = "https://picsum.photos/seed/lake/1920/1080";

export const DEFAULT_CONTACT_PHONE = "201121473424";
export const DEFAULT_CONTACT_EMAIL = "techstore.eg.app@gmail.com";
export const DEFAULT_WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbCCufAGOj9nfuY9o93L";
export const DEFAULT_FACEBOOK = "https://web.facebook.com/share/g/18Ky7vbzqF/";
export const DEFAULT_TWITTER = "https://x.com/tqnyt170296";
export const DEFAULT_TELEGRAM = "https://t.me/TqnyatStore";
export const DEFAULT_TECH_STORE = "https://techstore-servers.vercel.app/";

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
    contactPhone: config?.contactPhone || DEFAULT_CONTACT_PHONE,
    contactEmail: config?.contactEmail || DEFAULT_CONTACT_EMAIL,
    whatsappChannel: config?.whatsappChannel || DEFAULT_WHATSAPP_CHANNEL,
    facebook: config?.facebook || DEFAULT_FACEBOOK,
    twitter: config?.twitter || DEFAULT_TWITTER,
    telegram: config?.telegram || DEFAULT_TELEGRAM,
    techStoreUrl: config?.techStoreUrl || DEFAULT_TECH_STORE,
  }), [
    config?.appName, 
    config?.appLogo, 
    config?.loginBg, 
    config?.signupBg,
    config?.contactPhone,
    config?.contactEmail,
    config?.whatsappChannel,
    config?.facebook,
    config?.twitter,
    config?.telegram,
    config?.techStoreUrl
  ]);

  return {
    config: memoizedConfig,
    isLoading,
    updateConfig
  };
}
