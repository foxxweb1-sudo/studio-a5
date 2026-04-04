
'use client';

import PaymentsDashboard from "@/components/features/payments/PaymentsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function PaymentsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gradeFromUrl = searchParams.get('grade') || '';

  return (
    <div className="flex flex-col gap-4">
       <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>إدارة المدفوعات</PageHeaderTitle>
          <PageHeaderDescription>
            {gradeFromUrl ? `عرض مدفوعات صف: ${gradeFromUrl}` : 'تتبع مدفوعات الطلاب واعرض الرسوم المستحقة.'}
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
      <PaymentsDashboard gradeFilter={gradeFromUrl} />
    </div>
  )
}


export default function PaymentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentsPageContent />
    </Suspense>
  );
}
