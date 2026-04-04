
'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>سياسة الخصوصية</PageHeaderTitle>
          <PageHeaderDescription>كيف نقوم بحماية بياناتك وخصوصيتك.</PageHeaderDescription>
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

      <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-8 space-y-6 text-right leading-relaxed">
          <div className="flex items-center gap-3 text-primary mb-4">
            <ShieldCheck className="h-6 w-6" />
            <h2 className="text-xl font-bold">التزامنا بالخصوصية</h2>
          </div>
          <p>
            نحن في <strong>فريق TECH</strong> نضع خصوصية بياناتك في مقدمة أولوياتنا. تطبيق "الحضور" مصمم ليكون وسيلة آمنة وفعالة لإدارة شؤون طلابك دون القلق بشأن تسريب البيانات.
          </p>
          <h3 className="font-bold text-lg">1. البيانات التي نجمعها</h3>
          <p>
            نقوم بجمع البيانات الضرورية فقط لعمل التطبيق، مثل أسماء الطلاب، الصفوف الدراسية، أرقام الهواتف المسجلة، وسجلات الحضور والمدفوعات. هذه البيانات مخزنة بشكل آمن عبر خدمات Firebase المشفرة.
          </p>
          <h3 className="font-bold text-lg">2. كيف نستخدم بياناتك</h3>
          <p>
            تُستخدم البيانات فقط لغرض العرض والتحليل داخل حسابك الخاص. لا يتم مشاركة هذه البيانات مع أي أطراف خارجية أو استخدامها لأغراض إعلانية.
          </p>
          <h3 className="font-bold text-lg">3. أمن البيانات</h3>
          <p>
            نستخدم تقنيات تشفير متقدمة لحماية الاتصال بين التطبيق وقواعد البيانات. كما نضمن أن كل مستخدم لا يمكنه الوصول إلا للبيانات الخاصة بطلابه فقط.
          </p>
          <p className="text-muted-foreground text-sm pt-4 border-t border-dashed">
            آخر تحديث: أبريل 2026
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
