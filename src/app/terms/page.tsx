
'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>اتفاقية الاستخدام</PageHeaderTitle>
          <PageHeaderDescription>الشروط والأحكام الخاصة باستخدام تطبيق الحضور.</PageHeaderDescription>
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
            <FileText className="h-6 w-6" />
            <h2 className="text-xl font-bold">شروط الخدمة</h2>
          </div>
          <p>
            باستخدامك لتطبيق الحضور، فإنك توافق على الالتزام بالشروط والأحكام التالية:
          </p>
          <h3 className="font-bold text-lg">1. حساب المستخدم</h3>
          <p>
            أنت مسؤول مسؤولية كاملة عن الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك، وعن جميع الأنشطة التي تحدث تحت حسابك.
          </p>
          <h3 className="font-bold text-lg">2. الاستخدام المشروع</h3>
          <p>
            يجب استخدام التطبيق في الأغراض التعليمية والإدارية المخصصة له فقط. يمنع استخدام التطبيق لإرسال رسائل سبام أو محتوى غير لائق.
          </p>
          <h3 className="font-bold text-lg">3. التحديثات والتعديلات</h3>
          <p>
            يحتفظ فريق TECH بالحق في تحديث التطبيق أو تغيير ميزاته في أي وقت لتحسين تجربة المستخدم. كما يحق لنا تعديل هذه الشروط مع إشعار المستخدمين بذلك.
          </p>
          <h3 className="font-bold text-lg">4. إخلاء المسؤولية</h3>
          <p>
            نحن نسعى جاهدين لضمان عمل التطبيق بنسبة 100%، ولكننا لا نتحمل مسؤولية أي فقدان للبيانات ناتج عن سوء استخدام الجهاز أو انقطاع خدمات الإنترنت.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
