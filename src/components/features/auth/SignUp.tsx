"use client";

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
import { useAuth, initiateEmailSignUp } from "@/firebase";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/layout/ModeToggle";

const formSchema = z.object({
  email: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
  password: z.string().min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل."),
});

export default function SignUp() {
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    initiateEmailSignUp(auth, values.email, values.password);
     toast({
      title: "جاري إنشاء الحساب...",
      description: "سيتم توجيهك قريباً.",
    });
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
      <Card className="w-full max-w-md mx-auto z-20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            املأ النموذج أدناه لإنشاء حسابك
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
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <UserPlus className="ms-2 h-4 w-4" />
                إنشاء حساب
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="underline">
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
