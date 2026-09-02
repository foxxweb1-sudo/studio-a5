
'use client';

import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  KeyRound, 
  Save, 
  Copy, 
  User as UserIcon, 
  LogOut, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Fingerprint, 
  BadgeCheck, 
  ShieldCheck, 
  CheckCircle2, 
  UploadCloud,
  Mail,
  Link as LinkIcon,
  Unlink,
  Lock,
  Phone
} from 'lucide-react';
import { 
  updateProfile, 
  sendPasswordResetEmail, 
  signOut, 
  linkWithCredential, 
  EmailAuthProvider, 
  GoogleAuthProvider, 
  linkWithPopup 
} from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useRef, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection, getDocs, updateDoc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'الاسم مطلوب.'),
  photoURL: z.string().url('الرجاء إدخل رابط صالح (يبدأ بـ http).').optional().or(z.string().length(0)),
  phone: z.string().min(8, 'رقم الهاتف غير صحيح.'),
  countryCode: z.string().min(1, 'مطلوب'),
});

const DELETION_REASONS = [
  "أواجه مشاكل تقنية في التطبيق",
  "التطبيق لا يلبي احتياجاتي التعليمية",
  "أريد إنشاء حساب جديد ببيانات مختلفة",
  "لدي مخاوف تتعلق بالخصوصية والأمان",
  "أسباب أخرى لم تذكر"
];

export default function AccountManagement() {
  const { user, isUserLoading, reloadUser } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(DELETION_REASONS[0]);
  const [copied, setCopied] = useState(false);
  const [showLinkPasswordDialog, setShowLinkPasswordDialog] = useState(false);
  const [linkPassword, setLinkPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile } = useDoc<any>(userRef);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      photoURL: '',
      phone: '',
      countryCode: '20'
    }
  });

  useEffect(() => {
    if (userProfile) {
        const fullPhone = userProfile.phone || '';
        let code = '20';
        let number = fullPhone;
        
        if (fullPhone.startsWith('+')) {
            if (fullPhone.startsWith('+20')) { code = '20'; number = fullPhone.replace('+20', ''); }
            else if (fullPhone.startsWith('+966')) { code = '966'; number = fullPhone.replace('+966', ''); }
            else if (fullPhone.startsWith('+971')) { code = '971'; number = fullPhone.replace('+971', ''); }
            else if (fullPhone.startsWith('+965')) { code = '965'; number = fullPhone.replace('+965', ''); }
            else if (fullPhone.startsWith('+212')) { code = '212'; number = fullPhone.replace('+212', ''); }
            else if (fullPhone.startsWith('+213')) { code = '213'; number = fullPhone.replace('+213', ''); }
        }

        form.reset({
            displayName: user?.displayName || userProfile.displayName || '',
            photoURL: user?.photoURL || userProfile.photoURL || '',
            phone: number,
            countryCode: code
        });
    }
  }, [userProfile, user, form]);

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user || !firestore) return;
    setIsSaving(true);
    try {
      const fullPhone = `+${values.countryCode}${values.phone.replace(/\D/g, '')}`;
      
      // تحديث Auth Profile
      await updateProfile(user, {
        displayName: values.displayName,
        photoURL: values.photoURL || null,
      });

      // تحديث Firestore Doc
      await updateDoc(doc(firestore, 'users', user.uid), {
        displayName: values.displayName,
        photoURL: values.photoURL || '',
        phone: fullPhone,
        updatedAt: serverTimestamp()
      });

      await reloadUser();
      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث معلومات ملفك الشخصي ورقم هاتفك.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل تحديث البيانات.',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSignOut = () => signOut(auth);

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pb-20">
      <div className="md:col-span-1 flex flex-col items-center gap-6">
         <div className="relative group">
            <Avatar className="h-40 w-40 border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105 duration-300">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} className="object-cover" />
                <AvatarFallback className="text-5xl bg-primary/10 text-primary font-bold">
                    {user?.displayName?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
            </Avatar>
            {userProfile?.isVerified && (
                <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-900 rounded-full p-0 shadow-lg border-2 border-slate-50 dark:border-slate-800 animate-in zoom-in duration-700">
                    <BadgeCheck className="h-10 w-10 fill-blue-500 text-white" />
                </div>
            )}
        </div>
        <div className="text-center space-y-1">
            <h2 className="text-2xl font-black tracking-tight">{user?.displayName || 'مستخدم جديد'}</h2>
            <div className="flex flex-col gap-1 items-center">
                <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 rounded-full font-bold px-4 py-1 text-xs mt-2">
                    {userProfile?.phone || 'رقم الهاتف غير مسجل'}
                </Badge>
            </div>
            
            <div className="mt-8 w-full max-w-[280px]">
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <Fingerprint className="h-5 w-5 text-primary" />
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Digital ID</span>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-white/50 uppercase block">Global UID</label>
                        <code className="text-xs font-mono font-bold tracking-tighter truncate block text-primary/90 select-all">
                            {user?.uid}
                        </code>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="md:col-span-2 space-y-8">
        <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              تعديل البيانات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-sm">الأسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسمك هنا" className="h-12 rounded-xl bg-muted/50 border-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                    <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                            <FormItem className="col-span-1">
                                <FormLabel className="font-bold text-sm">الرمز</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0 font-mono">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="font-mono rounded-xl">
                                        <SelectItem value="20">+20</SelectItem>
                                        <SelectItem value="966">+966</SelectItem>
                                        <SelectItem value="971">+971</SelectItem>
                                        <SelectItem value="965">+965</SelectItem>
                                        <SelectItem value="212">+212</SelectItem>
                                        <SelectItem value="213">+213</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel className="font-bold text-sm">رقم الهاتف (الواتساب)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                        <Input placeholder="112147..." className="pr-10 h-12 rounded-xl bg-muted/50 border-0 font-mono" {...field} />
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
                      <FormLabel className="font-bold text-sm">رابط الصورة الشخصية</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="رابط الصورة..." className="h-12 rounded-xl bg-muted/50 border-0 flex-grow text-xs font-mono" {...field} />
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                          <Button type="button" variant="outline" className="h-12 rounded-xl border-dashed gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            رفع
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  حفظ البيانات والاعتماد
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border-t-4 border-t-rose-500/20">
          <CardContent className="pt-6 space-y-4">
            <Button variant="outline" onClick={handleSignOut} className="w-full h-12 rounded-xl font-bold gap-2">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج من الحساب
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
