
'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    if (typeof window !== 'undefined') {
       router.push('/');
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>{stage.name}</PageHeaderTitle>
          <PageHeaderDescription>اختر الصف لعرض لوحة التحكم الخاصة به.</PageHeaderDescription>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stage.grades.map((grade) => (
          <button 
            key={grade}
            onClick={() => router.push(`/stage/${stageName}/${encodeURIComponent(grade)}`)}
            className="group text-right"
          >
            <Card className="hover:shadow-xl hover:border-primary/50 transition-all duration-300 rounded-2xl border bg-white dark:bg-slate-900">
              <CardContent className="flex items-center justify-between p-6">
                <h3 className="text-lg font-bold">{grade}</h3>
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
