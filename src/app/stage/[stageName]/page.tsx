'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const stageData: Record<string, { name: string; grades: string[] }> = {
  primary: {
    name: 'المرحلة الابتدائية',
    grades: [
      'الصف الأول الابتدائي',
      'الصف الثاني الابتدائي',
      'الصف الثالث الابتدائي',
      'الصف الرابع الابتدائي',
      'الصف الخامس الابتدائي',
      'الصف السادس الابتدائي',
    ],
  },
  preparatory: {
    name: 'المرحلة الإعدادية',
    grades: ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي'],
  },
  secondary: {
    name: 'المرحلة الثانوية',
    grades: ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'],
  },
};

export default function StagePage() {
  const router = useRouter();
  const params = useParams();
  const stageName = params.stageName as string;
  const stage = stageData[stageName];

  if (!stage) {
    // Handle invalid stage name, maybe redirect to home or show a 404
    if (typeof window !== 'undefined') {
       router.push('/');
    }
    return null; // Or a loading/error component
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader>
        <PageHeaderTitle>{stage.name}</PageHeaderTitle>
        <PageHeaderDescription>اختر الصف لعرض التفاصيل.</PageHeaderDescription>
      </PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stage.grades.map((grade) => (
          <Link href="#" key={grade}>
            <Card className="hover:shadow-lg hover:border-primary transition-all duration-300">
              <CardContent className="flex items-center justify-between p-6">
                <h3 className="text-lg font-semibold">{grade}</h3>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
       <div className="mt-4">
        <Link href="/" className="text-primary hover:underline">
          &larr; العودة إلى المراحل الدراسية
        </Link>
      </div>
    </div>
  );
}
