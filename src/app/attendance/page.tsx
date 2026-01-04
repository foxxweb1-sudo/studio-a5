import AttendanceRecorder from "@/components/features/attendance/AttendanceRecorder";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";

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
    </div>
  );
}
