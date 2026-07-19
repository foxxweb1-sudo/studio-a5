
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BlogPage() {
  const router = useRouter();
  useEffect(() => { router.push('/'); }, [router]);
  return null;
}
