'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  ExternalLink, 
  Send,
  MessageSquare,
  LifeBuoy,
  Phone,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useAppConfig } from '@/hooks/use-app-config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const contactFormSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب.'),
  email: z.string().email('البريد الإلكتروني غير صحيح.').optional().or(z.string().length(0)),
  countryCode: z.string().min(1, 'مطلوب'),
  whatsapp: z.string().min(8, 'رقم الواتساب إلزامي وغير صحيح.'),
  message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل.'),
});

export default function ContactPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { config } = useAppConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      countryCode: '20',
      whatsapp: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    setIsSubmitting(true);
    try {
      const fullWhatsapp = `+${values.countryCode}${values.whatsapp.replace(/\D/g, '')}`;
      
      await addDoc(collection(firestore, 'contactMessages'), {
        name: values.name,
        email: values.email || 'غير متوفر',
        whatsapp: fullWhatsapp,
        message: values.message,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: 'تم إرسال رسالتك',
        description: 'شكراً لتواصلك معنا، سنرد عليك في أقرب وقت عبر الواتساب.',
      });
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12 px-4">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>تواصل معنا</PageHeaderTitle>
          <PageHeaderDescription>نحن هنا لمساعدتك والإجابة على استفساراتك.</PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-0 shadow-lg rounded-[2rem] bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-xl">معلومات التواصل</h3>
              <p className="text-sm text-muted-foreground text-right">يسعدنا تلقي اقتراحاتكم عبر القنوات التالية:</p>
            </div>
            
            <div className="space-y-3">
               <Button asChild variant="outline" className="w-full justify-start h-14 rounded-2xl gap-3 border-emerald-500/20 hover:bg-emerald-500/5">
                <a href={`https://wa.me/${config.contactPhone}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5 text-emerald-600" />
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold">واتساب فريق TECH</span>
                        <span className="text-[10px] text-muted-foreground text-left font-mono">{config.contactPhone}+</span>
                    </div>
                </a>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-14 rounded-2xl gap-3 border-blue-500/20 hover:bg-blue-500/5">
                <a href={config.supportUrl} target="_blank" rel="noopener noreferrer">
                    <LifeBuoy className="h-5 w-5 text-blue-600" />
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold">الدعم الفني المباشر</span>
                        <span className="text-[10px] text-muted-foreground">فتح تذكرة دعم جديدة</span>
                    </div>
                </a>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-14 rounded-2xl gap-3 border-primary/20 hover:bg-primary/5">
                <a href={`mailto:${config.contactEmail}`}>
                    <Mail className="h-5 w-5 text-primary" />
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold">البريد الإلكتروني</span>
                        <span className="text-[10px] text-muted-foreground truncate w-full max-w-[150px]">{config.contactEmail}</span>
                    </div>
                </a>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-14 rounded-2xl gap-3 border-amber-500/20 hover:bg-amber-500/5">
                <a href={config.techStoreUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5 text-amber-600" />
                    <div className="flex flex-col items-start text-right">
                        <span className="text-xs font-bold">متجر التطبيقات</span>
                        <span className="text-[10px] text-muted-foreground">زيارة TECH STORE</span>
                    </div>
                </a>
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="border-0 shadow-lg rounded-[2rem] bg-white dark:bg-slate-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-bold text-right w-full">أرسل لنا رسالة مباشرة</h3>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right block">الاسم</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل اسمك" className="rounded-xl h-12 text-right" {...field} />
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
                          <FormLabel className="text-right block">الرمز</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-12 bg-white font-mono">
                                <SelectValue placeholder="+20" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="font-mono">
                              <SelectItem value="20">+20 (مصر)</SelectItem>
                              <SelectItem value="966">+966 (السعودية)</SelectItem>
                              <SelectItem value="971">+971 (الإمارات)</SelectItem>
                              <SelectItem value="965">+965 (الكويت)</SelectItem>
                              <SelectItem value="212">+212 (المغرب)</SelectItem>
                              <SelectItem value="213">+213 (الجزائر)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-right block font-bold text-emerald-600">رقم الواتساب (إلزامي)</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                               <Input placeholder="112147..." className="rounded-xl h-12 pr-10 text-right font-mono" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right block">البريد الإلكتروني (اختياري)</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" className="rounded-xl h-12 text-right font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right block">الرسالة</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="كيف يمكننا مساعدتك؟" 
                            className="rounded-xl min-h-[150px] resize-none text-right" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold gap-2 bg-primary text-white">
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                    إرسال الرسالة
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
