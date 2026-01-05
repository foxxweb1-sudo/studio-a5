import ReportsDashboard from "@/components/features/reports/ReportsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


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
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="ms-2 h-4 w-4" />
            العودة للرئيسية
          </Link>
        </Button>
      </div>
      <ReportsDashboard />
    </div>
  );
}
