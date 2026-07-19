
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
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { signInWithEmailAndPassword } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
  password: z.string().min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل."),
});

export default function Login() {
  const auth = useAuth();
  const { config } = useAppConfig();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
    } catch (error: any) {
      let description;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      } else if (error.code === 'auth/invalid-email') {
        description = "صيغة البريد الإلكتروني غير صالحة.";
      } else {
        description = error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      }
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4">
      <Image
        src={config.loginBg}
        alt="Login Background"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0"
        data-ai-hint="background"
        priority
      />
      <div className="absolute inset-0 bg-black/70 z-10" />
      
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <Link href="/" className="text-white/60 hover:text-white font-bold text-sm transition-colors">العودة للرئيسية</Link>
        <ModeToggle />
      </div>

      <Card className="w-full max-w-md mx-auto z-20 bg-white/10 backdrop-blur-xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] rounded-[2.5rem] border border-white/20 text-white overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-primary h-2 w-full" />
        <CardHeader className="text-center space-y-2">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
             <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">تسجيل الدخول</CardTitle>
          <CardDescription className="text-white/60 font-bold">
            أهلاً بك في لوحة تحكم {config.appName}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-white/80">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="pr-10 rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 font-mono"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center px-1">
                        <FormLabel className="font-bold text-white/80">كلمة المرور</FormLabel>
                        <Link href="/forgot-password" size="sm" className="text-[10px] text-white/40 hover:text-white transition-colors">
                            نسيت كلمة المرور؟
                        </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-14 rounded-2xl font-black gap-3 text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-indigo-700 transition-all mt-4" disabled={isLoading}>
                 {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <LogIn className="h-6 w-6" />
                  )}
                دخول للمنصة
              </Button>
            </form>
          </Form>
          
          <div className="mt-8 text-center text-sm font-bold border-t border-white/5 pt-6">
            ليس لديك حساب معلم؟{" "}
            <Link href="/signup" className="text-primary hover:text-indigo-400 underline-offset-4 hover:underline transition-all">
              ابدأ الآن مجاناً
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
