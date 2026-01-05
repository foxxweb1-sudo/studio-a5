'use client';

import PaymentsDashboard from "@/components/features/payments/PaymentsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


export default function PaymentsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
       <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>إدارة المدفوعات</PageHeaderTitle>
          <PageHeaderDescription>
            تتبع مدفوعات الطلاب واعرض الرسوم المستحقة.
          </PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="ms-2 h-4 w-4" />
             رجوع
        </Button>
      </div>
      <PaymentsDashboard />
    </div>
  )
}
