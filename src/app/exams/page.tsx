
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ExamDashboard from '@/components/features/exams/ExamDashboard';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award } from 'lucide-react';

function ExamsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gradeFromUrl = searchParams.get('grade') || '';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <PageHeader className="border-0 pb-0">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
               <Award className="h-6 w-6" />
            </div>
            <PageHeaderTitle className="text-3xl font-black">إدارة الإمتحانات</PageHeaderTitle>
          </div>
          <PageHeaderDescription>
            {gradeFromUrl ? `تسجيل ومتابعة درجات صف: ${gradeFromUrl}` : 'سجل درجات الطلاب وتابع تقدمهم الأكاديمي.'}
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 h-12 px-6 font-bold"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
      
      <ExamDashboard gradeFilter={gradeFromUrl} />
    </div>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">جاري تحميل لوحة الامتحانات...</div>}>
      <ExamsPageContent />
    </Suspense>
  );
}
