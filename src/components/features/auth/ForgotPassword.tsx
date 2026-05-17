
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
import { Mail, Loader2 } from "lucide-react";
import Image from "next/image";
import { sendPasswordResetEmail } from "firebase/auth";
import { ModeToggle } from "@/components/layout/ModeToggle";

const formSchema = z.object({
  email: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
});

export default function ForgotPassword() {
  const auth = useAuth();
  const { config } = useAppConfig();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsSent(true);
      toast({
        title: "تم إرسال الرابط",
        description: "تفقد بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <Image
        src={config.loginBg}
        alt="Forgot Password Background"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0"
        data-ai-hint="background"
        priority
      />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md mx-auto z-20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة مرورك لتطبيق {config.appName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="text-center">
              <p className="text-foreground mb-4">
                تم إرسال رابط إعادة التعيين بنجاح. يرجى التحقق من صندوق الوارد الخاص بك.
              </p>
              <Button asChild>
                <Link href="/login">العودة لتسجيل الدخول</Link>
              </Button>
            </div>
          ) : (
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="ms-2 h-4 w-4" />
                  )}
                  إرسال الرابط
                </Button>
              </form>
            </Form>
          )}
          {!isSent && (
             <div className="mt-4 text-center text-sm">
                تذكرت كلمة المرور؟{" "}
                <Link href="/login" className="underline">
                    تسجيل الدخول
                </Link>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
