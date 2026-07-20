'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * صفحة إزالة الإعلانات - تم تعطيلها بعد إزالة نظام الإعلانات بالكامل
 */
export default function RemoveAdsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/settings');
  }, [router]);

  return null;
}
