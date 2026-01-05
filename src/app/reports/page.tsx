'use client';

import ReportsDashboard from "@/components/features/reports/ReportsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


export default function ReportsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>تقارير الحضور</PageHeaderTitle>
          <PageHeaderDescription>
            عرض تقارير الغياب اليومية وتحليلات الحضور الأسبوعية.
          </PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
      <ReportsDashboard />
    </div>
  );
}
