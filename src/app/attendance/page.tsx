
'use client';

import AttendanceRecorder from "@/components/features/attendance/AttendanceRecorder";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AttendancePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>تسجيل الحضور</PageHeaderTitle>
          <PageHeaderDescription>
            أدخل كود الطالب أو امسح QR Code لتسجيل حضوره.
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
        >
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
      <AttendanceRecorder />
    </div>
  );
}
