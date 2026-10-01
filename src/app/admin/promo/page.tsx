'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPromoCodesPage() {
  const router = useRouter();
  useEffect(() => { router.push('/admin'); }, [router]);
  return null;
}