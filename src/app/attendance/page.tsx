'use client';

import AttendanceRecorder from "@/components/features/attendance/AttendanceRecorder";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AttendancePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>تسجيل الحضور</PageHeaderTitle>
          <PageHeaderDescription>
            أدخل كود الطالب أو امسح QR Code لتسجيل حضوره.
          </PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" asChild className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all">
          <Link href="/">
            <ArrowLeft className="ms-2 h-4 w-4" />
            رجوع
          </Link>
        </Button>
      </div>
      <AttendanceRecorder />
    </div>
  );
}
