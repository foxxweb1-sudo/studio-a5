'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * تم حذف نظام الأكواد بالكامل.
 */
export default function AdminPromoCodesPage() {
  const router = useRouter();
  useEffect(() => { router.push('/admin'); }, [router]);
  return null;
}
