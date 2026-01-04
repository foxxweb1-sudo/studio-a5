import ReportsDashboard from "@/components/features/reports/ReportsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>تقارير الحضور</PageHeaderTitle>
          <PageHeaderDescription>
            عرض تقارير الغياب اليومية وتحليلات الحضور الأسبوعية.
          </PageHeaderDescription>
        </PageHeader>
        <Button variant="link" asChild className="p-0">
          <Link href="/">
            <ArrowRight className="ms-2 h-4 w-4" />
            العودة إلى لوحة التحكم
          </Link>
        </Button>
      </div>
      <ReportsDashboard />
    </div>
  );
}
