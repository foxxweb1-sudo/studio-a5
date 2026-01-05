import PaymentsDashboard from "@/components/features/payments/PaymentsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-4">
       <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>إدارة المدفوعات</PageHeaderTitle>
          <PageHeaderDescription>
            تتبع مدفوعات الطلاب واعرض الرسوم المستحقة.
          </PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="ms-2 h-4 w-4" />
             العودة للرئيسية
          </Link>
        </Button>
      </div>
      <PaymentsDashboard />
    </div>
  )
}
