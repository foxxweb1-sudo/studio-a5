
"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import SplashScreen from "./SplashScreen";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Ban, LogOut, Trash2 } from "lucide-react";
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
  const hasCheckedDeletion = useRef(false);

  // مراقبة وثيقة المستخدم للتحقق من الحظر
  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null,
  [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userDocRef);

  // مراقبة وثيقة طلب الحذف المستقلة
  const deletionDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'deletionRequests', user.uid) : null,
  [user, firestore]);
  const { data: deletionRequest, isLoading: isDeletionLoading } = useDoc<any>(deletionDocRef);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isUserLoading) {
        setShowSplash(false);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isUserLoading]);

  // منطق إلغاء الحذف (عند تسجيل الدخول الجديد) أو التنفيذ النهائي
  useEffect(() => {
    if (user && deletionRequest && !isDeletionLoading && !hasCheckedDeletion.current) {
      const requestedAt = deletionRequest.requestedAt?.toDate ? deletionRequest.requestedAt.toDate() : new Date(deletionRequest.requestedAt);
      if (!requestedAt) return;

      const now = new Date();
      const diffMs = now.getTime() - requestedAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays < 7) {
        // المستخدم دخل قبل 7 أيام -> إلغاء طلب الحذف فوراً
        const dRef = doc(firestore, 'deletionRequests', user.uid);
        hasCheckedDeletion.current = true; // منع التكرار
        
        deleteDoc(dRef).then(() => {
           toast({
            title: "تم استعادة الحساب بنجاح!",
            description: "يسعدنا عودتك. تم إلغاء طلب الحذف المجدول وإيقاف الجدول الزمني.",
          });
        }).catch(() => {
          hasCheckedDeletion.current = false;
        });
      } else {
        // مرّت 7 أيام أو أكثر -> تنفيذ الحذف النهائي
        hasCheckedDeletion.current = true;
        handleFinalDeletion();
      }
    }
  }, [user, deletionRequest, isDeletionLoading, firestore, toast]);

  const handleFinalDeletion = async () => {
    if (!user || !firestore) return;
    setIsFinalizingDeletion(true);
    try {
      // 1. مسح وثيقة طلب الحذف ووثيقة المستخدم من Firestore (دائماً تنجح)
      await deleteDoc(doc(firestore, 'deletionRequests', user.uid));
      await deleteDoc(doc(firestore, 'users', user.uid));
      
      // 2. محاولة مسح المستخدم من Firebase Auth (تحتاج دخول حديث)
      try {
        await deleteUser(user);
        toast({
          title: "تم مسح الحساب نهائياً",
          description: "انتهت فترة السماح وتم مسح كافة بياناتك من النظام.",
        });
      } catch (authError: any) {
        if (authError.code === 'auth/requires-recent-login') {
            toast({
                variant: "destructive",
                title: "تأكيد أمني مطلوب",
                description: "يرجى تسجيل الدخول مرة أخرى ثم الذهاب للإعدادات لحذف بريدك نهائياً من سجلات جوجل.",
            });
            await signOut(auth);
        } else {
            throw authError;
        }
      }
    } catch (error: any) {
      console.error("Final deletion failed:", error);
      signOut(auth);
    } finally {
      setIsFinalizingDeletion(false);
    }
  };

  // مزامنة بيانات المستخدم الأساسية عند كل دخول
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
      const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/p/');
      
      if (user && isPublicRoute && !pathname.startsWith('/p/')) {
        router.push("/");
      } else if (!user && !isPublicRoute) {
        router.push("/login");
      }
    }
  }, [user, isUserLoading, showSplash, router, pathname]);

  if (isUserLoading || showSplash || (user && isProfileLoading) || isFinalizingDeletion) {
    return <SplashScreen />;
  }

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

  const isParentPortal = pathname.startsWith('/p/');

  if (!user && (publicRoutes.includes(pathname) || isParentPortal)) {
    return <>{children}</>;
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
}
