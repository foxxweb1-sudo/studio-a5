
"use client";

import { useState, useRef } from "react";
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
import { UserPlus, Loader2, User, Eye, EyeOff, Mail as MailIcon, Image as ImageIcon, UploadCloud, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const formSchema = z.object({
  displayName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل."),
  email: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
  password: z.string().min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل."),
  photoURL: z.string().url("يجب رفع صورة شخصية أو وضع رابط صالح.").min(1, "الصورة الشخصية إجبارية."),
});

export default function SignUp() {
  const auth = useAuth();
  const { config } = useAppConfig();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      photoURL: "",
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('image', file);

    try {
        const res = await fetch('https://api.imgbb.com/1/upload?key=d015dd34e005b5dd56d68d2fe147c267', {
            method: 'POST',
            body
        });
        const result = await res.json();
        if (result.success) {
            form.setValue('photoURL', result.data.url, { shouldValidate: true });
            toast({ title: "تم رفع الصورة بنجاح" });
        } else {
            toast({ variant: "destructive", title: "فشل الرفع" });
        }
    } catch (err) {
        toast({ variant: "destructive", title: "خطأ في الاتصال بالخادم" });
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      await updateProfile(userCredential.user, {
        displayName: values.displayName,
        photoURL: values.photoURL
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

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "تم التسجيل بنجاح",
        description: "مرحباً بك في المنظومة عبر حساب جوجل.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل التسجيل بجوجل",
        description: "حدث خطأ أو تم إلغاء العملية.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4">
       <Image
        src={config.signupBg}
        alt="Signup Background"
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

      <Card className="w-full max-w-lg mx-auto z-20 bg-white/10 backdrop-blur-xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] rounded-[2.5rem] border border-white/20 text-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-primary h-2 w-full" />
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
             <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">إنشاء حساب معلم</CardTitle>
          <CardDescription className="text-white/60 font-bold mt-2">
            انضم الآن لأكثر من 500 معلم يديرون فصولهم بذكاء
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-white/80">الاسم الكامل</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="أحمد محمد..."
                              className="pr-10 rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10"
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
                        <FormLabel className="font-bold text-white/80">البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              className="pr-10 rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 font-mono"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-white/80">الصورة الشخصية (إلزامية)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                                placeholder="رابط الصورة أو ارفع ملفاً..."
                                className="pr-10 rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 text-xs font-mono"
                                {...field}
                                readOnly
                            />
                        </div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="h-12 rounded-xl border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-white gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            {form.getValues('photoURL') ? 'تم الرفع' : 'رفع'}
                        </Button>
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
                    <FormLabel className="font-bold text-white/80">كلمة المرور</FormLabel>
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
                    <CheckCircle2 className="h-6 w-6" />
                )}
                إتمام التسجيل والدخول
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/40 font-bold">أو الانضمام سريعاً عبر</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl font-bold gap-3 border-white/20 bg-white/5 hover:bg-white hover:text-slate-900 transition-all"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            حساب جوجل (Google)
          </Button>
          
          <div className="mt-8 text-center text-sm font-bold border-t border-white/5 pt-6">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary hover:text-indigo-400 underline-offset-4 hover:underline transition-all">
              سجل دخولك من هنا
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
