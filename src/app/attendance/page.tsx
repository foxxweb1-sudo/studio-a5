import AttendanceRecorder from "@/components/features/attendance/AttendanceRecorder";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <PageHeaderTitle>تسجيل الحضور</PageHeaderTitle>
        <PageHeaderDescription>
          أدخل كود الطالب أو امسح QR Code لتسجيل حضوره.
        </PageHeaderDescription>
      </PageHeader>
      <AttendanceRecorder />
       <div className="mt-4">
        <Button variant="link" asChild className="p-0">
          <Link href="/">
            <ArrowRight className="ms-2 h-4 w-4" />
            العودة إلى لوحة التحكم
          </Link>
        </Button>
      </div>
    </div>
  );
}
