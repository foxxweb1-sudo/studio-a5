import StudentManagement from "@/components/features/students/StudentManagement";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function StudentManagementPage() {
  return (
    <div className="flex flex-col gap-4">
       <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>إدارة الطلاب</PageHeaderTitle>
          <PageHeaderDescription>
            إضافة طلاب جدد، تعديل بياناتهم، وعرض أكوادهم الخاصة.
          </PageHeaderDescription>
        </PageHeader>
         <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="ms-2 h-4 w-4" />
            العودة للرئيسية
          </Link>
        </Button>
      </div>
      <StudentManagement />
    </div>
  )
}

export default function StudentsPage() {
  return (
    <Suspense>
      <StudentManagementPage />
    </Suspense>
  );
}
