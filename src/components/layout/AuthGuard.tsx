
"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";
import { doc, setDoc, serverTimestamp, updateDoc, deleteField, deleteDoc } from "firebase/firestore";
import { Ban, LogOut, Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { signOut, deleteUser } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [showSplash, setShowSplash] = useState(true);
  const [isFinalizingDeletion, setIsFinalizingDeletion] = useState(false);

  // مراقبة وثيقة المستخدم للتحقق من الحظر والحذف
  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null,
  [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isUserLoading) {
        setShowSplash(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isUserLoading]);

  // منطق إلغاء الحذف أو التنفيذ النهائي
  useEffect(() => {
    if (user && userProfile && firestore) {
      if (userProfile.deletionRequestedAt) {
        const requestedAt = userProfile.deletionRequestedAt.toDate();
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
          // إلغاء الحذف لأنه دخل قبل 7 أيام
          const uRef = doc(firestore, 'users', user.uid);
          updateDoc(uRef, { deletionRequestedAt: deleteField() });
          
          toast({
            title: "تم استعادة الحساب!",
            description: "يسعدنا عودتك. تم إلغاء طلب حذف الحساب لأنك سجلت دخولك قبل انتهاء الـ 7 أيام.",
          });
        } else {
          // مرّت 7 أيام أو أكثر، تنفيذ الحذف النهائي
          handleFinalDeletion();
        }
      }
    }
  }, [user, userProfile, firestore, toast]);

  const handleFinalDeletion = async () => {
    if (!user || !firestore) return;
    setIsFinalizingDeletion(true);
    try {
      // 1. مسح وثيقة المستخدم من الفايرستور أولاً
      const uRef = doc(firestore, 'users', user.uid);
      await deleteDoc(uRef);
      
      // 2. مسح المستخدم من Auth
      await deleteUser(user);
      
      toast({
        title: "تم مسح الحساب",
        description: "انتهت فترة الـ 7 أيام وتم مسح بياناتك نهائياً.",
      });
    } catch (error: any) {
      // إذا فشل بسبب انتهاء الجلسة، تسجيل خروج للمحاولة لاحقاً أو التوجيه لإعادة تسجيل الدخول
      signOut(auth);
    } finally {
      setIsFinalizingDeletion(false);
    }
  };

  // مزامنة بيانات المستخدم الأساسية
  useEffect(() => {
    if (user && firestore) {
      const uRef = doc(firestore, 'users', user.uid);
      setDoc(uRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'مستخدم جديد',
        photoURL: user.photoURL || '',
        lastLogin: serverTimestamp(),
      }, { merge: true });
    }
  }, [user, firestore]);

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

  if (isUserLoading || showSplash || (user && isProfileLoading) || isFinalizingDeletion) {
    return <SplashScreen />;
  }

  // شاشة الحذف النهائي (تظهر لحظياً أثناء المعالجة)
  if (isFinalizingDeletion) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
        <Trash2 className="w-16 h-16 text-rose-500 animate-bounce mb-4" />
        <h2 className="text-2xl font-black">جاري تنفيذ الحذف النهائي...</h2>
        <p className="text-muted-foreground">لقد مرت فترة الـ 7 أيام.</p>
      </div>
    );
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
