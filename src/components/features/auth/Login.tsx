
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { useAppConfig } from "@/hooks/use-app-config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, Eye, EyeOff, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
  password: z.string().min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل."),
});

export default function Login() {
  const auth = useAuth();
  const router = useRouter();
  const { config } = useAppConfig();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك مجدداً في نظام الحضور الذكي.",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      client_id: '24940764496-i6sn5lurj8q2pt4bsbaro5r1uqboovb4.apps.googleusercontent.com'
    });

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في نظام الحضور الذكي عبر حساب جوجل.",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول بجوجل",
        description: "تم إلغاء العملية أو حدث خطأ في الاتصال.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
      <Image
        src={config.loginBg}
        alt="Login Background"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0 blur-[2px]"
        priority
      />
      <div className="absolute inset-0 bg-slate-950/60 z-10" />
      
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <Link href="/" className="text-white/60 hover:text-white font-black text-xs uppercase tracking-widest transition-all">العودة للرئيسية</Link>
        <ModeToggle />
      </div>

      <Card className="w-full max-w-md mx-auto z-20 bg-white/5 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem] border border-white/10 text-white overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="bg-primary h-1.5 w-full opacity-50" />
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-2 border border-white/20 shadow-inner group hover:scale-110 transition-transform duration-500">
             <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tighter">دخول المعلمين</CardTitle>
            <CardDescription className="text-white/40 font-bold">
              لوحة التحكم الذكية لـ {config.appName}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-8 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60 px-1">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          className="pr-12 rounded-2xl h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 font-mono transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center px-1">
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60">كلمة المرور</FormLabel>
                        <Link href="/forgot-password" size="sm" className="text-[10px] text-white/30 hover:text-white transition-colors">
                            نسيت الكلمة؟
                        </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-12 rounded-2xl h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 transition-all"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-black gap-3 text-lg shadow-2xl shadow-primary/20 bg-primary hover:bg-indigo-600 transition-all active:scale-[0.98] mt-4" disabled={isLoading}>
                 {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <LogIn className="h-6 w-6" />
                  )}
                دخول للمنصة
              </Button>
            </form>
          </Form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-transparent px-4 text-white/30">أو عبر</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-16 rounded-[1.5rem] font-bold gap-3 border-white/10 bg-white/5 hover:bg-white hover:text-slate-900 transition-all active:scale-[0.98]"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    />
                </svg>
            )}
            حساب جوجل الموحد
          </Button>
          
          <div className="mt-10 text-center text-xs font-bold border-t border-white/5 pt-8 flex flex-col gap-2">
            <span className="text-white/30">ليس لديك حساب معلم حتى الآن؟</span>
            <Link href="/signup" className="text-primary hover:text-white flex items-center justify-center gap-2 transition-all group">
              ابدأ الآن مجاناً 
              <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
