import ReportsDashboard from "@/components/features/reports/ReportsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <PageHeaderTitle>تقارير الحضور</PageHeaderTitle>
        <PageHeaderDescription>
          عرض تقارير الغياب اليومية وتحليلات الحضور الأسبوعية.
        </PageHeaderDescription>
      </PageHeader>
      <ReportsDashboard />
    </div>
  );
}
