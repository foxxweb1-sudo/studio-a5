'use client';

import StudentManagement from "@/components/features/students/StudentManagement";
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";


function StudentManagementPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
       <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>إدارة الطلاب</PageHeaderTitle>
          <PageHeaderDescription>
            إضافة طلاب جدد، تعديل بياناتهم، وعرض أكوادهم الخاصة.
          </PageHeaderDescription>
        </PageHeader>
         <Button variant="outline" onClick={() => router.back()} type="button">
            <ArrowLeft className="ms-2 h-4 w-4" />
            رجوع
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
