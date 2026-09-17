
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
import { useAuth, useFirestore } from "@/firebase";
import { useAppConfig } from "@/hooks/use-app-config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, User, Eye, EyeOff, Mail as MailIcon, Image as ImageIcon, UploadCloud, CheckCircle2, ArrowRight, Phone, Wallet } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  displayName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل."),
  email: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
  password: z.string().min(6, "يجب أن تكون كلمة المرور 6 أحرف على الأقل."),
  photoURL: z.string().url("يجب رفع صورة شخصية لإكمال التسجيل.").min(1, "الصورة الشخصية مطلوبة."),
  countryCode: z.string().min(1, "مطلوب"),
  phone: z.string().min(8, "رقم الهاتف إلزامي وغير صحيح."),
  paymentTiming: z.enum(['start', 'mid', 'end'], { required_error: "يرجى اختيار توقيت الدفع" }),
});

export default function SignUp() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
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
      countryCode: "20",
      phone: "",
      paymentTiming: 'start',
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
      // 1. التحقق الفوري من وجود مستند مساعد مسبق (Pre-registration)
      const assistantDocRef = doc(firestore, 'users', values.email.toLowerCase());
      const assistantSnap = await getDoc(assistantDocRef);
      const preExistingAssistant = assistantSnap.exists() ? assistantSnap.data() : null;

      // 2. إنشاء الحساب في Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const fullPhone = `+${values.countryCode}${values.phone.replace(/\D/g, '')}`;
      
      const finalDisplayName = preExistingAssistant ? preExistingAssistant.displayName : values.displayName;

      await updateProfile(userCredential.user, {
        displayName: finalDisplayName,
        photoURL: values.photoURL
      });

      // 3. تحديث أو إنشاء مستند المستخدم في Firestore
      if (preExistingAssistant) {
        // إذا كان مساعداً، نقوم بتحديث المستند الموجود وربطه بالـ Auth UID
        await updateDoc(assistantDocRef, {
            uid: userCredential.user.uid,
            lastLogin: serverTimestamp(),
            photoURL: values.photoURL,
            phone: fullPhone,
            updatedAt: serverTimestamp()
        });
      } else {
        // حساب معلم عادي
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: values.email,
            displayName: values.displayName,
            photoURL: values.photoURL,
            phone: fullPhone,
            paymentTiming: values.paymentTiming,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        });
      }

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً بك في نظام ${config.appName}، جاري توجيهك...`,
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "خطأ في التسجيل",
        description: error.code === 'auth/email-already-in-use' ? "هذا البريد مسجل مسبقاً." : "فشل إنشاء الحساب، يرجى مراجعة البيانات.",
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
        description: `مرحباً بك في نظام ${config.appName} عبر حساب جوجل.`,
      });
      router.push('/');
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
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
       <Image
        src={config.signupBg || 'https://picsum.photos/seed/lake/1920/1080'}
        alt="Signup Background"
        fill
        style={{ objectFit: 'cover' }}
        className="z-0 blur-[2px]"
        priority
      />
      <div className="absolute inset-0 bg-slate-950/70 z-10" />
      
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <Link href="/" className="text-white/60 hover:text-white font-black text-xs uppercase tracking-widest transition-all">الرئيسية</Link>
        <ModeToggle />
      </div>

      <Card className="w-full max-w-lg mx-auto z-20 bg-white/5 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem] border border-white/10 text-white overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-primary h-1.5 w-full opacity-50" />
        <CardHeader className="text-center pb-2 pt-10 space-y-4">
          <div className="w-24 h-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-2 border border-white/10 shadow-inner group hover:rotate-6 transition-all duration-500">
             <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-4xl font-black tracking-tighter">انضم للمنظومة</CardTitle>
            <CardDescription className="text-white/40 font-bold mt-2">
              أنشئ حسابك لتبدأ إدارة فصولك بذكاء
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-8 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60 px-1">الاسم الكامل</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              placeholder="أحمد محمد..."
                              className="pr-12 rounded-2xl h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 transition-all"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60 px-1">البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MailIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                              type="email"
                              placeholder="name@mail.com"
                              className="pr-12 rounded-2xl h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 font-mono transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
              </div>

              <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60 px-1">الرمز</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-2xl h-14 bg-white/5 border-white/10 font-mono">
                                <SelectValue placeholder="+20" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="font-mono rounded-xl">
                              <SelectItem value="20">+20 (مصر)</SelectItem>
                              <SelectItem value="966">+966</SelectItem>
                              <SelectItem value="971">+971</SelectItem>
                              <SelectItem value="965">+965</SelectItem>
                              <SelectItem value="212">+212</SelectItem>
                              <SelectItem value="213">+213</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60 px-1">رقم الهاتف (إلزامي)</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                               <Input placeholder="112147..." className="pr-12 rounded-2xl h-14 bg-white/5 border-white/10 text-white focus:bg-white/10 font-mono" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold" />
                        </FormItem>
                      )}
                    />
                  </div>

              <FormField
                control={form.control}
                name="paymentTiming"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60 px-1 flex items-center gap-2">
                        <Wallet className="h-3 w-3" /> موعد تحصيل الرسوم من الطلاب
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-2"
                      >
                        <div className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer", field.value === 'start' ? 'border-primary bg-primary/20' : 'border-white/10 bg-white/5 hover:bg-white/10')}>
                           <RadioGroupItem value="start" id="r-start" className="sr-only" />
                           <Label htmlFor="r-start" className="text-[10px] font-black cursor-pointer">أول 5 أيام</Label>
                        </div>
                        <div className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer", field.value === 'mid' ? 'border-primary bg-primary/20' : 'border-white/10 bg-white/5 hover:bg-white/10')}>
                           <RadioGroupItem value="mid" id="r-mid" className="sr-only" />
                           <Label htmlFor="r-mid" className="text-[10px] font-black cursor-pointer">منتصف الشهر</Label>
                        </div>
                        <div className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer", field.value === 'end' ? 'border-primary bg-primary/20' : 'border-white/10 bg-white/5 hover:bg-white/10')}>
                           <RadioGroupItem value="end" id="r-end" className="sr-only" />
                           <Label htmlFor="r-end" className="text-[10px] font-black cursor-pointer">آخر الشهر</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60 px-1">الصورة الشخصية (إلزامية)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            <Input
                                placeholder="ارفع صورتك الرسمية..."
                                className="pr-12 rounded-2xl h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 text-[10px] font-mono transition-all"
                                {...field}
                                readOnly
                            />
                        </div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <Button 
                            type="button" 
                            variant="outline" 
                            className={`h-14 rounded-2xl border-dashed border-white/10 bg-white/5 hover:bg-white hover:text-slate-950 gap-2 transition-all ${form.getValues('photoURL') ? 'border-emerald-500/50 text-emerald-400' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            {form.getValues('photoURL') ? 'تم الرفع' : 'رفع'}
                        </Button>
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
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest text-white/60 px-1">كلمة المرور</FormLabel>
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
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                إتمام التسجيل والدخول
              </Button>
            </form>
          </Form>
          
          <div className="mt-10 text-center text-xs font-bold border-t border-white/5 pt-8 flex flex-col gap-2">
            <span className="text-white/30">لديك حساب بالفعل؟</span>
            <Link href="/login" className="text-primary hover:text-white flex items-center justify-center gap-2 transition-all group">
              سجل دخولك من هنا
              <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
