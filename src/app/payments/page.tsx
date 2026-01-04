import PaymentsDashboard from "@/components/features/payments/PaymentsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


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
        <Button variant="link" asChild className="p-0">
          <Link href="/">
            <ArrowRight className="ms-2 h-4 w-4" />
            العودة إلى لوحة التحكم
          </Link>
        </Button>
      </div>
      <PaymentsDashboard />
    </div>
  )
}
