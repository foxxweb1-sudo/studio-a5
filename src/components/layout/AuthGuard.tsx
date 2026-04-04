
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
    // Show splash for at least 2.5 seconds to ensure branding is seen
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

  // Show Splash Screen during initial load
  if (isUserLoading || showSplash) {
    return <SplashScreen />;
  }

  // If user is not logged in and on a public page, show the public page
  if (!user && publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // If user is logged in, show the protected page
  if (user) {
    return <>{children}</>;
  }

  return null;
}
