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
import { UserPlus, Loader2, User, Eye, EyeOff, Mail as MailIcon } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const formSchema = z.object({
  displayName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل."),
  email: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
  password: z.string().min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل."),
});

export default function SignUp() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      await updateProfile(userCredential.user, {
        displayName: values.displayName
      });

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً بك يا ${values.displayName}، جاري توجيهك...`,
      });
    } catch (error: any) {
      let description;
       if (error.code === 'auth/email-already-in-use') {
        description = "هذا البريد الإلكتروني مسجل بالفعل.";
      } else if (error.code === 'auth/invalid-email') {
        description = "صيغة البريد الإلكتروني غير صالحة.";
      } else if (error.code === 'auth/weak-password') {
        description = "كلمة المرور ضعيفة جدًا. يجب أن تكون 6 أحرف على الأقل.";
      } else {
        description = error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      }
      toast({
        variant: "destructive",
        title: "فشل إنشاء الحساب",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
       <Image
        src="https://picsum.photos/seed/lake/1920/1080"
        alt="خلفية طبيعية"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0"
        data-ai-hint="lake"
        priority
      />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md mx-auto z-20 bg-card/80 backdrop-blur-sm shadow-2xl rounded-[2.5rem] border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-muted-foreground font-bold">
            ابدأ الآن بإدارة فصولك الدراسية بذكاء
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">الاسم الكامل</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <Input
                          placeholder="أدخل اسمك بالكامل"
                          className="pr-10 rounded-xl h-12"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="pr-10 rounded-xl h-12"
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
                    <FormLabel className="font-bold">كلمة المرور</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          className="pl-10 rounded-xl h-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2 text-lg shadow-lg shadow-primary/30" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <UserPlus className="h-5 w-5" />
                )}
                إنشاء الحساب
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm font-medium">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
