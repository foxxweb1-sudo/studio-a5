
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
  MessageSquare
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

const contactFormSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب.'),
  email: z.string().email('البريد الإلكتروني غير صحيح.'),
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
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'contactMessages'), {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'تم إرسال رسالتك',
        description: 'شكراً لتواصلك معنا، سنرد عليك في أقرب وقت.',
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" className="rounded-xl h-12 text-right font-mono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
