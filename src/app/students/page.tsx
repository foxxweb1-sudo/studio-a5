import StudentManagement from "@/components/features/students/StudentManagement";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";

export default function StudentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <PageHeaderTitle>إدارة الطلاب</PageHeaderTitle>
        <PageHeaderDescription>
          إضافة طلاب جدد، تعديل بياناتهم، وعرض أكوادهم الخاصة.
        </PageHeaderDescription>
      </PageHeader>
      <StudentManagement />
    </div>
  );
}
