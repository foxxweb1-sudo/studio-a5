'use client';

import AccountManagement from '@/components/features/account/AccountManagement';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>إدارة الحساب</PageHeaderTitle>
          <PageHeaderDescription>
            قم بتحديث معلومات ملفك الشخصي وكلمة المرور.
          </PageHeaderDescription>
        </PageHeader>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="ms-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
      <AccountManagement />
    </div>
  );
}
