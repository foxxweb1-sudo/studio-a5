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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { signInWithEmailAndPassword } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
  password: z.string().min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل."),
});

export default function Login() {
  const auth = useAuth();
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
        description: "جاري توجيهك...",
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
    <div className="relative flex items-center justify-center min-h-screen">
      <Image
        src="https://picsum.photos/seed/dunes/1920/1080"
        alt="خلفية صحراوية"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0"
        data-ai-hint="dunes"
        priority
      />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md mx-auto z-20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
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
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          className="pl-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading ? (
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="ms-2 h-4 w-4" />
                  )}
                تسجيل الدخول
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="underline">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            ليس لديك حساب؟{" "}
            <Link href="/signup" className="underline">
              إنشاء حساب
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
