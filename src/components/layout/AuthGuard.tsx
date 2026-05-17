
"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Ban, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";

const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);

  // مراقبة وثيقة المستخدم للتحقق من الحظر
  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null,
  [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isUserLoading) {
        setShowSplash(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isUserLoading]);

  // مزامنة بيانات المستخدم عند تسجيل الدخول
  useEffect(() => {
    if (user && firestore) {
      const uRef = doc(firestore, 'users', user.uid);
      setDoc(uRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'مستخدم جديد',
        photoURL: user.photoURL || '',
        lastLogin: serverTimestamp(),
        isBlocked: userProfile?.isBlocked ?? false // الحفاظ على حالة الحظر إذا وجدت
      }, { merge: true });
    }
  }, [user, firestore, userProfile?.isBlocked]);

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

  if (isUserLoading || showSplash || (user && isProfileLoading)) {
    return <SplashScreen />;
  }

  // شاشة الحظر
  if (user && userProfile?.isBlocked) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Ban className="w-12 h-12 text-rose-500" />
        </div>
        <h1 className="text-4xl font-black mb-4">تم حظرك 🚫</h1>
        <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
          عذراً، لقد تم منع حسابك من الوصول إلى النظام من قبل الإدارة. يرجى التواصل مع الدعم الفني إذا كنت تعتقد أن هذا خطأ.
        </p>
        <Button 
          variant="outline" 
          onClick={() => signOut(auth)}
          className="rounded-2xl h-12 px-8 font-bold border-white/20 hover:bg-white/10"
        >
          <LogOut className="ms-2 h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    );
  }

  if (!user && publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
}
