'use client';

import AccountManagement from '@/components/features/account/AccountManagement';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <PageHeader>
          <PageHeaderTitle>إدارة الحساب</PageHeaderTitle>
          <PageHeaderDescription>
            قم بتحديث معلومات ملفك الشخصي وكلمة المرور.
          </PageHeaderDescription>
        </PageHeader>
        <Button 
          variant="outline" 
          asChild
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
        >
          <Link href="/">
            <ArrowLeft className="ms-2 h-4 w-4" />
            رجوع
          </Link>
        </Button>
      </div>
      <AccountManagement />
    </div>
  );
}
