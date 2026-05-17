
'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CalendarCheck, FileText, CreditCard, ArrowLeft, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GradeDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const gradeName = decodeURIComponent(params.gradeName as string);
  const stageName = params.stageName as string;

  const dashboardItems = [
    {
      name: 'تسجيل الحضور اليومي',
      icon: CalendarCheck,
      href: '/attendance',
      description: 'تسجيل حضور الطلاب لهذا اليوم.',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      name: 'إدارة الطلاب',
      icon: Users,
      href: `/students?grade=${encodeURIComponent(gradeName)}`,
      description: 'إضافة وتعديل بيانات الطلاب النشطين.',
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      name: 'الأرشيف',
      icon: Archive,
      href: `/archive?grade=${encodeURIComponent(gradeName)}`,
      description: 'عرض واستعادة الطلاب غير النشطين.',
      color: 'bg-rose-500/10 text-rose-500',
    },
    {
      name: 'التقارير',
      icon: FileText,
      href: '/reports',
      description: 'عرض تقارير الحضور والغياب.',
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      name: 'المدفوعات',
      icon: CreditCard,
      href: `/payments?grade=${encodeURIComponent(gradeName)}`,
      description: 'متابعة المدفوعات والرسوم المستحقة.',
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>لوحة التحكم: {gradeName}</PageHeaderTitle>
          <PageHeaderDescription>
            اختر أحد الخيارات لإدارة الحضور والطلاب لهذا الصف.
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          العودة
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {dashboardItems.map((item) => (
          <button 
            key={item.name} 
            onClick={() => router.push(item.href)}
            className="group text-right"
          >
            <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full rounded-[2rem] border-0 bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center p-8 gap-4 text-center">
                <div className={`flex items-center justify-center w-20 h-20 rounded-3xl ${item.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <item.icon className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
