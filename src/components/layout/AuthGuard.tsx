
"use client";

import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";

const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isUserLoading) {
        setShowSplash(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isUserLoading]);

  useEffect(() => {
    if (!isUserLoading && !showSplash) {
      const isPublicRoute = publicRoutes.includes(pathname);
      if (user && isPublicRoute) {
        router.push("/");
      } else if (!user && !isPublicRoute) {
        router.push("/login");
      }
    }
  }, [user, isUserLoading, showSplash, router, pathname]);

  if (isUserLoading || showSplash) {
    return <SplashScreen />;
  }

  if (!user && publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
}
