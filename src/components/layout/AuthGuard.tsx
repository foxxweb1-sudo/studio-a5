"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Ban, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { signOut, deleteUser } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_EMAIL } from "@/lib/constants";
import SplashScreen from "./SplashScreen";

const publicRoutes = ["/login", "/signup", "/forgot-password", "/", "/blog"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isFinalizingDeletion, setIsFinalizingDeletion] = useState(false);
  const hasCheckedDeletion = useRef(false);

  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null,
  [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userDocRef);

  const deletionDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'deletionRequests', user.uid) : null,
  [user, firestore]);
  const { data: deletionRequest, isLoading: isDeletionLoading } = useDoc<any>(deletionDocRef);

  useEffect(() => {
    if (user && deletionRequest && !isDeletionLoading && !hasCheckedDeletion.current) {
      const requestedAtRaw = deletionRequest.requestedAt;
      const requestedAt = requestedAtRaw?.toDate ? requestedAtRaw.toDate() : (requestedAtRaw ? new Date(requestedAtRaw) : null);
      if (!requestedAt) return;
      const now = new Date();
      const diffMs = now.getTime() - requestedAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffMs < 60000) return;
      if (diffDays < 7) {
        const dRef = doc(firestore, 'deletionRequests', user.uid);
        hasCheckedDeletion.current = true; 
        deleteDoc(dRef).then(() => {
           toast({ title: "أهلاً بك مجدداً!", description: "لقد تم إلغاء طلب حذف حسابك تلقائياً." });
        });
      } else {
        hasCheckedDeletion.current = true;
        handleFinalDeletion();
      }
    }
  }, [user, deletionRequest, isDeletionLoading, firestore, toast]);

  const handleFinalDeletion = async () => {
    if (!user || !firestore) return;
    setIsFinalizingDeletion(true);
    try {
      await deleteUser(user);
      await deleteDoc(doc(firestore, 'deletionRequests', user.uid));
      await deleteDoc(doc(firestore, 'users', user.uid));
    } catch (e) {
      signOut(auth);
    } finally {
      setIsFinalizingDeletion(false);
    }
  };

  useEffect(() => {
    if (user && firestore && !deletionRequest) {
      const uRef = doc(firestore, 'users', user.uid);
      setDoc(uRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'مستخدم جديد',
        photoURL: user.photoURL || '',
        lastLogin: serverTimestamp(),
        isBlocked: userProfile?.isBlocked || false,
      }, { merge: true });
    }
  }, [user, firestore, deletionRequest, userProfile?.isBlocked]);

  if (isUserLoading || (user && isProfileLoading) || isFinalizingDeletion) {
    return <SplashScreen />;
  }

  const isSuperAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (user && userProfile?.isBlocked && !isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <Ban className="w-12 h-12 text-rose-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-black mb-4">تم حظرك 🚫</h1>
        <Button onClick={() => signOut(auth)} className="rounded-2xl h-12 px-8 font-bold border-white/20">تسجيل الخروج</Button>
      </div>
    );
  }

  return <>{children}</>;
}
