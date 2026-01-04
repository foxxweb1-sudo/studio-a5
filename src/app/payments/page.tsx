import PaymentsDashboard from "@/components/features/payments/PaymentsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <PageHeaderTitle>إدارة المدفوعات</PageHeaderTitle>
        <PageHeaderDescription>
          تتبع مدفوعات الطلاب واعرض الرسوم المستحقة.
        </PageHeaderDescription>
      </PageHeader>
      <PaymentsDashboard />
    </div>
  )
}
