'use client';

import { useParams } from 'next/navigation';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CalendarCheck, FileText, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GradeDashboardPage() {
  const params = useParams();
  const gradeName = decodeURIComponent(params.gradeName as string);
  const stageName = params.stageName as string;

  const dashboardItems = [
    {
      name: 'تسجيل الحضور اليومي',
      icon: CalendarCheck,
      href: '/attendance',
      description: 'تسجيل حضور الطلاب لهذا اليوم.',
    },
    {
      name: 'إدارة الطلاب',
      icon: Users,
      href: `/students?grade=${encodeURIComponent(gradeName)}`,
      description: 'إضافة وتعديل بيانات الطلاب.',
    },
    {
      name: 'التقارير',
      icon: FileText,
      href: '/reports',
      description: 'عرض تقارير الحضور والغياب.',
    },
    {
      name: 'المدفوعات',
      icon: CreditCard,
      href: `/payments?grade=${encodeURIComponent(gradeName)}`,
      description: 'متابعة المدفوعات والرسوم المستحقة.',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>لوحة التحكم: {gradeName}</PageHeaderTitle>
          <PageHeaderDescription>
            اختر أحد الخيارات لإدارة الحضور والطلاب.
          </PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" asChild>
          <Link href={`/stage/${stageName}`}>
            <ArrowLeft className="ms-2 h-4 w-4" />
            العودة لاختيار الصف
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardItems.map((item) => (
          <Link href={item.href} key={item.name}>
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-4 text-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
                  <item.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
