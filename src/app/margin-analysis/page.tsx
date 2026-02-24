'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingCentered } from '@/components/ui/Loading';

/**
 * 마진 분석 페이지는 판매 내역 페이지로 통합되었습니다.
 * 자동으로 판매 내역 페이지로 리다이렉트합니다.
 */
export default function MarginAnalysisRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 판매 내역 페이지로 리다이렉트
    router.replace('/sales');
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingCentered size="lg" />
        <p className="text-gray-600 mt-4">판매 내역 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
