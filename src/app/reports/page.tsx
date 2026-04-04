'use client';

import ReportsDashboard from "@/components/features/reports/ReportsDashboard";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


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
        <Button variant="outline" asChild className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all">
          <Link href="/">
            <ArrowLeft className="ms-2 h-4 w-4" />
            رجوع
          </Link>
        </Button>
      </div>
      <ReportsDashboard />
    </div>
  );
}
