"use client";

import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

const publicRoutes = ["/login", "/signup"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      if (user && isPublicRoute) {
        // If user is logged in and tries to access a public route, redirect to home
        router.push("/");
      } else if (!user && !isPublicRoute) {
        // If user is not logged in and tries to access a protected route, redirect to login
        router.push("/login");
      }
    }
  }, [user, isUserLoading, router, pathname]);

  // While loading, show a loading screen or skeleton
  if (isUserLoading) {
    return (
       <div className="flex flex-col space-y-3 justify-center items-center h-screen">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
       </div>
    );
  }

  // If user is not logged in and on a public page, show the public page
  if (!user && publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // If user is logged in, show the protected page
  if (user) {
    return <>{children}</>;
  }

  // Fallback for edge cases, though useEffect should handle redirection.
  return null;
}
