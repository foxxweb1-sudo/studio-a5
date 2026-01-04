'use client';

import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, School, Building } from 'lucide-react';
import Link from 'next/link';

const stages = [
  {
    name: 'المرحلة الابتدائية',
    icon: School,
    slug: 'primary',
  },
  {
    name: 'المرحلة الإعدادية',
    icon: Building,
    slug: 'preparatory',
  },
  {
    name: 'المرحلة الثانوية',
    icon: GraduationCap,
    slug: 'secondary',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader>
        <PageHeaderTitle>اختر المرحلة الدراسية</PageHeaderTitle>
        <PageHeaderDescription>
          حدد المرحلة التي تريد عرض الصفوف الخاصة بها.
        </PageHeaderDescription>
      </PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <Link href={`/stage/${stage.slug}`} key={stage.slug} className="group">
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <stage.icon className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-center">{stage.name}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
